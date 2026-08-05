import type { MetadataRoute } from 'next'

const slugs = ['devprint', 'ascend', 'elucya-talk', 'agora-global', 'kairos-labs']

export default function sitemap(): MetadataRoute.Sitemap {
  const solucoes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `https://kairoslabs.com.br/solucoes/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://kairoslabs.com.br',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: 'https://kairoslabs.com.br/solucoes',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...solucoes,
  ]
}
