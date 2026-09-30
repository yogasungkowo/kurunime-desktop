import React, { useEffect, useState } from 'react'
import type { AnimeScheduleDay } from '../types/anime'
import { animeApi } from '../services/animeApi'
import { Calendar, RefreshCw, PlayCircle } from 'lucide-react'

interface ScheduleViewProps {
  onSelectAnimeId: (animeId: string) => void
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onSelectAnimeId }) => {
  const [schedule, setSchedule] = useState<AnimeScheduleDay[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string>('Senin')

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    animeApi
      .getSchedule()
      .then((data) => {
        if (!isMounted) return
        setSchedule(data)
        if (data.length > 0) {
          // Detect current day in Indonesian
          const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
          const today = daysIndo[new Date().getDay()]
          const matching = data.find((d) => d.day.toLowerCase().includes(today.toLowerCase()))
          if (matching) {
            setActiveDay(matching.day)
          } else {
            setActiveDay(data[0].day)
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const currentDayGroup = schedule.find((s) => s.day === activeDay)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            Jadwal Rilis Anime
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Jadwal penayangan episode baru anime mingguan
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
          <span className="text-xs">Memuat jadwal rilis...</span>
        </div>
      ) : schedule.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-xs">
          Jadwal rilis tidak tersedia saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800">
            {schedule.map((group) => {
              const isActive = group.day === activeDay
              return (
                <button
                  key={group.day}
                  onClick={() => setActiveDay(group.day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                      : 'bg-[#161a24] text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {group.day} ({group.list.length})
                </button>
              )
            })}
          </div>

          {/* Anime List for selected day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentDayGroup?.list.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectAnimeId(item.animeId)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-[#141720] border border-gray-800/80 hover:border-rose-500/60 transition cursor-pointer hover:shadow-lg"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-rose-600/20 group-hover:text-rose-400 transition">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-200 group-hover:text-rose-400 truncate">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">Lihat</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
