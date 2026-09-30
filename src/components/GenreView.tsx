import React, { useState, useEffect } from 'react'
import type { Anime, AnimeGenreItem } from '../types/anime'
import type { Comic, ComicGenre } from '../types/comic'
import { animeApi } from '../services/animeApi'
import { comicApi } from '../services/comicApi'
import { AnimeCard } from './AnimeCard'
import { ComicCard } from './ComicCard'
import {
  Tags,
  Tv,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Filter,
} from 'lucide-react'
import { motion } from 'motion/react'

interface GenreViewProps {
  initialType?: 'anime' | 'comic'
  initialGenreId?: string
  initialGenreTitle?: string
  onSelectAnimeId: (id: string) => void
  onSelectComicSlug: (slug: string) => void
}

export const GenreView: React.FC<GenreViewProps> = ({
  initialType = 'anime',
  initialGenreId,
  initialGenreTitle,
  onSelectAnimeId,
  onSelectComicSlug,
}) => {
  const [activeType, setActiveType] = useState<'anime' | 'comic'>(initialType)

  // Genre lists
  const [animeGenres, setAnimeGenres] = useState<AnimeGenreItem[]>([])
  const [comicGenres, setComicGenres] = useState<ComicGenre[]>([])
  const [loadingGenres, setLoadingGenres] = useState(true)
  const [genreSearch, setGenreSearch] = useState('')

  // Selected genre state
  const [selectedGenre, setSelectedGenre] = useState<{
    id: string
    title: string
    type: 'anime' | 'comic'
  } | null>(
    initialGenreId && initialGenreTitle
      ? { id: initialGenreId, title: initialGenreTitle, type: initialType }
      : null
  )

  // Catalog items for the selected genre
  const [animeItems, setAnimeItems] = useState<Anime[]>([])
  const [comicItems, setComicItems] = useState<Comic[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [totalPages, setTotalPages] = useState<number | null>(null)

  // Fetch all genres on mount
  useEffect(() => {
    let isMounted = true
    setLoadingGenres(true)

    Promise.all([animeApi.getGenres(), comicApi.getGenres()])
      .then(([aGenres, cGenres]) => {
        if (!isMounted) return
        setAnimeGenres(aGenres)
        setComicGenres(cGenres)
      })
      .catch((err) => {
        console.error('Failed to load genres:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingGenres(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync if initial props change
  useEffect(() => {
    if (initialType) {
      setActiveType(initialType)
    }
    if (initialGenreId && initialGenreTitle) {
      setSelectedGenre({
        id: initialGenreId,
        title: initialGenreTitle,
        type: initialType,
      })
      setCurrentPage(1)
    }
  }, [initialType, initialGenreId, initialGenreTitle])

  // Load items when selected genre or page changes
  useEffect(() => {
    if (!selectedGenre) return
    let isMounted = true
    setLoadingItems(true)

    if (selectedGenre.type === 'anime') {
      animeApi
        .getAnimeByGenre(selectedGenre.id, currentPage)
        .then((res) => {
          if (!isMounted) return
          setAnimeItems(res.list)
          setHasNextPage(res.hasNext)
          setTotalPages(res.totalPages)
        })
        .catch((err) => {
          console.error(`Failed to load anime for genre ${selectedGenre.id}:`, err)
        })
        .finally(() => {
          if (isMounted) setLoadingItems(false)
        })
    } else {
      comicApi
        .getComicsByGenre(selectedGenre.id, currentPage)
        .then((items) => {
          if (!isMounted) return
          setComicItems(items)
          setHasNextPage(items.length >= 20)
          setTotalPages(null)
        })
        .catch((err) => {
          console.error(`Failed to load comics for genre ${selectedGenre.id}:`, err)
        })
        .finally(() => {
          if (isMounted) setLoadingItems(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [selectedGenre, currentPage])

  // Filter genres based on search input
  const currentGenres = activeType === 'anime' ? animeGenres : comicGenres
  const filteredGenres = currentGenres.filter((g) => {
    const name = 'title' in g ? g.title : g.name
    return name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  })

  const handleSelectGenreItem = (id: string, title: string) => {
    setSelectedGenre({ id, title, type: activeType })
    setCurrentPage(1)
  }

  const handleBackToGenreList = () => {
    setSelectedGenre(null)
    setAnimeItems([])
    setComicItems([])
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-rose-500" />
            {selectedGenre
              ? `Genre ${selectedGenre.type === 'anime' ? 'Anime' : 'Komik'}: ${selectedGenre.title}`
              : 'Jelajahi Genre'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {selectedGenre
              ? `Daftar judul ${selectedGenre.type === 'anime' ? 'anime' : 'komik'} dengan kategori ${selectedGenre.title}`
              : 'Pilih dan temukan anime atau komik berdasarkan kategori genre favorit Anda.'}
          </p>
        </div>

        {/* Anime / Comic Type Switcher */}
        {!selectedGenre && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141720] border border-gray-800 self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveType('anime')
                setSelectedGenre(null)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeType === 'anime'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Anime ({animeGenres.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveType('comic')
                setSelectedGenre(null)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeType === 'comic'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Komik ({comicGenres.length})</span>
            </button>
          </div>
        )}

        {/* Back Button if a genre is currently active */}
        {selectedGenre && (
          <button
            onClick={handleBackToGenreList}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-rose-600 text-gray-200 hover:text-white text-xs font-semibold transition border border-gray-700/60 cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Genre</span>
          </button>
        )}
      </div>

      {/* VIEW 1: GENRE SELECTION GRID */}
      {!selectedGenre && (
        <div className="space-y-5">
          {/* Search Genre Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              placeholder={`Cari dari ${currentGenres.length} genre ${activeType === 'anime' ? 'anime' : 'komik'}...`}
              className="w-full bg-[#141720] border border-gray-800 focus:border-rose-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none transition"
            />
            {genreSearch && (
              <button
                onClick={() => setGenreSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {loadingGenres ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
              <span className="text-xs">Memuat daftar genre...</span>
            </div>
          ) : filteredGenres.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs text-center">
              <Filter className="w-8 h-8 text-gray-600 mb-1" />
              <span>Tidak ada genre yang cocok dengan pencarian &ldquo;{genreSearch}&rdquo;.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredGenres.map((g) => {
                const id = 'genreId' in g ? g.genreId : g.slug
                const name = 'title' in g ? g.title : g.name

                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectGenreItem(id, name)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141720] hover:bg-[#1a1e2b] border border-gray-800/80 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-950/20 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500/80 group-hover:bg-rose-400 group-hover:scale-125 transition-all shrink-0" />
                      <span className="text-xs font-semibold text-gray-200 group-hover:text-rose-400 truncate transition-colors">
                        {name}
                      </span>
                    </div>
                    <Sparkles className="w-3 h-3 text-gray-600 group-hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ITEMS MATCHING THE SELECTED GENRE */}
      {selectedGenre && (
        <div className="space-y-6">
          {/* Quick genre pills slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-gray-400 shrink-0">Genre Populer:</span>
            {currentGenres.slice(0, 15).map((g) => {
              const id = 'genreId' in g ? g.genreId : g.slug
              const name = 'title' in g ? g.title : g.name
              const isSelected = selectedGenre.id === id

              return (
                <button
                  key={id}
                  onClick={() => handleSelectGenreItem(id, name)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white font-bold shadow-md'
                      : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/60'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>

          {loadingItems ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
              <span className="text-xs">
                Memuat {selectedGenre.type === 'anime' ? 'anime' : 'komik'} genre &ldquo;
                {selectedGenre.title}&rdquo; halaman {currentPage}...
              </span>
            </div>
          ) : (selectedGenre.type === 'anime' ? animeItems : comicItems).length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs text-center">
              <Tags className="w-8 h-8 text-gray-600 mb-1" />
              <span>
                Tidak ada {selectedGenre.type === 'anime' ? 'anime' : 'komik'} ditemukan untuk genre &ldquo;
                {selectedGenre.title}&rdquo; di halaman ini.
              </span>
            </div>
          ) : (
            <>
              {/* Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {selectedGenre.type === 'anime'
                  ? animeItems.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onClick={(a) => onSelectAnimeId(a.id)}
                      />
                    ))
                  : comicItems.map((comic) => (
                      <ComicCard
                        key={comic.slug}
                        comic={comic}
                        onClick={(c) => onSelectComicSlug(c.slug)}
                      />
                    ))}
              </div>

              {/* Pagination Bar */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-800">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    currentPage <= 1
                      ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                      : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                <span className="text-xs font-bold text-gray-300 px-4 py-1.5 bg-gray-800/80 rounded-xl border border-gray-700/60">
                  Halaman {currentPage}
                  {totalPages ? ` dari ${totalPages}` : ''}
                </span>

                <button
                  disabled={totalPages ? currentPage >= totalPages : !hasNextPage}
                  onClick={() => {
                    setCurrentPage((p) => p + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    (totalPages ? currentPage >= totalPages : !hasNextPage)
                      ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                      : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700 cursor-pointer'
                  }`}
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
