import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllArticles, getArticleBySlug } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug.replace(/\//g, "%2F") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(decodeURIComponent(slug)).catch(() => null);
  if (!article) return {};
  return { title: `${article.title} | JARVIS` };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticleBySlug(decodeURIComponent(slug));
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 md:px-12 py-16">
        <div className="max-w-[720px] mx-auto">

          {/* トップに戻るリンク */}
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground transition-colors mb-10"
          >
            <span aria-hidden>←</span>
            記事一覧へ
          </Link>

          {/* メタ情報 */}
          <header className="mb-10 pb-8 border-b border-border">
            <div className="flex items-center gap-2 mb-4 text-xs text-muted tracking-widest uppercase">
              <span>{article.category}</span>
              <span className="text-border">·</span>
              <time dateTime={article.date}>{article.date}</time>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-snug text-foreground mb-5">
              {article.title}
            </h1>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted border border-border px-2 py-0.5 rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 本文 */}
          <article
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

        </div>
      </main>

      <Footer />
    </div>
  );
}
