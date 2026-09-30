import React, { useState } from 'react'
import { Search, Tv, BookOpen } from 'lucide-react'

interface TitleBarProps {
  onSearch: (query: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const TitleBar: React.FC<TitleBarProps> = ({ onSearch, activeTab, setActiveTab }) => {
  const [searchInput, setSearchInput] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      onSearch(searchInput.trim())
    }
  }

  return (
    <header className="h-14 bg-[#11131a] border-b border-gray-800/80 flex items-center justify-between px-4 select-none shrink-0 z-40 sticky top-0">
      {/* Brand & Mode switch */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/kurnime_logo.png"
            alt="Kurunime"
            className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-rose-950/50 border border-rose-500/30"
          />
          <span className="font-extrabold text-base tracking-wide text-white">KURUNIME</span>
        </div>

        {/* Quick Nav Switches */}
        <div className="hidden sm:flex items-center bg-[#181c26] p-1 rounded-lg border border-gray-800 text-xs font-medium ml-4">
          <button
            onClick={() => setActiveTab('anime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'anime'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Anime
          </button>
          <button
            onClick={() => setActiveTab('komik')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'komik'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Komik
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari judul anime atau komik..."
            className="w-full pl-10 pr-4 py-1.5 bg-[#181c26] text-sm text-gray-200 placeholder-gray-500 rounded-full border border-gray-700/60 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition"
          />
        </form>
      </div>
    </header>
  )
}
