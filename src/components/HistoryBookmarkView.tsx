import React, { useState, useEffect } from 'react'
import { storage, BookmarkItem, HistoryItem } from '../services/storage'
import { Bookmark, History, Trash2, PlayCircle, BookOpen, Star } from 'lucide-react'

interface HistoryBookmarkViewProps {
  type: 'bookmark' | 'history'
  onSelectAnimeId: (id: string) => void
  onSelectComicSlug: (slug: string) => void
}

export const HistoryBookmarkView: React.FC<HistoryBookmarkViewProps> = ({
  type,
  onSelectAnimeId,
  onSelectComicSlug,
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])

  const loadData = () => {
    setBookmarks(storage.getBookmarks())
    setHistory(storage.getHistory())
  }

  useEffect(() => {
    loadData()
  }, [type])

  const handleClearHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat tontonan & bacaan?')) {
      storage.clearHistory()
      loadData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            {type === 'bookmark' ? (
              <>
                <Bookmark className="w-5 h-5 text-rose-500" />
                Bookmark Saya
              </>
            ) : (
              <>
                <History className="w-5 h-5 text-rose-500" />
                Riwayat Terakhir
              </>
            )}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {type === 'bookmark'
              ? 'Daftar anime dan komik favorit yang Anda simpan'
              : 'Daftar anime dan komik yang baru saja Anda tonton atau baca'}
          </p>
        </div>

        {type === 'history' && history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-rose-600/20 text-gray-300 hover:text-rose-400 text-xs border border-gray-700/60 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Riwayat
          </button>
        )}
      </div>

      {type === 'bookmark' ? (
        bookmarks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
            <Bookmark className="w-8 h-8 text-gray-600 mb-1" />
            <span>Belum ada anime atau komik yang dibookmark.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {bookmarks.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.id) return
                  if (item.type === 'anime') {
                    onSelectAnimeId(item.id)
                  } else {
                    onSelectComicSlug(item.id)
                  }
                }}
                className="group relative flex flex-col bg-[#161922] rounded-xl overflow-hidden border border-gray-800/80 hover:border-rose-500/50 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-900 relative">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Play / Open hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                      {item.type === 'anime' ? (
                        <PlayCircle className="w-6 h-6 ml-0.5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-rose-600 text-white pointer-events-none">
                    {item.type}
                  </span>

                  {/* Remove bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      storage.removeBookmark(item.id)
                      loadData()
                    }}
                    title="Hapus dari Bookmark"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-gray-300 hover:text-white transition opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {item.rating && item.rating > 0 ? (
                    <span className="absolute bottom-2 right-2 flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-black/75 px-1.5 py-0.5 rounded pointer-events-none">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-semibold text-gray-200 group-hover:text-rose-400 line-clamp-2 transition-colors">
                    {item.title}
                  </h4>
                  {item.latestInfo && (
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      {item.latestInfo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
          <History className="w-8 h-8 text-gray-600 mb-1" />
          <span>Belum ada riwayat aktivitas.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, idx) => (
            <div
              key={idx}
              onClick={() =>
                item.type === 'anime'
                  ? onSelectAnimeId(item.id)
                  : onSelectComicSlug(item.id)
              }
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#141720] border border-gray-800/80 hover:border-rose-500/60 transition cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-800 text-gray-300 flex items-center justify-center shrink-0">
                  {item.type === 'anime' ? (
                    <PlayCircle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-rose-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white hover:text-rose-400">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Terakhir: <span className="text-rose-400 font-semibold">{item.lastEpisodeOrChapter}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-gray-800 text-gray-300">
                  {item.type}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">
                  {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
