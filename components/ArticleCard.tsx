import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";

type Props = {
  article: ArticleMeta;
};

export default function ArticleCard({ article }: Props) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block group border border-border bg-card rounded-sm px-6 py-5 hover:border-accent transition-colors duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted tracking-widest uppercase">{article.category}</span>
        <span className="text-border">·</span>
        <time className="text-xs text-muted">{article.date}</time>
      </div>
      <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">
        {article.title}
      </h3>
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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
    </Link>
  );
}
