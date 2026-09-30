import React from 'react'
import {
  Tv,
  BookOpen,
  Calendar,
  Bookmark,
  History,
  Flame,
  CheckCircle2,
  Clock,
  Tags,
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  subFilter: string
  setSubFilter: (filter: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  subFilter,
  setSubFilter,
}) => {
  return (
    <aside className="w-56 bg-[#11131a] border-r border-gray-800/80 flex flex-col justify-between shrink-0 p-3 select-none">
      <div className="space-y-6">
        {/* Navigation Category: Anime */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 px-3 mb-2 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-rose-500" />
            Anime
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('anime')
                setSubFilter('home')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'anime' && subFilter === 'home'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Flame className="w-4 h-4" />
              Beranda Anime
            </button>
            <button
              onClick={() => {
                setActiveTab('anime')
                setSubFilter('ongoing')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'anime' && subFilter === 'ongoing'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Clock className="w-4 h-4" />
              Sedang Tayang
            </button>
            <button
              onClick={() => {
                setActiveTab('anime')
                setSubFilter('completed')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'anime' && subFilter === 'completed'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Anime Tamat
            </button>
            <button
              onClick={() => {
                setActiveTab('schedule')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'schedule'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Jadwal Rilis
            </button>
            <button
              onClick={() => {
                setActiveTab('anime-genres')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'anime-genres'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Tags className="w-4 h-4" />
              Genre Anime
            </button>
          </div>
        </div>

        {/* Navigation Category: Komik */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 px-3 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-rose-500" />
            Komik & Manga
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab('komik')
                setSubFilter('all')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'komik' && subFilter === 'all'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Flame className="w-4 h-4" />
              Update Terbaru
            </button>
            <button
              onClick={() => {
                setActiveTab('komik')
                setSubFilter('popular')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'komik' && subFilter === 'popular'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Komik Populer
            </button>
            <button
              onClick={() => {
                setActiveTab('komik')
                setSubFilter('manga')
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'komik' && subFilter === 'manga'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <span>Manga</span>
              <span className="text-[10px] text-gray-500">JP</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('komik')
                setSubFilter('manhwa')
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'komik' && subFilter === 'manhwa'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <span>Manhwa</span>
              <span className="text-[10px] text-gray-500">KR</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('komik')
                setSubFilter('manhua')
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'komik' && subFilter === 'manhua'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <span>Manhua</span>
              <span className="text-[10px] text-gray-500">CN</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('comic-genres')
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'comic-genres'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Tags className="w-4 h-4" />
              Genre Komik
            </button>
          </div>
        </div>

        {/* Library */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 px-3 mb-2 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-rose-500" />
            Koleksi
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('bookmark')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'bookmark'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Bookmark Saya
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'history'
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <History className="w-4 h-4" />
              Riwayat Terakhir
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
