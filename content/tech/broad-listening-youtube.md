---
title: "AIでYouTubeのコメントを分析した話 ── ブロードリスニングを実践してみた"
date: "2025-07-13"
category: "tech"
tags: ["AI", "YouTube", "ソーシャルリスニング", "Talk to the city", "ブロードリスニング", "Python"]
status: "published"
description: "ビジネスコンテストで顧客インサイトが欲しくて、YouTubeのコメントをAI（Talk to the city）で分析してみた。環境構築からエラー格闘まで全部記録。"
---

ビジネスコンテストに参加するようになって、「顧客のインサイトを安く・早く掴む方法はないか」とずっと考えていた。

ヒアリングは時間もお金もかかる。そこで思い出したのが、チームみらいの安野さんが取り組んでいた**「ブロードリスニング」**という手法だ。

SNSから顧客の声を集められるんじゃないか？　と思って試してみた記録を残しておく。

---

## ブロードリスニングとは？

オードリー・タンさんが広めた言葉で、簡単に言うと「**広く意見を聞き入れること**」だ。

現在の政治はトップダウン（政治家が政策を決めて発信する）型。ブロードリスニングはその逆で、ボトムアップ（民意を広く集めて政策に反映する）型のアプローチだ。

> やたらめったらに意見を集めるとパンクするので、テクノロジーの力で上手に処理しましょうという考え方。最初に聞いたとき「これは素晴らしいな」と思った。

ちなみに厳密に言うと、俺がやろうとしているのはブロードリスニングというより「**ソーシャルリスニング**」という言葉のほうが近い。ソーシャルメディアから顧客の声を収集・分析してマーケティングに活かす手法だ。

---

## 使ったツール

### Talk to the city

ブロードリスニングを実現するためのOSSツール。アメリカのNPO法人「AI Objectives Institute」が提供している。

LLMを使って「データの抽出 → 埋め込み → クラスタリング → ラベリング → 要点まとめ → 概要まとめ」を自動で行ってくれる。オープンソースなので誰でも無料で使える。

今回はOpenAIの `gpt-4o-mini` を使用した。

### YouTube Data API

YouTubeの公開データにアクセスするためのAPI。1日の使用上限はデフォルトで1プロジェクトあたり**10,000ユニット**。1ユニットで100件のコメントが取得できるので、コメント取得だけならかなりの量を分析できる。

---

## 全体の流れ

1. **データ取得** ── Google ColabでYouTube APIからコメントをCSVに保存
2. **環境構築** ── Talk to the city をセットアップ
3. **データ分析** ── Python パイプラインを実行、LLMでコメントを抽出・分析
4. **結果の可視化** ── 分析結果をWebページで確認

---

## Step 1：SNSの選定

最初はXからデータを取れないか調べた。が、すぐに諦めた。API利用料が高い上に利用規約が厳しい。InstagramやTikTokも同様の理由でアウト。

**YouTubeに目をつけた。** YouTube Data APIは無料で使えて規約も比較的緩い。今回の検証にちょうどいいと判断した。

## Step 2：Google ColabでYouTubeコメントを取得

