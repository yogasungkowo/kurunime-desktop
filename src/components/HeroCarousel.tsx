import { useState, useEffect, useMemo } from 'react'
import type { Anime } from '../types/anime'
import {
  Star,
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react'

interface HeroCarouselProps {
  animeList: Anime[]
  onSelectAnimeId: (id: string) => void
}

export const HeroCarousel = ({ animeList, onSelectAnimeId }: HeroCarouselProps) => {
  // Sort by highest rating first and take top 6
  const featured = useMemo(() => {
    const list = [...animeList].filter((a) => a.rating > 0)
    list.sort((a, b) => b.rating - a.rating)
    if (list.length < 3) {
      return animeList.slice(0, 6)
    }
    return list.slice(0, 6)
  }, [animeList])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto rotate every 5.5 seconds unless user hovers
  useEffect(() => {
    if (featured.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [featured.length, isPaused])

  if (featured.length === 0) return null

  const current = featured[currentIndex]

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % featured.length)
  }

  // Render 5 stars based on rating out of 10 (scale: 0-5)
  const renderStarRating = (score: number) => {
    const starsOutOf5 = score / 2
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starsOutOf5 >= starIndex
          const half = !filled && starsOutOf5 >= starIndex - 0.5
          return (
            <div key={starIndex} className="relative">
              <Star
                className={`w-4 h-4 ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : half
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-gray-600'
                }`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl bg-[#0c0e14] min-h-[300px] sm:min-h-[360px] group transition-all duration-500"
    >
      {/* Background Backdrop with Gradient Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {featured.map((item, idx) => (
          <img
            key={item.id}
            src={item.backdrop || item.poster}
            alt={item.title}
            className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.38] transition-opacity duration-1000 ease-in-out scale-105 ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}

        {/* Cinematic Multi-layered Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f15] via-[#0d0f15]/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f15] via-[#0d0f15]/90 to-transparent z-10" />
      </div>

      {/* Main Content Info */}
      <div className="relative z-20 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 h-full min-h-[300px] sm:min-h-[360px]">
        <div className="max-w-2xl space-y-3">
          {/* Top Badges & Score */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-md shadow-rose-950/60 tracking-wider">
              <Sparkles className="w-3 h-3" />
              Anime Top Rating
            </span>

            {/* Score & Stars */}
            {current.rating > 0 && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30">
                {renderStarRating(current.rating)}
                <span className="text-xs font-black text-amber-400 ml-0.5">
                  {current.rating.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">/ 10</span>
              </div>
            )}

            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-800/80 text-gray-300 border border-gray-700/60 uppercase">
              {current.status}
            </span>
          </div>

          {/* Anime Title */}
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
              {current.title}
            </h2>
            {current.titleJapanese && (
              <p className="text-xs text-rose-300/80 italic mt-0.5 line-clamp-1">
                {current.titleJapanese}
              </p>
            )}
          </div>

          {/* Metadata: Genres & Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {current.year && (
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                {current.year}
              </span>
            )}
            {current.episodes > 0 && (
              <span className="flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                {current.episodes} Episode
              </span>
            )}
            {current.genres && current.genres.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {current.genres.slice(0, 3).map((g, gIdx) => (
                  <span
                    key={gIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#161a24]/80 text-gray-300 border border-gray-700/60"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis */}
          {current.synopsis && (
            <p className="text-xs text-gray-300/90 line-clamp-2 leading-relaxed max-w-xl hidden sm:block">
              {current.synopsis}
            </p>
          )}

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onSelectAnimeId(current.id)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xl shadow-rose-950/60 transition transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Tonton Sekarang
            </button>

            <button
              onClick={() => onSelectAnimeId(current.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/90 text-gray-200 text-xs font-semibold border border-gray-700/70 transition cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Detail
            </button>
          </div>
        </div>

        {/* Poster Thumbnail Card on the Right (hidden on small screens) */}
        <div
          onClick={() => onSelectAnimeId(current.id)}
          className="hidden md:block shrink-0 cursor-pointer group/poster"
        >
          <div className="w-32 lg:w-40 aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-700/80 shadow-2xl relative transform transition duration-300 group-hover/poster:scale-105 group-hover/poster:border-rose-500">
            <img
              src={current.poster}
              alt={current.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover/poster:bg-transparent transition" />
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400" />
              {current.rating.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-rose-600 text-gray-300 hover:text-white transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
        title="Sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-rose-600 text-gray-300 hover:text-white transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
        title="Berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel Dots / Progress Indicators at Bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {featured.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-6 h-1.5 bg-rose-500 shadow-md shadow-rose-900/50'
                : 'w-1.5 h-1.5 bg-gray-600/70 hover:bg-gray-400'
            }`}
            title={`Slide ${idx + 1}: ${item.title}`}
          />
        ))}
      </div>
    </div>
  )
}
