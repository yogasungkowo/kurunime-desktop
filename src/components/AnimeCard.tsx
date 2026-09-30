import React from 'react'
import type { Anime } from '../types/anime'
import { Star, PlayCircle } from 'lucide-react'

interface AnimeCardProps {
  anime: Anime
  onClick: (anime: Anime) => void
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  return (
    <div
      onClick={() => onClick(anime)}
      className="group relative flex flex-col bg-[#161922] rounded-xl overflow-hidden border border-gray-800/80 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-950/20 transition-all duration-300 cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80'
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-transparent to-black/40 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <PlayCircle className="w-6 h-6 ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {anime.rating > 0 ? (
            <span className="flex items-center gap-1 bg-black/75 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" />
              {anime.rating.toFixed(1)}
            </span>
          ) : <span />}

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md ${
              anime.status === 'Ongoing'
                ? 'bg-emerald-500/80 text-white'
                : 'bg-rose-600/80 text-white'
            }`}
          >
            {anime.status || anime.type || 'TV'}
          </span>
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-medium text-gray-300 pointer-events-none">
          {anime.currentEpisode ? (
            <span className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
              Ep {anime.currentEpisode}
            </span>
          ) : anime.episodes > 0 ? (
            <span className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
              {anime.episodes} Ep
            </span>
          ) : null}

          {anime.releaseDay && (
            <span className="bg-rose-950/70 text-rose-300 px-1.5 py-0.5 rounded text-[10px]">
              {anime.releaseDay}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3
          className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-rose-400 transition"
          title={anime.title}
        >
          {anime.title}
        </h3>

        {anime.genres && anime.genres.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-2 truncate">
            {anime.genres.slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </div>
  )
}