環境構築不要でPythonが動かせる[Google Colab](https://colab.google/)を使う。

まずライブラリのインストール。

```python
!pip install google-api-python-client pandas
```

次に以下のコードで指定したYouTube動画からコメントを全取得し、`example-polis.csv` として保存する。

```python
import os, re
import pandas as pd
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.colab import files

API_KEY = "ここにAPIキーを入力"
VIDEO_URL = "ここにYouTube URLを入力"

def get_video_id_from_url(url):
    patterns = [
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None

def get_all_comments(youtube, video_id):
    comments = []
    req = youtube.commentThreads().list(
        part="snippet,replies", videoId=video_id,
        maxResults=100, textFormat="plainText"
    )
    while req:
        res = req.execute()
        for item in res["items"]:
            top = item["snippet"]["topLevelComment"]["snippet"]
            comments.append({"author": top["authorDisplayName"], "text": top["textDisplay"]})
        req = youtube.commentThreads().list_next(req, res)
    return comments

youtube = build("youtube", "v3", developerKey=API_KEY)
comments = get_all_comments(youtube, get_video_id_from_url(VIDEO_URL))

df = pd.DataFrame(comments)
out = pd.DataFrame()
out['comment-id'] = range(1, len(df) + 1)
out['comment-body'] = df['text']
out.to_csv('example-polis.csv', index=False, encoding='utf-8-sig')
files.download('example-polis.csv')
```

実行すると `example-polis.csv` が自動でダウンロードされる。

![CSVファイルの中身](/images/n1335257b8dca_1752380821-L56t039Vmav7oDOzUXNJgFyq.png)

---

## Step 3：Talk to the city のセットアップ

ターミナルでリポジトリをクローン。

```bash
git clone https://github.com/AIObjectives/talk-to-the-city-reports.git
```

取得した `example-polis.csv` を `scatter/pipeline/inputs/` に置く。

`pipeline/configs/example-polis.json` を自分の設定に合わせて修正する。

```json
{
  "name": "Recursive Public, Agenda Setting",
  "question": "AI研究の第一人者たちの国会での議論の内容を視聴者はどのように捉えたか？",
  "input": "example-polis",
  "model": "gpt-4o-mini",
  "extraction": { "workers": 1, "limit": 100 },
  "clustering": { "clusters": 5 },
  "translation": { "model": "gpt-4o-mini", "languages": ["Japanese"], "flags": ["JP"] }
}
```

仮想環境を作って依存パッケージをインストール。

```bash
cd talk-to-the-city-reports/scatter
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('stopwords')"
export OPENAI_API_KEY="sk-proj-XXXXXXXXXX"
```

---

## Step 4：パイプラインを実行

```bash
cd ./pipeline
python main.py configs/example-polis.json
```

---

## エラーとの格闘（ここが一番大変だった）

### エラー① ロックファイルが残る問題

2回目以降に「Job already running」エラーが出て動かなくなった。前回の実行でロックファイルが残っていたのが原因。

```bash
rm -rf outputs/example-polis
```

このコマンドで毎回クリーンにしてから実行するのが安全。

### エラー② ライブラリのバージョン不整合

`pip install -r requirements.txt` でインストールしたパッケージのバージョンが合わず、`ImportError` が連続発生。

```bash
pip install --upgrade huggingface-hub
pip install --upgrade sentence-transformers
```

これで解決した。

### エラー③ LLMへのプロンプトが悪い

extraction（意見抽出）の工程で、LLMが指定した形式のJSONを返してくれなかった。抽出データが空になったり、プログラムが解釈できない形式が返ってきたりした。

原因はプロンプトが曖昧だったこと。`pipeline/prompts/extraction/default.txt` を以下のプロンプトに書き換えて解決した。

```
/system
あなたは一流のプロフェッショナルリサーチアシスタントです。

**必ず以下のルールに従ってください：**
1. 可能な限り1つの中心的なトピックに要約。明確に異なる複数の意見がある場合のみ個別に抽出。
2. 抽出する意見は単体で意味が通じるよう自己完結させる。
3. 応答は必ず `[{"arg-id": "...", "argument": "..."}]` 形式のJSONのみ。
4. `arg-id` は `A<コメントIndex>_<意見Index>` の形式（例：A0_0）。
5. JSONの前後に説明文や会話文を一切含めない。`[` で始まり `]` で終わること。

/human
コメント（インデックス9）: 「田中さんのお話が聞きやすくて良かった！ChatGPTが登場してから、AIのない世界には戻れないと感じています。日本がAI開発でルールを整えれば、優秀な研究者が集まる可能性もある。」

/ai
[{"arg-id": "A9_0", "argument": "AIは既に不可欠な存在であり、日本は倫理・ルール整備を丁寧に進めることで信頼性の高いAIを開発し世界をリードできる可能性があるため、AI推進法案に期待している"}]
```

ポイントは「ルールの絶対化」「厳格な形式指定」「ヒューショット（手本）の導入」の3つ。

---

## Step 5：結果の確認

パイプラインが完走すると `scatter/pipeline/outputs/example-polis/report/index.html` が生成される。

```bash
cd ../next-app
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開くと分析結果がビジュアルで確認できる。

![分析結果の可視化画面](/images/n1335257b8dca_1752391025-2bHc7N19Uhg5DFLouPCsYBTp.png)

![コメントのクラスタリング結果](/images/n1335257b8dca_1752391028-Vquei17g89AmRHBFb3nws2DJ.png)

---

## まとめ

OSSツールを実際に動かしたのがほぼ初めての経験で、純粋に面白かった。

「顧客インサイトを探る」という当初の目的の本検証はこれから。でも「この手法は使える」という手応えは十分に感じた。

今後はよりシンプルに、「調べたい業界やキーワードを入力するだけでYouTubeや他のSNSから情報を取得・分析してくれるアプリ」を作れたらと考えている。

> ちなみに今回のコーディングはほぼGeminiに任せた。俺は1行もコードを書いていない笑。初心者でも「何をやりたいか」の道筋さえ立てれば、Geminiが丁寧に教えてくれる。まずやってみることが一番大事な時代だと改めて感じた。

何かしらのアプリを一個作ってみると、AIの力強さが体感できると思う。ぜひ試してほしい。
