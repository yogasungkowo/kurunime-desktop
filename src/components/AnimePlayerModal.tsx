import { useEffect, useState } from 'react'
import type { EpisodeDetail, EpisodeInfo } from '../types/anime'
import { animeApi } from '../services/animeApi'
import { storage } from '../services/storage'
import {
  X,
  Server,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Play,
  Film,
  Copy,
  Check,
  Sparkles,
  HardDrive,
} from 'lucide-react'

interface AnimePlayerModalProps {
  animeTitle: string
  animePoster: string
  animeId: string
  episodeInfo: EpisodeInfo
  allEpisodes: EpisodeInfo[]
  onClose: () => void
  onSelectEpisode: (ep: EpisodeInfo) => void
}

interface ServerItem {
  quality: string
  title: string
  serverId: string
}

interface FlatDownload {
  quality: string
  size?: string
  server: string
  url: string
}

// Helper to decode quality from Otakudesu base64 serverId payload
function extractQuality(serverId: string, fallbackTitle?: string): string {
  try {
    const pad = serverId + '='.repeat((4 - (serverId.length % 4)) % 4)
    const jsonStr = atob(pad)
    const parsed = JSON.parse(jsonStr)
    if (parsed.q) {
      return String(parsed.q).toLowerCase()
    }
  } catch {
    // fallback
  }

  const match = fallbackTitle?.match(/(\d+p)/i)
  if (match) return match[1].toLowerCase()

  return 'other'
}

function parseQualityDetails(rawTitle: string) {
  const isMkv = /mkv/i.test(rawTitle)
  const format = isMkv ? 'MKV' : 'MP4'
  const match = rawTitle.match(/(1080p|720p|480p|360p)/i)
  const resolution = match ? match[1].toUpperCase() : ''
  return { format, resolution, displayName: rawTitle.trim() }
}

function getServerStyle(serverName: string) {
  const s = serverName.toLowerCase()
  if (s.includes('mega')) {
    return 'bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30'
  }
  if (s.includes('gofile')) {
    return 'bg-cyan-500/10 hover:bg-cyan-600 text-cyan-300 hover:text-white border-cyan-500/30'
  }
  if (s.includes('acefile')) {
    return 'bg-amber-500/10 hover:bg-amber-600 text-amber-300 hover:text-white border-amber-500/30'
  }
  if (s.includes('drive') || s.includes('google')) {
    return 'bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white border-blue-500/30'
  }
  if (s.includes('pdrain') || s.includes('filedon')) {
    return 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
  }
  return 'bg-gray-800/90 hover:bg-rose-600 text-gray-200 hover:text-white border-gray-700/60'
}

