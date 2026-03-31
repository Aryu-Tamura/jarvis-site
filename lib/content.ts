import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { markdownToHtml } from "./markdown";

const contentDir = path.join(process.cwd(), "content");

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  status: "draft" | "in-progress" | "published";
};

export type Article = ArticleMeta & {
  contentHtml: string;
};

function getMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return getMdFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
      return [];
    });
}

function fileToSlug(filePath: string): string {
  const relative = path.relative(contentDir, filePath);
  return relative.replace(/\.md$/, "");
}

export function getAllArticles(): ArticleMeta[] {
  const files = getMdFiles(contentDir);

  const articles = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      slug: fileToSlug(filePath),
      title: data.title as string,
      date: data.date as string,
      category: data.category as string,
      tags: (data.tags as string[]) ?? [],
      status: data.status as ArticleMeta["status"],
    };
  });

  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  const filePath = path.join(contentDir, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const contentHtml = await markdownToHtml(content);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    category: data.category as string,
    tags: (data.tags as string[]) ?? [],
    status: data.status as ArticleMeta["status"],
    contentHtml,
  };
}
