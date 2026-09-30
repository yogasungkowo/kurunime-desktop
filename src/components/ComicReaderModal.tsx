import React, { useEffect, useState, useRef } from 'react'
import type { ChapterData, ComicChapter } from '../types/comic'
import { comicApi } from '../services/comicApi'
import { storage } from '../services/storage'
import {
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  Maximize,
  Minimize,
} from 'lucide-react'
import { motion } from 'motion/react'

interface ComicReaderModalProps {
  comicSlug: string
  comicTitle: string
  chapter: ComicChapter
  allChapters: ComicChapter[]
  onClose: () => void
  onSelectChapter: (chap: ComicChapter) => void
}

export const ComicReaderModal: React.FC<ComicReaderModalProps> = ({
  comicSlug,
  comicTitle,
  chapter,
  allChapters,
  onClose,
  onSelectChapter,
}) => {
  const [data, setData] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setErrorMsg('')

    // Save to reading history
    storage.addHistory({
      id: comicSlug,
      title: comicTitle,
      poster: '',
      type: 'comic',
      lastEpisodeOrChapter: chapter.title,
      lastSubId: chapter.slug,
    })

    // Scroll to top
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }

    comicApi
      .getChapter(comicSlug, chapter.chapterNumber || chapter.slug)
      .then((res) => {
        if (!isMounted) return
        if (res && res.images && res.images.length > 0) {
          setData(res)
        } else {
          setErrorMsg('Gagal memuat gambar untuk chapter ini.')
        }
      })
      .catch((err) => {
        if (isMounted) setErrorMsg(err.message || 'Terjadi kesalahan')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [chapter.slug, comicSlug])

  // Prev / next chapter calculation
  const currentIndex = allChapters.findIndex((c) => c.slug === chapter.slug)
  // Usually allChapters is sorted newest to oldest, so:
  // Next chapter in story = previous index
  // Previous chapter in story = next index
  const nextInStory = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const prevInStory =
    currentIndex >= 0 && currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 bg-[#0b0c10] flex flex-col overflow-hidden select-none"
    >
      {/* Floating Top Navigation */}
      <header className="h-14 bg-[#11131a]/95 backdrop-blur-md border-b border-gray-800 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white line-clamp-1">{comicTitle}</h2>
            <p className="text-xs text-rose-400 font-semibold">{chapter.title}</p>
          </div>
        </div>

        {/* Chapter selector & navigation */}
        <div className="flex items-center gap-2">
          {/* Chapter Selector Dropdown */}
          <select
            value={chapter.slug}
            onChange={(e) => {
              const target = allChapters.find((c) => c.slug === e.target.value)
              if (target) onSelectChapter(target)
            }}
            className="bg-[#181c26] text-xs text-gray-200 border border-gray-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500 max-w-[130px] sm:max-w-[200px]"
          >
            {allChapters.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            disabled={!prevInStory}
            onClick={() => prevInStory && onSelectChapter(prevInStory)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              prevInStory
                ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                : 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed'
            }`}
            title="Chapter Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            disabled={!nextInStory}
            onClick={() => nextInStory && onSelectChapter(nextInStory)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              nextInStory
                ? 'bg-rose-600 border-rose-500 text-white hover:bg-rose-500'
                : 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed'
            }`}
            title="Chapter Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition hidden sm:block"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-rose-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reader Body / Continuous Images */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center py-4 bg-[#08090d]"
      >
        {loading ? (
          <div className="m-auto flex flex-col items-center gap-3 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
            <span className="text-xs">Memuat lembaran komik...</span>
          </div>
        ) : errorMsg ? (
          <div className="m-auto flex flex-col items-center gap-2 text-rose-400 text-center p-6">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        ) : data && data.images.length > 0 ? (
          <div className="w-full max-w-3xl flex flex-col items-center shadow-2xl">
            {data.images.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Halaman ${idx + 1}`}
                loading="lazy"
                className="w-full h-auto block select-none pointer-events-none"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ))}

            {/* Bottom chapter navigation */}
            <div className="w-full bg-[#11131a] p-6 mt-8 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Selesai Membaca {chapter.title}</h4>
                <p className="text-xs text-gray-400">Lanjutkan ke chapter berikutnya?</p>
              </div>

              <div className="flex items-center gap-3">
                {prevInStory && (
                  <button
                    onClick={() => onSelectChapter(prevInStory)}
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Chapter Sebelumnya
                  </button>
                )}
                {nextInStory ? (
                  <button
                    onClick={() => onSelectChapter(nextInStory)}
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-900/50"
                  >
                    Chapter Berikutnya
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">Ini adalah chapter paling baru!</span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Floating Scroll to Top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-rose-600 text-white shadow-xl hover:bg-rose-500 transition-transform active:scale-90"
        title="Kembali ke atas"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </motion.div>
  )
}