export const AnimePlayerModal = ({
  animeTitle,
  animePoster,
  animeId,
  episodeInfo,
  allEpisodes,
  onClose,
  onSelectEpisode,
}: AnimePlayerModalProps) => {
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<EpisodeDetail | null>(null)
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('')
  const [activeServerId, setActiveServerId] = useState<string>('default')
  const [loadingServer, setLoadingServer] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sidebarTab, setSidebarTab] = useState<'episodes' | 'downloads'>('episodes')
  const [formatFilter, setFormatFilter] = useState<'all' | 'mp4' | 'mkv'>('all')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Close on Escape key
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
    setErrorMsg('')
    setActiveServerId('default')

    // Save to history
    storage.addHistory({
      id: animeId,
      title: animeTitle,
      poster: animePoster,
      type: 'anime',
      lastEpisodeOrChapter: episodeInfo.title,
      lastSubId: episodeInfo.episodeId,
    })

    animeApi
      .getEpisodeDetail(episodeInfo.episodeId)
      .then((data) => {
        if (!isMounted) return
        if (data) {
          setDetail(data)
          const defUrl = data.defaultStreamingUrl || data.streamUrl || ''
          if (defUrl) {
            setCurrentStreamUrl(defUrl)
          } else {
            // Check if there are servers in qualityList to fallback to
            const qList = (data.server as any)?.qualityList
            if (Array.isArray(qList) && qList.length > 0 && qList[0].serverList?.length > 0) {
              const first = qList[0].serverList[0]
              loadServerEmbed(first.serverId)
            }
          }
        } else {
          setErrorMsg('Gagal memuat informasi episode streaming.')
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
  }, [episodeInfo.episodeId])

  const loadServerEmbed = async (serverId: string) => {
    setLoadingServer(true)
    setActiveServerId(serverId)
    try {
      const embedUrl = await animeApi.getServerEmbed(serverId)
      if (embedUrl) {
        setCurrentStreamUrl(embedUrl)
      } else {
        alert('Gagal mengambil URL video dari server mirror ini.')
      }
    } catch {
      alert('Terjadi kesalahan koneksi server mirror.')
    } finally {
      setLoadingServer(false)
    }
  }

  const handleSelectDefaultServer = () => {
    setActiveServerId('default')
    const defUrl = detail?.defaultStreamingUrl || detail?.streamUrl || ''
    if (defUrl) {
      setCurrentStreamUrl(defUrl)
    }
  }

  const handleOpenDownload = async (url: string) => {
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(url)
    } catch {
      window.open(url, '_blank')
    }
  }

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2500)
    } catch {
      // fallback
    }
  }

  // Parse and group servers by quality
  const groupedServers: Record<string, ServerItem[]> = {}
  if (detail?.server) {
    if (Array.isArray(detail.server)) {
      detail.server.forEach((s) => {
        const q = extractQuality(s.serverId, s.title)
        if (!groupedServers[q]) groupedServers[q] = []
        groupedServers[q].push({ quality: q, title: s.title, serverId: s.serverId })
      })
    } else if (Array.isArray(detail.server.qualityList)) {
      detail.server.qualityList.forEach((qGroup) => {
        if (Array.isArray(qGroup.serverList)) {
          qGroup.serverList.forEach((s) => {
            const q = extractQuality(s.serverId, qGroup.title)
            if (!groupedServers[q]) groupedServers[q] = []
            groupedServers[q].push({
              quality: q,
              title: s.title,
              serverId: s.serverId,
            })
          })
        }
      })
    }
  }

  // Sort qualities descending: 1080p, 720p, 480p, 360p, other
  const qualityPriority = ['1080p', '720p', '480p', '360p']
  const sortedQualities = Object.keys(groupedServers).sort((a, b) => {
    const idxA = qualityPriority.indexOf(a)
    const idxB = qualityPriority.indexOf(b)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.localeCompare(b)
  })

  // Parse download links supporting urlList, serverList, and downloadUrl
  const downloads: FlatDownload[] = []
  if (detail?.download?.qualityList && Array.isArray(detail.download.qualityList)) {
    detail.download.qualityList.forEach((qGroup: any) => {
      const qual = qGroup.title || 'MP4'
      const size = qGroup.size || ''
      const list = Array.isArray(qGroup.urlList)
        ? qGroup.urlList
        : Array.isArray(qGroup.serverList)
        ? qGroup.serverList
        : []
      list.forEach((s: any) => {
        if (s && s.url) {
          downloads.push({
            quality: qual,
            size,
            server: s.title || 'Download',
            url: s.url,
          })
        }
      })
    })
  } else if (Array.isArray(detail?.downloadUrl)) {
    detail.downloadUrl.forEach((dl) => {
      if (dl && dl.url) {
        downloads.push({
          quality: dl.quality || 'MP4',
          server: dl.server || 'Download',
          url: dl.url,
        })
      }
    })
  }

  // Group downloads by quality title
  const downloadGroups = downloads.reduce<
    Record<string, { size?: string; links: FlatDownload[] }>
  >((acc, curr) => {
    if (!acc[curr.quality]) {
      acc[curr.quality] = { size: curr.size, links: [] }
    }
    acc[curr.quality].links.push(curr)
    return acc
  }, {})

  // Sort download quality groups (1080p -> 720p -> 480p -> 360p)
  const sortedDownloadQualities = Object.keys(downloadGroups).sort((a, b) => {
    const resA = a.match(/(1080p|720p|480p|360p)/i)?.[1]?.toLowerCase() || ''
    const resB = b.match(/(1080p|720p|480p|360p)/i)?.[1]?.toLowerCase() || ''
    const idxA = qualityPriority.indexOf(resA)
    const idxB = qualityPriority.indexOf(resB)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.localeCompare(b)
  })

  // Filtered download qualities by format
  const filteredDownloadQualities = sortedDownloadQualities.filter((q) => {
    if (formatFilter === 'all') return true
    if (formatFilter === 'mp4') return /mp4/i.test(q)
    if (formatFilter === 'mkv') return /mkv/i.test(q)
    return true
  })

  // Find index of current episode in list
  const currentIndex = allEpisodes.findIndex((ep) => ep.episodeId === episodeInfo.episodeId)
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex >= 0 && currentIndex < allEpisodes.length - 1
      ? allEpisodes[currentIndex + 1]
      : null

  const getQualityBadgeStyle = (q: string) => {
    if (q === '720p' || q === '1080p') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    }
    if (q === '480p') {
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30'
    }
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-2 sm:p-4 overflow-hidden cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex flex-col w-full h-full max-w-7xl mx-auto overflow-hidden bg-[#0d1017] border border-gray-800 rounded-2xl shadow-2xl p-3 sm:p-4 cursor-default"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 transition cursor-pointer"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {animeTitle}
              </h2>
              <p className="text-xs text-rose-400 font-semibold">{episodeInfo.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800/80 text-gray-400 hover:text-white hover:bg-rose-600 transition cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main player area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 mt-3 overflow-hidden">
          {/* Video Player & Server Selector by Quality */}
          <div className="flex-1 flex flex-col bg-black rounded-xl overflow-hidden border border-gray-800">
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                  <span className="text-xs">Memuat pemutar video...</span>
                </div>
              ) : errorMsg ? (
                <div className="flex flex-col items-center gap-2 text-rose-400 text-center p-6">
                  <AlertCircle className="w-10 h-10" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              ) : currentStreamUrl ? (
                <iframe
                  src={currentStreamUrl}
                  title={episodeInfo.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="text-xs text-gray-500">Pilih server pemutar di bawah</div>
              )}

              {loadingServer && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                  Menghubungkan ke server mirror...
                </div>
              )}
            </div>

            {/* Grouped Server Controls Bar */}
            <div className="bg-[#141720] p-3 flex flex-col gap-2.5 border-t border-gray-800">
              {/* Top Bar: Primary Server, Download Button & Prev/Next Episode Navigation */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-rose-500" />
                    Server:
                  </span>

                  {/* Primary Default Server */}
                  {(detail?.defaultStreamingUrl || detail?.streamUrl) && (
                    <button
                      onClick={handleSelectDefaultServer}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-semibold cursor-pointer ${
                        activeServerId === 'default'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60 ring-1 ring-rose-400'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Server Utama
                    </button>
                  )}

                  {/* Download Shortcut Button */}
                  {downloads.length > 0 && (
                    <button
                      onClick={() => setSidebarTab('downloads')}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium border cursor-pointer ${
                        sidebarTab === 'downloads'
                          ? 'bg-rose-600/90 text-white border-rose-500 shadow-md'
                          : 'bg-gray-800/80 text-rose-400 hover:text-white hover:bg-rose-600/20 border-rose-500/30'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh ({sortedDownloadQualities.length} Kualitas)</span>
                    </button>
                  )}
                </div>

                {/* Prev / Next Episode navigation */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={!prevEpisode}
                    onClick={() => prevEpisode && onSelectEpisode(prevEpisode)}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition ${
                      prevEpisode
                        ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 cursor-pointer'
                        : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev Ep
                  </button>
                  <button
                    disabled={!nextEpisode}
                    onClick={() => nextEpisode && onSelectEpisode(nextEpisode)}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition ${
                      nextEpisode
                        ? 'border-rose-600/60 bg-rose-600 text-white hover:bg-rose-500 font-semibold cursor-pointer'
                        : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Next Ep
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quality-Separated Server Mirrors */}
              {sortedQualities.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-gray-800/60 max-h-32 overflow-y-auto pr-1">
                  {sortedQualities.map((qual) => (
                    <div
                      key={qual}
                      className="flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-[#181c27]/70 border border-gray-800/50"
                    >
                      {/* Quality Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[11px] uppercase tracking-wider border shrink-0 flex items-center gap-1 ${getQualityBadgeStyle(
                          qual
                        )}`}
                      >
                        <Film className="w-3 h-3" />
                        {qual}
                      </span>

                      {/* Server Mirror Buttons for this specific quality */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {groupedServers[qual].map((s, idx) => {
                          const isActive = activeServerId === s.serverId
                          return (
                            <button
                              key={`${s.serverId}-${idx}`}
                              onClick={() => loadServerEmbed(s.serverId)}
                              className={`text-xs px-3 py-1 rounded-md transition font-medium capitalize cursor-pointer ${
                                isActive
                                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/60 ring-1 ring-rose-400'
                                  : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/60'
                              }`}
                            >
                              {s.title}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Episode Selector & Modern Download Section */}
          <div className="w-full lg:w-96 flex flex-col bg-[#141720] rounded-xl border border-gray-800 overflow-hidden shrink-0 max-h-[380px] lg:max-h-full">
            {/* Sidebar Tab Header */}
            <div className="flex items-center border-b border-gray-800 bg-[#161a24] p-1.5 gap-1.5 shrink-0">
              <button
                onClick={() => setSidebarTab('episodes')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sidebarTab === 'episodes'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Episode ({allEpisodes.length})</span>
              </button>

              <button
                onClick={() => setSidebarTab('downloads')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sidebarTab === 'downloads'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  Download {sortedDownloadQualities.length > 0 ? `(${sortedDownloadQualities.length})` : ''}
                </span>
              </button>
            </div>

            {/* Tab 1: Episode List */}
            {sidebarTab === 'episodes' && (
              <div className="flex-1 flex flex-col p-3 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Pilih Episode
                  </span>
                  <span className="text-[11px] text-rose-400 font-bold">
                    Episode {episodeInfo.title.replace(/[^0-9]/g, '') || episodeInfo.title}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-1.5 overflow-y-auto pr-1 flex-1">
                  {allEpisodes.map((ep) => {
                    const isActive = ep.episodeId === episodeInfo.episodeId
                    return (
                      <button
                        key={ep.episodeId}
                        onClick={() => onSelectEpisode(ep)}
                        className={`py-2 px-1 text-xs rounded-lg font-medium text-center transition cursor-pointer ${
                          isActive
                            ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/60 ring-1 ring-rose-400'
                            : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/40'
                        }`}
                      >
                        {ep.num || ep.title.replace(/[^0-9]/g, '') || 'Ep'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Download Links Section */}
            {sidebarTab === 'downloads' && (
              <div className="flex-1 flex flex-col p-3 overflow-hidden">
                {/* Format Filter Pills */}
                {sortedDownloadQualities.length > 0 && (
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800/80 shrink-0">
                    <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-rose-500" />
                      Format Video:
                    </span>
                    <div className="flex items-center gap-1">
                      {(['all', 'mp4', 'mkv'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormatFilter(fmt)}
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded transition cursor-pointer ${
                            formatFilter === fmt
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {fmt === 'all' ? 'Semua' : fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download Items */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
                  {sortedDownloadQualities.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center gap-2 text-center text-gray-400 p-4">
                      <Download className="w-8 h-8 text-gray-600" />
                      <p className="text-xs font-medium">Tautan unduh belum tersedia untuk episode ini.</p>
                      <p className="text-[10px] text-gray-500">
                        Coba gunakan pemutar server mirror di sebelah kiri.
                      </p>
                    </div>
                  ) : filteredDownloadQualities.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-gray-400 p-4 text-xs">
                      Tidak ada video dengan format {formatFilter.toUpperCase()}.
                    </div>
                  ) : (
                    filteredDownloadQualities.map((qualityKey) => {
                      const group = downloadGroups[qualityKey]
                      const { format, resolution, displayName } = parseQualityDetails(qualityKey)

                      return (
                        <div
                          key={qualityKey}
                          className="bg-[#181c28] rounded-xl p-3 border border-gray-800/80 hover:border-gray-700/80 transition shadow-sm"
                        >
                          {/* Card Header: Resolution, Format & File Size */}
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide border ${
                                  format === 'MKV'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                }`}
                              >
                                {format}
                              </span>

                              <span className="text-xs font-bold text-white flex items-center gap-1">
                                {resolution || displayName}
                              </span>
                            </div>

                            {group.size && (
                              <span className="text-[11px] font-semibold text-rose-300 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded-md">
                                {group.size}
                              </span>
                            )}
                          </div>

                          {/* Server List */}
                          <div className="grid grid-cols-2 gap-1.5">
                            {group.links.map((link, lIdx) => {
                              const isCopied = copiedUrl === link.url
                              const styleClass = getServerStyle(link.server)

                              return (
                                <div
                                  key={lIdx}
                                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 transition text-xs font-medium ${styleClass}`}
                                >
                                  {/* Open in browser button */}
                                  <button
                                    onClick={() => handleOpenDownload(link.url)}
                                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left cursor-pointer"
                                    title={`Download via ${link.server}`}
                                  >
                                    <span className="truncate">{link.server}</span>
                                    <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                                  </button>

                                  {/* Copy Link button */}
                                  <button
                                    onClick={() => handleCopyLink(link.url)}
                                    className="p-1 rounded hover:bg-black/30 text-gray-300 hover:text-white transition ml-1 shrink-0 cursor-pointer"
                                    title="Salin Tautan"
                                  >
                                    {isCopied ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                                    )}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer hint */}
                {sortedDownloadQualities.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      Klik server untuk download
                    </span>
                    <span>Ikon salin untuk IDM/FDM</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
