export interface Anime {
  id: string
  slug: string
  title: string
  titleJp?: string
  titleJapanese?: string
  poster: string
  backdrop?: string
  rating: number
  year?: number
  episodes: number
  currentEpisode?: number
  duration?: string
  quality?: string
  type: string
  status: string
  genres: string[]
  genreList?: { title: string; genreId: string }[]
  studio?: string
  synopsis?: string
  releaseDay?: string
  latestReleaseDate?: string
}

export interface EpisodeInfo {
  num?: number
  title: string
  episodeId: string
  slug: string
}

export interface AnimeDetail extends Anime {
  producers?: string
  batch?: any
  episodesList: EpisodeInfo[]
  totalEpisodes: number
  season?: string
  aired?: string
  recommendations: Anime[]
}

export interface ServerItem {
  title: string
  serverId: string
}

export interface QualityServerGroup {
  title: string
  serverList: ServerItem[]
}

export interface DownloadServerItem {
  title: string
  url: string
}

export interface DownloadQualityGroup {
  title: string
  size?: string
  serverList?: DownloadServerItem[]
  urlList?: DownloadServerItem[]
}

export interface EpisodeDetail {
  title: string
  animeId?: string
  currentEpisode?: number
  releaseTime?: string
  defaultStreamingUrl?: string
  streamUrl?: string
  server?: {
    qualityList?: QualityServerGroup[]
  } | ServerItem[]
  download?: {
    qualityList?: DownloadQualityGroup[]
  }
  downloadUrl?: {
    quality: string
    server: string
    url: string
  }[]
  hasPrevEpisode?: boolean
  prevEpisode?: {
    title: string
    episodeId: string
  }
  hasNextEpisode?: boolean
  nextEpisode?: {
    title: string
    episodeId: string
  }
}

export interface AnimeScheduleDay {
  day: string
  list: {
    title: string
    animeId: string
    slug: string
  }[]
}
