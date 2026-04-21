import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export function getContentBySlug(type: 'blog' | 'services' | 'destinations', locale: string, slug: string) {
  const filePath = path.join(process.cwd(), 'content', type, locale, `${slug}.mdx`)
  const source = fs.readFileSync(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(source)
  return { frontmatter, content, readingTime: readingTime(content) }
}

export function getAllContent(type: 'blog' | 'services' | 'destinations', locale: string, category?: string) {
  const dir = path.join(process.cwd(), 'content', type, locale)
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
  const items = files.map(filename => {
    const slug = filename.replace('.mdx', '')
    const { frontmatter, readingTime: rt } = getContentBySlug(type, locale, slug)
    return { slug, readingTime: rt, ...frontmatter as Record<string, unknown> }
  })
  if (category && category !== 'all') {
    return items.filter(item => (item as Record<string, unknown>).category === category)
  }
  return items
}

export function getCategories(type: 'blog' | 'services' | 'destinations', locale: string): string[] {
  const items = getAllContent(type, locale)
  const categories = new Set(items.map(item => (item as Record<string, unknown>).category as string).filter(Boolean))
  return Array.from(categories)
}
