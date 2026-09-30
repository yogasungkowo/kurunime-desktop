import React, { useEffect, useState } from 'react'
import type { Comic, ComicChapter, ComicDetail } from '../types/comic'
import { comicApi } from '../services/comicApi'
import { storage } from '../services/storage'
import {
  X,
  Star,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Layers,
  User,
  RefreshCw,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import { motion } from 'motion/react'

interface ComicDetailModalProps {
  slug: string
  onClose: () => void
  onReadChapter: (
    comicSlug: string,
    comicTitle: string,
    chapter: ComicChapter,
    allChapters: ComicChapter[]
  ) => void
  onSelectComic: (comic: Comic) => void
  onSelectGenre?: (genreSlug: string, genreTitle: string) => void
}

export const ComicDetailModal: React.FC<ComicDetailModalProps> = ({
  slug,
  onClose,
  onReadChapter,
  onSelectComic,
  onSelectGenre,
}) => {
  const [detail, setDetail] = useState<ComicDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [chapterSearch, setChapterSearch] = useState('')
  const [isAscending, setIsAscending] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    setBookmarked(storage.isBookmarked(slug))

    comicApi
      .getComicDetail(slug)
      .then((data) => {
        if (isMounted) setDetail(data)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  const handleToggleBookmark = () => {
    if (!detail) return
    const newState = storage.toggleBookmark({
      id: detail.slug || slug,
      title: detail.title,
      poster: detail.poster,
      type: 'comic',
      rating: detail.rating,
      latestInfo: `${detail.chapters?.length || 0} Chapter`,
    })
    setBookmarked(newState)
  }

  // Filter & sort chapters
  const filteredChapters = (detail?.chapters || [])
    .filter((c) =>
      c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      String(c.chapterNumber || '').includes(chapterSearch)
    )
    .sort((a, b) => {
      const numA = parseFloat(String(a.chapterNumber || '0')) || 0
      const numB = parseFloat(String(b.chapterNumber || '0')) || 0
      return isAscending ? numA - numB : numB - numA
    })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#13161f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl my-auto cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-gray-300 hover:text-white hover:bg-rose-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
            <span className="text-sm">Memuat detail komik...</span>
          </div>
        ) : !detail ? (
          <div className="h-96 flex items-center justify-center text-gray-400 text-sm">
            Gagal memuat informasi komik.
          </div>
        ) : (
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Header / Poster & Info */}
            <div className="relative bg-gradient-to-b from-[#1c2233] to-[#13161f] p-6 pb-4">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img
                  src={detail.poster}
                  alt={detail.title}
                  className="w-32 sm:w-40 aspect-[3/4] object-cover rounded-xl border-2 border-gray-700/80 shadow-2xl shrink-0"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {detail.type && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                        {detail.type}
                      </span>
                    )}
                    {detail.status && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {detail.status}
                      </span>
                    )}
                    {detail.rating && detail.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {detail.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg sm:text-2xl font-black text-white">
                    {detail.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-3">
                    {detail.author && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-rose-400" />
                        {detail.author}
                      </span>
                    )}
                    {detail.released && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        {detail.released}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      {detail.chapters?.length || 0} Chapter
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    {detail.chapters && detail.chapters.length > 0 && (
                      <button
                        onClick={() => {
                          const firstChapter =
                            detail.chapters![detail.chapters!.length - 1] || detail.chapters![0]
                          onReadChapter(
                            detail.slug,
                            detail.title,
                            firstChapter,
                            detail.chapters!
                          )
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/50 transition transform active:scale-95"
                      >
                        <BookOpen className="w-4 h-4" />
                        Baca Chapter 1
                      </button>
                    )}

                    <button
                      onClick={handleToggleBookmark}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                        bookmarked
                          ? 'border-rose-600/50 bg-rose-500/20 text-rose-400'
                          : 'border-gray-700 bg-gray-800/60 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {bookmarked ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-rose-400" />
                          Tersimpan
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Bookmark
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6">
              {/* Genres */}
              {detail.genres && detail.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.genres.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onSelectGenre) {
                          onClose()
                          onSelectGenre(g.toLowerCase().replace(/\s+/g, '-'), g)
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg bg-[#1a1e2b] text-gray-300 border border-gray-800 transition ${
                        onSelectGenre
                          ? 'hover:bg-rose-600 hover:text-white hover:border-rose-500 cursor-pointer shadow-xs'
                          : ''
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {detail.synopsis && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Sinopsis
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-[#161a24] p-4 rounded-xl border border-gray-800/60">
                    {detail.synopsis}
                  </p>
                </div>
              )}

              {/* Chapter List with Search and Sort */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Daftar Chapter ({detail.chapters?.length || 0})
                  </h3>

                  <div className="flex items-center gap-2">
                    {/* Chapter search input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        placeholder="Cari chapter..."
                        className="pl-8 pr-3 py-1 bg-[#181c26] text-xs text-gray-200 placeholder-gray-500 rounded-lg border border-gray-800 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    {/* Sort button */}
                    <button
                      onClick={() => setIsAscending(!isAscending)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#181c26] hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-800 transition"
                      title={isAscending ? 'Terlama ke Terbaru' : 'Terbaru ke Terlama'}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      {isAscending ? 'Lama → Baru' : 'Baru → Lama'}
                    </button>
                  </div>
                </div>

                {filteredChapters.length === 0 ? (
                  <p className="text-xs text-gray-500">Tidak ada chapter ditemukan.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                    {filteredChapters.map((chap) => (
                      <button
                        key={chap.slug}
                        onClick={() =>
                          onReadChapter(
                            detail.slug,
                            detail.title,
                            chap,
                            detail.chapters || []
                          )
                        }
                        className="p-2.5 rounded-xl bg-[#161a24] hover:bg-rose-600 border border-gray-800/80 hover:border-rose-500 text-left transition group flex flex-col justify-between"
                      >
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white line-clamp-1">
                          {chap.title}
                        </span>
                        {chap.date && (
                          <span className="text-[10px] text-gray-500 group-hover:text-rose-200 mt-1">
                            {chap.date}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {detail.recommendations && detail.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                    Komik Terkait & Rekomendasi
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {detail.recommendations.slice(0, 6).map((rec) => (
                      <div
                        key={rec.slug}
                        onClick={() => onSelectComic(rec)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-900 border border-gray-800 group-hover:border-rose-500 transition">
                          <img
                            src={rec.poster}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                        <h4 className="text-[11px] font-semibold text-gray-300 group-hover:text-rose-400 line-clamp-1 mt-1.5">
                          {rec.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
