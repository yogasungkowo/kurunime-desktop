import type { Anime, AnimeDetail, AnimeGenreItem, AnimeScheduleDay, EpisodeDetail } from '../types/anime'

const getBaseUrl = () => {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_anime_api') : null
  const raw = custom || import.meta.env.VITE_ANIME_API_URL || 'https://anime-api.prasunk.my.id'
  return raw.endsWith('/otakudesu') ? raw : `${raw.replace(/\/$/, '')}/otakudesu`
}

const parseScore = (value: unknown): number => {
  const match = String(value ?? '').match(/(\d+(?:[.,]\d+)?)/)
  return match ? Number.parseFloat(match[1].replace(',', '.')) : 0
}

const parseEpisodeNumber = (value: unknown): number | undefined => {
  const match = String(value ?? '').match(/\d+/)
  return match ? Number.parseInt(match[0], 10) : undefined
}

const parseYear = (value: unknown): number | undefined => {
  const match = String(value ?? '').match(/\b(19|20)\d{2}\b/)
  return match ? Number.parseInt(match[0], 10) : undefined
}

const cleanLabel = (value: unknown): string =>
  String(value ?? '').replace(/^(status|rating)\s*:\s*/i, '').trim()

const mapStatus = (value: unknown): string => {
  const raw = cleanLabel(value)
  const s = raw.toLowerCase()
  if (s.includes('ongoing') || s.includes('sedang')) return 'Ongoing'
  if (s.includes('completed') || s.includes('tamat') || s.includes('selesai')) return 'Completed'
  return raw || 'Completed'
}

const mapType = (value: unknown): string => {
  const t = String(value ?? '').toLowerCase()
  if (t.includes('movie')) return 'Movie'
  if (t.includes('ova')) return 'OVA'
  if (t.includes('ona')) return 'ONA'
  if (t.includes('special')) return 'Special'
  return 'TV'
}

export const mapApiToAnime = (item: any): Anime => {
  const id = String(item.animeId || item.id || '')
  const poster = item.poster || item.image || ''
  const genreList = (item.genreList || item.genres || [])
    .map((g: any) =>
      typeof g === 'string'
        ? { title: g.replace(/,$/, '').trim(), genreId: '' }
        : { title: String(g.title || '').replace(/,$/, '').trim(), genreId: g.genreId || '' }
    )
    .filter((g: any) => g.title)

  return {
    id,
    slug: id,
    title: String(item.title || '').replace(/\s*Subtitle Indonesia\s*$/i, '').trim() || item.title || '',
    titleJp: item.japanese || item.title || '',
    titleJapanese: item.japanese || '',
    poster,
    backdrop: poster,
    rating: parseScore(item.score ?? item.highlight),
    year: parseYear(item.aired || item.season || item.date),
    episodes: parseEpisodeNumber(item.episodes ?? item.totalEpisodes) || 0,
    currentEpisode: parseEpisodeNumber(item.episodes),
    duration: item.duration || '',
    quality: item.quality || 'HD',
    type: mapType(item.type),
    status: mapStatus(item.status),
    genres: genreList.map((g: any) => g.title),
    genreList,
    studio: item.studios || item.studio || '',
    synopsis: Array.isArray(item.synopsis?.paragraphList)
      ? item.synopsis.paragraphList.join('\n\n')
      : typeof item.synopsis === 'string'
      ? item.synopsis
      : '',
    releaseDay: item.releaseDay || '',
    latestReleaseDate: item.latestReleaseDate || item.lastReleaseDate || '',
  }
}

