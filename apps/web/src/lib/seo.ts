import type { Metadata } from 'next'

const SITE_NAME = 'Perantau Global'
const SITE_URL = 'https://dayatalentaglobal.id'

// Paths that exist in both locales (shared pages)
const SHARED_PATHS = new Set(['', 'layanan', 'services', 'tentang', 'about', 'kontak', 'contact'])

interface GenerateMetaParams {
  title: string
  description: string
  locale: 'id' | 'en'
  path?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
}

export function generateMeta({
  title,
  description,
  locale,
  path: pagePath = '',
  image = '/og-default.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: GenerateMetaParams): Metadata {
  const url = `${SITE_URL}/${locale}${pagePath ? `/${pagePath}` : ''}`
  const fullTitle = `${title} | ${SITE_NAME}`
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`

  // Only emit hreflang alternates for pages that exist in both locales
  const isSharedPage = SHARED_PATHS.has(pagePath)
  const alternates: Metadata['alternates'] = {
    canonical: url,
    ...(isSharedPage && {
      languages: {
        id: `${SITE_URL}/id${pagePath ? `/${pagePath}` : ''}`,
        en: `${SITE_URL}/en${pagePath ? `/${pagePath}` : ''}`,
      },
    }),
  }

  return {
    title: fullTitle,
    description,
    alternates,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      ...(isSharedPage && {
        alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
      }),
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
