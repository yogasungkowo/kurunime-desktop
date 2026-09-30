import React from 'react'
import type { Comic } from '../types/comic'
import { Star, BookOpen } from 'lucide-react'

interface ComicCardProps {
  comic: Comic
  onClick: (comic: Comic) => void
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onClick }) => {
  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'manga':
        return 'bg-blue-600/80'
      case 'manhwa':
        return 'bg-purple-600/80'
      case 'manhua':
        return 'bg-amber-600/80'
      default:
        return 'bg-rose-600/80'
    }
  }

  return (
    <div
      onClick={() => onClick(comic)}
      className="group relative flex flex-col bg-[#161922] rounded-xl overflow-hidden border border-gray-800/80 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-950/20 transition-all duration-300 cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
        <img
          src={comic.poster}
          alt={comic.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-transparent to-black/40 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Read Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {comic.rating && comic.rating > 0 ? (
            <span className="flex items-center gap-1 bg-black/75 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" />
              {comic.rating.toFixed(1)}
            </span>
          ) : <span />}

          {comic.type && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white backdrop-blur-md ${getTypeColor(
                comic.type
              )}`}
            >
              {comic.type}
            </span>
          )}
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-medium text-gray-300 pointer-events-none">
          {comic.chapter && (
            <span className="bg-black/80 text-rose-300 font-semibold px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[70%]">
              {comic.chapter}
            </span>
          )}
          {comic.updatedAt && (
            <span className="text-[10px] text-gray-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {comic.updatedAt}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3
          className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-rose-400 transition"
          title={comic.title}
        >
          {comic.title}
        </h3>

        {comic.genres && comic.genres.length > 0 && (
          <p className="text-[10px] text-gray-500 mt-2 truncate">
            {comic.genres.slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </div>
  )
}
