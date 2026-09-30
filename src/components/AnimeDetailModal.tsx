import React, { useEffect, useState } from 'react'
import type { Anime, AnimeDetail, EpisodeInfo } from '../types/anime'
import { animeApi } from '../services/animeApi'
import { storage } from '../services/storage'
import {
  X,
  Star,
  Play,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Layers,
  Tv,
  RefreshCw,
} from 'lucide-react'

interface AnimeDetailModalProps {
  animeId: string
  onClose: () => void
  onPlayEpisode: (
    animeTitle: string,
    animePoster: string,
    ep: EpisodeInfo,
    allEpisodes: EpisodeInfo[]
  ) => void
  onSelectAnime: (anime: Anime) => void
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  animeId,
  onClose,
  onPlayEpisode,
  onSelectAnime,
}) => {
  const [detail, setDetail] = useState<AnimeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

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

    setBookmarked(storage.isBookmarked(animeId))

    animeApi
      .getAnimeDetail(animeId)
      .then((data) => {
        if (isMounted) setDetail(data)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [animeId])

  const handleToggleBookmark = () => {
    if (!detail) return
    const targetId = detail.id || animeId
    const newState = storage.toggleBookmark({
      id: targetId,
      title: detail.title,
      poster: detail.poster,
      type: 'anime',
      rating: detail.rating,
      latestInfo: `${detail.episodesList.length} Episode`,
    })
    setBookmarked(newState)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
    >
      <div
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
            <span className="text-sm">Memuat detail anime...</span>
          </div>
        ) : !detail ? (
          <div className="h-96 flex items-center justify-center text-gray-400 text-sm">
            Gagal memuat informasi anime.
          </div>
        ) : (
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Header / Hero Banner */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-900">
              <img
                src={detail.backdrop || detail.poster}
                alt={detail.title}
                className="w-full h-full object-cover filter blur-xs brightness-50 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13161f] via-[#13161f]/60 to-transparent" />

              {/* Poster & Quick Info Header */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end gap-5">
                <img
                  src={detail.poster}
                  alt={detail.title}
                  className="w-28 sm:w-36 aspect-[3/4] object-cover rounded-xl border-2 border-gray-700/80 shadow-2xl shrink-0"
                />
                <div className="flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                      {detail.status}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      {detail.type}
                    </span>
                    {detail.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {detail.rating.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <h1 className="text-lg sm:text-2xl font-black text-white line-clamp-2">
                    {detail.title}
                  </h1>
                  {detail.titleJapanese && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                      {detail.titleJapanese}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6">
              {/* Action buttons & metadata strip */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                <div className="flex items-center gap-3">
                  {detail.episodesList.length > 0 && (
                    <button
                      onClick={() =>
                        onPlayEpisode(
                          detail.title,
                          detail.poster,
                          detail.episodesList[0],
                          detail.episodesList
                        )
                      }
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/50 transition transform active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Tonton Episode 1
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

                {/* Additional Info items */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  {detail.season && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      {detail.season}
                    </span>
                  )}
                  {detail.studio && (
                    <span className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-rose-400" />
                      {detail.studio}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    {detail.episodesList.length} Episode
                  </span>
                </div>
              </div>

              {/* Genres */}
              {detail.genres && detail.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.genres.map((g, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1e2b] text-gray-300 border border-gray-800"
                    >
                      {g}
                    </span>
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

              {/* Episodes Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Daftar Episode ({detail.episodesList.length})
                  </h3>
                </div>

                {detail.episodesList.length === 0 ? (
                  <p className="text-xs text-gray-500">Belum ada episode tersedia.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {detail.episodesList.map((ep) => (
                      <button
                        key={ep.episodeId}
                        onClick={() =>
                          onPlayEpisode(
                            detail.title,
                            detail.poster,
                            ep,
                            detail.episodesList
                          )
                        }
                        className="p-2.5 rounded-xl bg-[#161a24] hover:bg-rose-600 border border-gray-800/80 hover:border-rose-500 text-gray-200 hover:text-white transition group flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-xs font-bold">
                          {ep.num ? `Ep ${ep.num}` : ep.title}
                        </span>
                        <span className="text-[10px] text-gray-400 group-hover:text-rose-200 truncate w-full mt-0.5">
                          Tonton
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {detail.recommendations && detail.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                    Rekomendasi Anime Lainnya
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {detail.recommendations.slice(0, 6).map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => onSelectAnime(rec)}
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
      </div>
    </div>
  )
}
