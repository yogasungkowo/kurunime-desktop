import type { ChapterData, Comic, ComicChapter, ComicDetail, ComicGenre } from '../types/comic'

const getBaseUrl = () => {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_comic_api') : null
  const raw = custom || import.meta.env.VITE_COMIC_API_URL || 'https://manga-api.prasunk.my.id'
  return raw.replace(/\/$/, '')
}

export function extractChapterNumber(slugOrNum: string | number): string {
  if (typeof slugOrNum === 'number') return String(slugOrNum)
  const s = String(slugOrNum).trim()
  if (/^\d+(\.\d+)?$/.test(s)) return s
  const match = s.match(/(?:chapter|ch)[-_]?(\d+)(?:[-_.](\d+))?/i)
  if (match) {
    if (match[2]) return `${match[1]}.${match[2]}`
    return match[1]
  }
  const genericMatch = s.match(/(\d+)(?:[-_.](\d+))?/)
  if (genericMatch) {
    if (genericMatch[2]) return `${genericMatch[1]}.${genericMatch[2]}`
    return genericMatch[1]
  }
  return s
}

export function parseChapterSlug(param: string): { mangaSlug: string; chapterNumber: string } {
  const s = decodeURIComponent(param || '').trim()
  const sepIdx = s.lastIndexOf('-chapter-')
  if (sepIdx !== -1) {
    const mangaSlug = s.substring(0, sepIdx)
    const rawNumber = s.substring(sepIdx + 9)
    const chapterNumber = rawNumber.replace('-', '.')
    return { mangaSlug, chapterNumber }
  }

  const chIdx = s.lastIndexOf('-ch-')
  if (chIdx !== -1) {
    const mangaSlug = s.substring(0, chIdx)
    const rawNumber = s.substring(chIdx + 4)
    const chapterNumber = rawNumber.replace('-', '.')
    return { mangaSlug, chapterNumber }
  }

  return { mangaSlug: s, chapterNumber: '1' }
}

export function fullCover(url: string): string {
  if (!url) return ''
  return url.replace(/([?&])resize=(\d+),\d+/i, '$1w=$2')
}

export function mapListComic(item: any): Comic {
  if (!item) return {} as Comic

  const genres: string[] = Array.isArray(item.genres)
    ? item.genres.map((g: any) => (typeof g === 'string' ? g : (g.name || g.slug || ''))).filter(Boolean)
    : []

  const lastChap = item.last_chapter || item.latest_chapter || item.first_chapter
  const chapterStr =
    typeof item.chapter === 'string' && item.chapter
      ? item.chapter
      : lastChap?.title ||
        (lastChap?.chapter_number
          ? `Chapter ${lastChap.chapter_number}`
          : lastChap?.number
          ? `Chapter ${lastChap.number}`
          : '')

  const rawRating = item.rating || item.score || 0
  const rating = typeof rawRating === 'number' ? rawRating : parseFloat(String(rawRating)) || 0

  return {
    id: item.id || item.slug,
    slug: item.slug || '',
    title: item.title || item.name || '',
    poster: fullCover(item.poster || item.image || item.thumbnail || item.cover || ''),
    type: item.type || '',
    status: item.status || '',
    rating,
    chapter: chapterStr,
    updatedAt: item.updated_at || item.date || lastChap?.created_at || item.created_at || item.time_ago || '',
    genres,
    synopsis: item.synopsis || item.description || '',
    author: item.author && item.author !== '-' ? item.author : '',
    artist: item.artist && item.artist !== '-' ? item.artist : '',
    releaseYear: item.release_year || null,
    viewsCount:
      typeof item.views_count === 'number'
        ? item.views_count
        : typeof item.views === 'number'
        ? item.views
        : 0,
  }
}

function extractList(res: any): any[] {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data?.mangas)) return res.data.mangas
  if (Array.isArray(res.data?.rankings)) return res.data.rankings
  if (Array.isArray(res.data?.results)) return res.data.results
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.mangas)) return res.mangas
  if (Array.isArray(res.rankings)) return res.rankings
  if (Array.isArray(res.results)) return res.results
  if (Array.isArray(res.comics)) return res.comics
  return []
}