export const animeApi = {
  async getHomeData(): Promise<{ ongoing: Anime[]; completed: Anime[] }> {
    try {
      const res = await fetch(`${getBaseUrl()}/home`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const home = json?.data || {}
      const ongoing = (home.ongoing?.animeList || []).map(mapApiToAnime)
      const completed = (home.completed?.animeList || []).map(mapApiToAnime)
      return { ongoing, completed }
    } catch (err) {
      console.error('Failed to fetch anime home data:', err)
      return { ongoing: [], completed: [] }
    }
  },

  async getAnimeDetail(id: string): Promise<AnimeDetail | null> {
    try {
      const animeId = String(id).split(':')[0]
      const res = await fetch(`${getBaseUrl()}/anime/${animeId}`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const data = json?.data?.details
      if (!data) return null

      const mapped = mapApiToAnime({ ...data, animeId, id: animeId, slug: animeId })
      const episodes = [...(data.episodeList || [])]
        .map((ep: any) => ({
          num: parseEpisodeNumber(ep.title),
          title: ep.title,
          episodeId: ep.episodeId,
          slug: ep.episodeId,
        }))
        .sort((a: any, b: any) => (a.num || 0) - (b.num || 0))

      return {
        ...mapped,
        producers: data.producers || '',
        batch: data.batch || null,
        episodesList: episodes,
        totalEpisodes: mapped.episodes,
        season: data.season || '',
        aired: data.aired || '',
        recommendations: (data.recommendedAnimeList || []).map(mapApiToAnime),
      }
    } catch (err) {
      console.error(`Failed to fetch anime detail ${id}:`, err)
      return null
    }
  },

  async getEpisodeDetail(episodeId: string): Promise<EpisodeDetail | null> {
    try {
      const res = await fetch(`${getBaseUrl()}/episode/${episodeId}`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      return json?.data?.details || json?.data || null
    } catch (err) {
      console.error(`Failed to fetch episode detail ${episodeId}:`, err)
      return null
    }
  },

  async getServerEmbed(serverId: string): Promise<string | null> {
    try {
      const res = await fetch(`${getBaseUrl()}/server/${encodeURIComponent(serverId)}`, {
        method: 'POST',
        headers: { accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      return json?.data?.details?.url || null
    } catch (err) {
      console.error(`Failed to fetch server embed for ${serverId}:`, err)
      return null
    }
  },

  async getSchedule(): Promise<AnimeScheduleDay[]> {
    try {
      const res = await fetch(`${getBaseUrl()}/schedule`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const scheduleList = json?.data?.scheduleList || []
      return scheduleList.map((group: any) => ({
        day: group.title || '',
        list: (group.animeList || []).map((item: any) => ({
          title: item.title || '',
          animeId: item.animeId || '',
          slug: item.animeId || '',
        })),
      }))
    } catch (err) {
      console.error('Failed to fetch anime schedule:', err)
      return []
    }
  },

  async searchAnime(query: string): Promise<Anime[]> {
    try {
      const res = await fetch(`${getBaseUrl()}/search?q=${encodeURIComponent(query)}`, {
        headers: { accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      return (json?.data?.animeList || []).map(mapApiToAnime)
    } catch (err) {
      console.error(`Failed to search anime ${query}:`, err)
      return []
    }
  },

  async getOngoing(page: number = 1): Promise<{ list: Anime[]; hasNext: boolean; totalPages: number; currentPage: number }> {
    try {
      const res = await fetch(`${getBaseUrl()}/ongoing?page=${page}`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const rawList = json?.data?.animeList || []
      const pagination = json?.pagination || json?.data?.pagination
      return {
        list: rawList.slice(0, 12).map(mapApiToAnime),
        hasNext: pagination ? pagination.hasNextPage : rawList.length > 12,
        totalPages: pagination?.totalPages || 1,
        currentPage: pagination?.currentPage || page,
      }
    } catch (err) {
      console.error(`Failed to fetch ongoing anime:`, err)
      return { list: [], hasNext: false, totalPages: 1, currentPage: page }
    }
  },

  async getCompleted(page: number = 1): Promise<{ list: Anime[]; hasNext: boolean; totalPages: number; currentPage: number }> {
    try {
      const res = await fetch(`${getBaseUrl()}/completed?page=${page}`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const rawList = json?.data?.animeList || []
      const pagination = json?.pagination || json?.data?.pagination
      return {
        list: rawList.slice(0, 12).map(mapApiToAnime),
        hasNext: pagination ? pagination.hasNextPage : rawList.length > 12,
        totalPages: pagination?.totalPages || 1,
        currentPage: pagination?.currentPage || page,
      }
    } catch (err) {
      console.error(`Failed to fetch completed anime:`, err)
      return { list: [], hasNext: false, totalPages: 1, currentPage: page }
    }
  },

  async getGenres(): Promise<AnimeGenreItem[]> {
    try {
      const res = await fetch(`${getBaseUrl()}/genre`, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      return json?.data?.genreList || []
    } catch (err) {
      console.error('Failed to fetch anime genres:', err)
      return []
    }
  },

  async getAnimeByGenre(
    genreId: string,
    page = 1
  ): Promise<{ list: Anime[]; hasNext: boolean; totalPages: number; currentPage: number }> {
    try {
      const res = await fetch(`${getBaseUrl()}/genre/${encodeURIComponent(genreId)}?page=${page}`, {
        headers: { accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const rawList = json?.data?.animeList || []
      const pagination = json?.pagination || json?.data?.pagination
      return {
        list: rawList.map(mapApiToAnime),
        hasNext: pagination ? pagination.hasNextPage : rawList.length > 0,
        totalPages: pagination?.totalPages || 1,
        currentPage: pagination?.currentPage || page,
      }
    } catch (err) {
      console.error(`Failed to fetch anime by genre ${genreId}:`, err)
      return { list: [], hasNext: false, totalPages: 1, currentPage: page }
    }
  },
}
