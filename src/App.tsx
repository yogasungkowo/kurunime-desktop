import { useEffect, useState } from 'react'
import type { Anime, EpisodeInfo } from './types/anime'
import type { Comic, ComicChapter } from './types/comic'
import { animeApi } from './services/animeApi'
import { comicApi } from './services/comicApi'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { AnimeCard } from './components/AnimeCard'
import { ComicCard } from './components/ComicCard'
import { AnimeDetailModal } from './components/AnimeDetailModal'
import { AnimePlayerModal } from './components/AnimePlayerModal'
import { ComicDetailModal } from './components/ComicDetailModal'
import { ComicReaderModal } from './components/ComicReaderModal'
import { ScheduleView } from './components/ScheduleView'
import { HistoryBookmarkView } from './components/HistoryBookmarkView'
import { HeroCarousel } from './components/HeroCarousel'
import { GenreView } from './components/GenreView'
import {
  Clock,
  CheckCircle2,
  Tv,
  BookOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function App() {
  const [activeTab, setActiveTab] = useState<
    'anime' | 'komik' | 'schedule' | 'bookmark' | 'history' | 'search' | 'anime-genres' | 'comic-genres'
  >('anime')
  const [subFilter, setSubFilter] = useState('home')
  const [selectedGenreState, setSelectedGenreState] = useState<{
    id?: string
    title?: string
    type: 'anime' | 'comic'
  } | null>(null)

  const handleOpenGenre = (genreId: string, genreTitle: string, type: 'anime' | 'comic') => {
    setSelectedGenreState({ id: genreId, title: genreTitle, type })
    setActiveTab(type === 'anime' ? 'anime-genres' : 'comic-genres')
  }

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [animeSearchResults, setAnimeSearchResults] = useState<Anime[]>([])
  const [comicSearchResults, setComicSearchResults] = useState<Comic[]>([])

  // Anime home data state
  const [ongoingHomeAnime, setOngoingHomeAnime] = useState<Anime[]>([])
  const [completedHomeAnime, setCompletedHomeAnime] = useState<Anime[]>([])
  const [loadingAnimeHome, setLoadingAnimeHome] = useState(true)

  // Dedicated Ongoing pagination state
  const [ongoingList, setOngoingList] = useState<Anime[]>([])
  const [ongoingPage, setOngoingPage] = useState(1)
  const [ongoingTotalPages, setOngoingTotalPages] = useState(1)
  const [loadingOngoing, setLoadingOngoing] = useState(false)

  // Dedicated Completed pagination state
  const [completedList, setCompletedList] = useState<Anime[]>([])
  const [completedPage, setCompletedPage] = useState(1)
  const [completedTotalPages, setCompletedTotalPages] = useState(1)
  const [loadingCompleted, setLoadingCompleted] = useState(false)

  // Comic data state
  const [comicsList, setComicsList] = useState<Comic[]>([])
  const [loadingComics, setLoadingComics] = useState(false)
  const [comicPage, setComicPage] = useState(1)

  // Modals state
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null)
  const [playingEpisodeData, setPlayingEpisodeData] = useState<{
    animeTitle: string
    animePoster: string
    animeId: string
    episodeInfo: EpisodeInfo
    allEpisodes: EpisodeInfo[]
  } | null>(null)

  const [selectedComicSlug, setSelectedComicSlug] = useState<string | null>(null)
  const [readingChapterData, setReadingChapterData] = useState<{
    comicSlug: string
    comicTitle: string
    chapter: ComicChapter
    allChapters: ComicChapter[]
  } | null>(null)

  // ── Load Anime Home Data ─────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    setLoadingAnimeHome(true)

    animeApi
      .getHomeData()
      .then((data) => {
        if (!isMounted) return
        setOngoingHomeAnime(data.ongoing)
        setCompletedHomeAnime(data.completed)
      })
      .finally(() => {
        if (isMounted) setLoadingAnimeHome(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // ── Load Ongoing Anime with Pagination ───────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'anime' || subFilter !== 'ongoing') return

    let isMounted = true
    setLoadingOngoing(true)

    animeApi
      .getOngoing(ongoingPage)
      .then((res) => {
        if (!isMounted) return
        setOngoingList(res.list.slice(0, 12))
        setOngoingTotalPages(res.totalPages || 1)
      })
      .finally(() => {
        if (isMounted) setLoadingOngoing(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeTab, subFilter, ongoingPage])

  // ── Load Completed Anime with Pagination ────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'anime' || subFilter !== 'completed') return

    let isMounted = true
    setLoadingCompleted(true)

    animeApi
      .getCompleted(completedPage)
      .then((res) => {
        if (!isMounted) return
        setCompletedList(res.list.slice(0, 12))
        setCompletedTotalPages(res.totalPages || 1)
      })
      .finally(() => {
        if (isMounted) setLoadingCompleted(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeTab, subFilter, completedPage])

  // ── Load Comic Data with Pagination ──────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'komik') return

    let isMounted = true
    setLoadingComics(true)

    const fetchComics = async () => {
      let results: Comic[] = []
      if (subFilter === 'popular') {
        results = await comicApi.getPopularComics(comicPage)
      } else {
        const typeParam = ['manga', 'manhwa', 'manhua'].includes(subFilter) ? subFilter : undefined
        results = await comicApi.getLatestComics(comicPage, typeParam)
      }
      if (isMounted) {
        setComicsList(results.slice(0, 12))
        setLoadingComics(false)
      }
    }

    fetchComics()

    return () => {
      isMounted = false
    }
  }, [activeTab, subFilter, comicPage])

  // ── Handle Global Search ─────────────────────────────────────────────────────
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setActiveTab('search')
    setSearching(true)

    try {
      const [animeRes, comicRes] = await Promise.all([
        animeApi.searchAnime(query),
        comicApi.searchComics(query),
      ])
      setAnimeSearchResults(animeRes)
      setComicSearchResults(comicRes)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d0f15] text-gray-100 select-none">
      {/* TitleBar */}
      <TitleBar
        onSearch={handleSearch}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as any)
          if (tab === 'anime') setSubFilter('home')
          if (tab === 'komik') setSubFilter('all')
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab as any)
            if (tab === 'anime') {
              setSubFilter('home')
            }
            if (tab === 'komik') {
              setSubFilter('all')
              setComicPage(1)
            }
          }}
          subFilter={subFilter}
          setSubFilter={(filter) => {
            setSubFilter(filter)
            if (filter === 'ongoing') setOngoingPage(1)
            if (filter === 'completed') setCompletedPage(1)
            if (['all', 'popular', 'manga', 'manhwa', 'manhua'].includes(filter)) setComicPage(1)
          }}
        />

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* TAB: SEARCH RESULTS */}
              {activeTab === 'search' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <h2 className="text-xl font-black text-white">
                    Hasil Pencarian untuk: &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Menemukan {animeSearchResults.length} anime dan {comicSearchResults.length} komik
                  </p>
                </div>
              </div>

              {searching ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                  <span className="text-xs">Mencari anime dan komik...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Anime Results */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-rose-500" />
                      Anime ({animeSearchResults.length})
                    </h3>
                    {animeSearchResults.length === 0 ? (
                      <p className="text-xs text-gray-500">Tidak ada anime yang cocok.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {animeSearchResults.map((anime) => (
                          <AnimeCard
                            key={anime.id}
                            anime={anime}
                            onClick={(a) => setSelectedAnimeId(a.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comic Results */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      Komik ({comicSearchResults.length})
                    </h3>
                    {comicSearchResults.length === 0 ? (
                      <p className="text-xs text-gray-500">Tidak ada komik yang cocok.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {comicSearchResults.map((comic) => (
                          <ComicCard
                            key={comic.slug}
                            comic={comic}
                            onClick={(c) => setSelectedComicSlug(c.slug)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ANIME */}
          {activeTab === 'anime' && (
            <div className="space-y-8">
              {/* SUB-FILTER: HOME */}
              {subFilter === 'home' && (
                <>
                  {loadingAnimeHome ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                      <span className="text-xs">Memuat katalog beranda anime...</span>
                    </div>
                  ) : (
                    <>
                      {/* Hero Carousel with High Rating Anime */}
                      <HeroCarousel
                        animeList={[...ongoingHomeAnime, ...completedHomeAnime]}
                        onSelectAnimeId={(id) => setSelectedAnimeId(id)}
                      />

                      {/* Section: Sedang Tayang Preview (Max 12 cards) */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-rose-500" />
                            Anime Sedang Tayang (Ongoing)
                          </h3>
                          <button
                            onClick={() => {
                              setSubFilter('ongoing')
                              setOngoingPage(1)
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                          >
                            Lihat Semua →
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                          {ongoingHomeAnime.slice(0, 12).map((anime) => (
                            <AnimeCard
                              key={anime.id}
                              anime={anime}
                              onClick={(a) => setSelectedAnimeId(a.id)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Section: Anime Tamat Preview (Max 12 cards) */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-rose-500" />
                            Anime Tamat (Completed)
                          </h3>
                          <button
                            onClick={() => {
                              setSubFilter('completed')
                              setCompletedPage(1)
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                          >
                            Lihat Semua →
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                          {completedHomeAnime.slice(0, 12).map((anime) => (
                            <AnimeCard
                              key={anime.id}
                              anime={anime}
                              onClick={(a) => setSelectedAnimeId(a.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* SUB-FILTER: ONGOING WITH PAGINATION (MAX 12 PER PAGE) */}
              {subFilter === 'ongoing' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-500" />
                        Anime Sedang Tayang (Ongoing)
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Daftar anime yang masih berlanjut per minggunya (Maks. 12 per halaman)
                      </p>
                    </div>

                    <button
                      onClick={() => setSubFilter('home')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium self-start sm:self-auto"
                    >
                      ← Kembali ke Beranda
                    </button>
                  </div>

                  {loadingOngoing ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                      <span className="text-xs">Memuat anime ongoing halaman {ongoingPage}...</span>
                    </div>
                  ) : ongoingList.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-gray-500">
                      Tidak ada anime ongoing ditemukan di halaman ini.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {ongoingList.map((anime) => (
                          <AnimeCard
                            key={anime.id}
                            anime={anime}
                            onClick={(a) => setSelectedAnimeId(a.id)}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls for Ongoing */}
                      <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-800/80">
                        <button
                          disabled={ongoingPage <= 1}
                          onClick={() => setOngoingPage((p) => Math.max(1, p - 1))}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            ongoingPage <= 1
                              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                              : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Sebelumnya
                        </button>

                        <span className="text-xs font-bold text-gray-300 px-4 py-1.5 bg-gray-800/80 rounded-xl border border-gray-700/60">
                          Halaman {ongoingPage} dari {ongoingTotalPages}
                        </span>

                        <button
                          disabled={ongoingPage >= ongoingTotalPages}
                          onClick={() => setOngoingPage((p) => p + 1)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            ongoingPage >= ongoingTotalPages
                              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                              : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700'
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

              {/* SUB-FILTER: COMPLETED WITH PAGINATION (MAX 12 PER PAGE) */}
              {subFilter === 'completed' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-rose-500" />
                        Anime Tamat (Completed)
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Daftar anime lengkap yang sudah selesai tayang (Maks. 12 per halaman)
                      </p>
                    </div>

                    <button
                      onClick={() => setSubFilter('home')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium self-start sm:self-auto"
                    >
                      ← Kembali ke Beranda
                    </button>
                  </div>

                  {loadingCompleted ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                      <span className="text-xs">Memuat anime completed halaman {completedPage}...</span>
                    </div>
                  ) : completedList.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-gray-500">
                      Tidak ada anime completed ditemukan di halaman ini.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {completedList.map((anime) => (
                          <AnimeCard
                            key={anime.id}
                            anime={anime}
                            onClick={(a) => setSelectedAnimeId(a.id)}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls for Completed */}
                      <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-800/80">
                        <button
                          disabled={completedPage <= 1}
                          onClick={() => setCompletedPage((p) => Math.max(1, p - 1))}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            completedPage <= 1
                              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                              : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Sebelumnya
                        </button>

                        <span className="text-xs font-bold text-gray-300 px-4 py-1.5 bg-gray-800/80 rounded-xl border border-gray-700/60">
                          Halaman {completedPage} dari {completedTotalPages}
                        </span>

                        <button
                          disabled={completedPage >= completedTotalPages}
                          onClick={() => setCompletedPage((p) => p + 1)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            completedPage >= completedTotalPages
                              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                              : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700'
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
          )}

          {/* TAB: KOMIK */}
          {activeTab === 'komik' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-500" />
                    Koleksi Komik & Manga
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Baca Manga Jepang, Manhwa Korea, dan Manhua China subtitle Indonesia gratis
                  </p>
                </div>

                {/* Sub-filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Terbaru' },
                    { id: 'popular', label: 'Populer' },
                    { id: 'manga', label: 'Manga' },
                    { id: 'manhwa', label: 'Manhwa' },
                    { id: 'manhua', label: 'Manhua' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => {
                        setSubFilter(chip.id)
                        setComicPage(1)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                        subFilter === chip.id
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-[#161a24] text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingComics ? (
                <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                  <span className="text-xs">Memuat daftar komik...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {comicsList.map((comic) => (
                      <ComicCard
                        key={comic.slug}
                        comic={comic}
                        onClick={(c) => setSelectedComicSlug(c.slug)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-800/80">
                    <button
                      disabled={comicPage <= 1}
                      onClick={() => setComicPage((p) => Math.max(1, p - 1))}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        comicPage <= 1
                          ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                          : 'bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </button>

                    <span className="text-xs font-bold text-gray-300 px-3 py-1 bg-gray-800/80 rounded-lg">
                      Halaman {comicPage}
                    </span>

                    <button
                      onClick={() => setComicPage((p) => p + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-[#161a24] hover:bg-gray-800 text-gray-200 border border-gray-700 transition"
                    >
                      Berikutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: JADWAL */}
          {activeTab === 'schedule' && (
            <ScheduleView onSelectAnimeId={(id) => setSelectedAnimeId(id)} />
          )}

          {/* TAB: BOOKMARK */}
          {activeTab === 'bookmark' && (
            <HistoryBookmarkView
              type="bookmark"
              onSelectAnimeId={(id) => setSelectedAnimeId(id)}
              onSelectComicSlug={(slug) => setSelectedComicSlug(slug)}
            />
          )}

              {/* TAB: RIWAYAT */}
              {activeTab === 'history' && (
                <HistoryBookmarkView
                  type="history"
                  onSelectAnimeId={(id) => setSelectedAnimeId(id)}
                  onSelectComicSlug={(slug) => setSelectedComicSlug(slug)}
                />
              )}

              {/* TAB: GENRE ANIME */}
              {activeTab === 'anime-genres' && (
                <GenreView
                  initialType="anime"
                  initialGenreId={selectedGenreState?.type === 'anime' ? selectedGenreState.id : undefined}
                  initialGenreTitle={selectedGenreState?.type === 'anime' ? selectedGenreState.title : undefined}
                  onSelectAnimeId={(id) => setSelectedAnimeId(id)}
                  onSelectComicSlug={(slug) => setSelectedComicSlug(slug)}
                />
              )}

              {/* TAB: GENRE KOMIK */}
              {activeTab === 'comic-genres' && (
                <GenreView
                  initialType="comic"
                  initialGenreId={selectedGenreState?.type === 'comic' ? selectedGenreState.id : undefined}
                  initialGenreTitle={selectedGenreState?.type === 'comic' ? selectedGenreState.title : undefined}
                  onSelectAnimeId={(id) => setSelectedAnimeId(id)}
                  onSelectComicSlug={(slug) => setSelectedComicSlug(slug)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── MODALS ───────────────────────────────────────────────────────────── */}
      {/* 1. Anime Detail Modal */}
      <AnimatePresence>
        {selectedAnimeId && (
          <AnimeDetailModal
            animeId={selectedAnimeId}
            onClose={() => setSelectedAnimeId(null)}
            onPlayEpisode={(title, poster, ep, allEps) => {
              setPlayingEpisodeData({
                animeTitle: title,
                animePoster: poster,
                animeId: selectedAnimeId,
                episodeInfo: ep,
                allEpisodes: allEps,
              })
            }}
            onSelectAnime={(anime) => setSelectedAnimeId(anime.id)}
            onSelectGenre={(gId, gTitle) => handleOpenGenre(gId, gTitle, 'anime')}
          />
        )}
      </AnimatePresence>

      {/* 2. Anime Player Modal */}
      <AnimatePresence>
        {playingEpisodeData && (
          <AnimePlayerModal
            animeTitle={playingEpisodeData.animeTitle}
            animePoster={playingEpisodeData.animePoster}
            animeId={playingEpisodeData.animeId}
            episodeInfo={playingEpisodeData.episodeInfo}
            allEpisodes={playingEpisodeData.allEpisodes}
            onClose={() => setPlayingEpisodeData(null)}
            onSelectEpisode={(ep) => {
              setPlayingEpisodeData((prev) => (prev ? { ...prev, episodeInfo: ep } : null))
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Comic Detail Modal */}
      <AnimatePresence>
        {selectedComicSlug && (
          <ComicDetailModal
            slug={selectedComicSlug}
            onClose={() => setSelectedComicSlug(null)}
            onReadChapter={(comicSlug, comicTitle, chapter, allChapters) => {
              setReadingChapterData({
                comicSlug,
                comicTitle,
                chapter,
                allChapters,
              })
            }}
            onSelectComic={(comic) => setSelectedComicSlug(comic.slug)}
            onSelectGenre={(gSlug, gTitle) => handleOpenGenre(gSlug, gTitle, 'comic')}
          />
        )}
      </AnimatePresence>

      {/* 4. Comic Reader Modal */}
      <AnimatePresence>
        {readingChapterData && (
          <ComicReaderModal
            comicSlug={readingChapterData.comicSlug}
            comicTitle={readingChapterData.comicTitle}
            chapter={readingChapterData.chapter}
            allChapters={readingChapterData.allChapters}
            onClose={() => setReadingChapterData(null)}
            onSelectChapter={(chap) => {
              setReadingChapterData((prev) => (prev ? { ...prev, chapter: chap } : null))
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
