import { getAllArticles } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

export const metadata = {
  title: "記事一覧 | JARVIS",
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl font-semibold tracking-wide mb-10 text-foreground">
            記事一覧
          </h1>

          {articles.length === 0 ? (
            <p className="text-muted text-sm">まだ記事がありません。</p>
          ) : (
            <div className="grid gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
