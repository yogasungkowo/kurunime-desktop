export interface Comic {
  id?: number | string
  slug: string
  title: string
  poster: string
  type?: string
  status?: string
  rating?: number
  chapter?: string
  updatedAt?: string
  genres?: string[]
  synopsis?: string
  author?: string
  artist?: string
  releaseYear?: number | null
  viewsCount?: number
}

export interface ComicChapter {
  id?: number
  slug: string
  title: string
  chapter?: string
  chapterNumber?: number | string
  date?: string
}

export interface ComicDetail extends Comic {
  authors?: string[]
  released?: string | number
  chapters?: ComicChapter[]
  recommendations?: Comic[]
  sourceUrl?: string
  firstChapter?: any
  rank?: number | null
}

export interface ChapterData {
  slug: string
  title?: string
  chapterNumber?: number | string
  images: string[]
  prevChapter?: string | null
  nextChapter?: string | null
  comicSlug?: string
  comicTitle?: string
  allChapters?: { id?: number; slug: string; title: string; chapterNumber?: number | string }[]
}

export interface ComicGenre {
  id?: number
  name: string
  slug: string
  icon?: string | null
}
