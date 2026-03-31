import { getAllArticles } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

export default function Home() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto">

          {/* 自己紹介 */}
          <section className="mb-16">
            <h1 className="font-serif text-4xl font-semibold tracking-wide mb-6 text-foreground">
              About
            </h1>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/80 border-l-2 border-accent pl-5">
              <p>エンジニア。コードと思想のあいだを往来しながら、日々の考えを記録している。</p>
              <p>主な関心はソフトウェア設計、哲学、そして言語そのものの構造。</p>
              <p>このサイトは個人的なメモと、世界への問いを置いておく場所。</p>
            </div>
          </section>

          {/* 最新記事 */}
          <section>
            <h2 className="font-serif text-2xl font-semibold tracking-wide mb-8 text-foreground">
              最新記事
            </h2>

            {articles.length === 0 ? (
              <p className="text-muted text-sm">まだ記事がありません。</p>
            ) : (
              <div className="grid gap-4">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
