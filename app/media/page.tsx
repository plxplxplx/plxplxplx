// app/artiklar/page.tsx
import { fetchArticles } from '../lib/fetchArticles'
import ArticleTable from '../components/ArticleTable'

export default async function ArticlesPage() {
  const articles = await fetchArticles()

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Artiklar</h1>
      <ArticleTable articles={articles} />
    </main>
  )
}