export const comicApi = {
  async getLatestComics(page = 1, type?: string): Promise<Comic[]> {
    try {
      const params = new URLSearchParams({ page: String(page), order: 'update', sort: 'update' })
      if (type && type !== 'All') {
        params.append('type', type.toLowerCase())
      }
      const res = await fetch(`${getBaseUrl()}/manga?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      return extractList(data).map(mapListComic)
    } catch (err) {
      console.error('Failed to fetch latest comics:', err)
      return []
    }
  },

  async getPopularComics(page = 1): Promise<Comic[]> {
    try {
      if (page === 1) {
        const rankRes = await fetch(`${getBaseUrl()}/ranking`).catch(() => null)
        if (rankRes && rankRes.ok) {
          const rankData = await rankRes.json()
          const list = extractList(rankData)
          if (list.length > 0) {
            return list.map(mapListComic)
          }
        }
      }

      const res = await fetch(`${getBaseUrl()}/manga?page=${page}&order=popular&sort=popular`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      return extractList(data).map(mapListComic)
    } catch (err) {
      console.error('Failed to fetch popular comics:', err)
      return []
    }
  },

  async getComicDetail(slug: string): Promise<ComicDetail | null> {
    try {
      const res = await fetch(`${getBaseUrl()}/manga/${slug}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const data = json?.data || json
      if (!data || !data.title) return null

      const chapters: ComicChapter[] = (data.chapters || []).map((c: any) => {
        const num = c.number ?? c.chapter_number ?? extractChapterNumber(c.slug || c.title || '')
        return {
          id: c.id,
          slug: c.slug || `${slug}-chapter-${num}`,
          title: c.title || `Chapter ${num}`,
          chapter: c.title || `Chapter ${num}`,
          chapterNumber: num,
          date: c.date || c.created_at || c.updated_at || '',
        }
      })

      chapters.sort((a, b) => {
        const numA = typeof a.chapterNumber === 'number' ? a.chapterNumber : parseFloat(String(a.chapterNumber))
        const numB = typeof b.chapterNumber === 'number' ? b.chapterNumber : parseFloat(String(b.chapterNumber))
        const validA = !Number.isNaN(numA)
        const validB = !Number.isNaN(numB)
        if (validA && validB) return numB - numA
        if (validA) return -1
        if (validB) return 1
        return 0
      })

      const genres: string[] = Array.isArray(data.genres)
        ? data.genres.map((g: any) => (typeof g === 'string' ? g : g.name || g.slug || '')).filter(Boolean)
        : []

      const recs = data.related_mangas || data.recommendations || data.similar_manga || []
      const recommendations: Comic[] = recs.map(mapListComic)

      return {
        id: data.id || data.slug || slug,
        slug: data.slug || slug,
        title: data.title || '',
        poster: fullCover(data.poster || data.image || data.thumbnail || data.cover || ''),
        type: data.type || '',
        status: data.status || '',
        rating: typeof data.rating === 'number' ? data.rating : parseFloat(data.rating || data.score || '0') || 0,
        synopsis: data.synopsis || data.description || '',
        genres,
        author: data.author && data.author !== '-' ? data.author : '',
        artist: data.artist && data.artist !== '-' ? data.artist : '',
        released: data.release_year || '',
        updatedAt: data.updated_at || chapters[0]?.date || '',
        viewsCount: data.views_count || (typeof data.views === 'number' ? data.views : 0),
        chapters,
        recommendations,
        sourceUrl: data.source_url || '',
        firstChapter: data.first_chapter || null,
        rank: data.rank ?? data.manga_rank ?? null,
      } as ComicDetail
    } catch (err) {
      console.error(`Failed to fetch comic detail ${slug}:`, err)
      return null
    }
  },

  async getChapter(slugOrMangaSlug: string, chapterNumberParam?: string | number): Promise<ChapterData | null> {
    try {
      let mangaSlug = slugOrMangaSlug
      let chapterNumber = chapterNumberParam ? String(chapterNumberParam) : ''

      if (!chapterNumber) {
        const parsed = parseChapterSlug(slugOrMangaSlug)
        mangaSlug = parsed.mangaSlug
        chapterNumber = parsed.chapterNumber
      } else {
        chapterNumber = extractChapterNumber(chapterNumber)
      }

      let res = await fetch(`${getBaseUrl()}/manga/${mangaSlug}/chapter/${chapterNumber}`).catch(() => null)
      if (!res || !res.ok) {
        res = await fetch(`${getBaseUrl()}/manga/${mangaSlug}/${slugOrMangaSlug}`).catch(() => null)
      }
      if (!res || !res.ok) return null

      const json = await res.json()
      const d = json?.data
      if (!d) return null

      const chap = d.chapter || {}
      const manga = d.manga || {}

      const rawImages = d.images || chap.images || []
      const images: string[] = Array.isArray(rawImages)
        ? rawImages.map((img: any) => (typeof img === 'string' ? img : img.url || img.src || '')).filter(Boolean)
        : []

      const rawAllChapters = d.all_chapters || d.allChapters || []
      const allChapters = rawAllChapters.map((c: any) => {
        const num = c.chapter_number ?? c.number ?? extractChapterNumber(c.slug || c.title || '')
        return {
          id: c.id,
          slug: c.slug || `${manga.slug || mangaSlug}-chapter-${num}`,
          title: c.title || `Chapter ${num}`,
          chapterNumber: num,
        }
      })

      allChapters.sort((a: any, b: any) => {
        const numA = typeof a.chapterNumber === 'number' ? a.chapterNumber : parseFloat(String(a.chapterNumber))
        const numB = typeof b.chapterNumber === 'number' ? b.chapterNumber : parseFloat(String(b.chapterNumber))
        const validA = !Number.isNaN(numA)
        const validB = !Number.isNaN(numB)
        if (validA && validB) return numB - numA
        if (validA) return -1
        if (validB) return 1
        return 0
      })

      let prevChapter: string | null = null
      let nextChapter: string | null = null

      if (d.prev?.slug) {
        prevChapter = d.prev.slug
      } else if (d.prev_url) {
        prevChapter = d.prev_url.split('/').filter(Boolean).pop() || null
      } else if (d.prev?.chapter_number !== undefined && d.prev?.chapter_number !== null) {
        prevChapter = `${manga.slug || mangaSlug}-chapter-${d.prev.chapter_number}`
      }

      if (d.next?.slug) {
        nextChapter = d.next.slug
      } else if (d.next_url) {
        nextChapter = d.next_url.split('/').filter(Boolean).pop() || null
      } else if (d.next?.chapter_number !== undefined && d.next?.chapter_number !== null) {
        nextChapter = `${manga.slug || mangaSlug}-chapter-${d.next.chapter_number}`
      }

      return {
        slug: d.chapter_slug || chap.slug || `${manga.slug || mangaSlug}-chapter-${chapterNumber}`,
        title: chap.title || d.title || `Chapter ${chapterNumber}`,
        chapterNumber: d.chapter_number || chap.chapter_number || chapterNumber,
        images,
        prevChapter,
        nextChapter,
        comicSlug: d.manga_slug || manga.slug || mangaSlug,
        comicTitle: manga.title || d.title?.replace(/\s*Chapter.*$/i, '') || '',
        allChapters,
      }
    } catch (err) {
      console.error(`Failed to fetch chapter ${slugOrMangaSlug}:`, err)
      return null
    }
  },

  async searchComics(query: string, page = 1): Promise<Comic[]> {
    try {
      const q = (query || '').trim()
      if (!q) return []
      const res = await fetch(`${getBaseUrl()}/search?q=${encodeURIComponent(q)}&page=${page}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      return extractList(data).map(mapListComic)
    } catch (err) {
      console.error(`Failed to search comics ${query}:`, err)
      return []
    }
  },

  async getGenres(): Promise<ComicGenre[]> {
    try {
      const res = await fetch(`${getBaseUrl()}/genres`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      const list = extractList(data)
      return list
        .map((g: any) => ({
          id: g.id,
          name: typeof g === 'string' ? g : g.name || g.label || '',
          slug:
            typeof g === 'string'
              ? g.toLowerCase().replace(/\s+/g, '-')
              : g.slug || g.value || g.name?.toLowerCase().replace(/\s+/g, '-') || '',
          icon: g.icon || null,
        }))
        .filter((g: any) => g.name)
    } catch (err) {
      console.error('Failed to fetch comic genres:', err)
      return []
    }
  },
}
