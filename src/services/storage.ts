export interface BookmarkItem {
  id: string
  title: string
  poster: string
  type: 'anime' | 'comic'
  rating?: number
  latestInfo?: string
  addedAt: number
}

export interface HistoryItem {
  id: string
  title: string
  poster: string
  type: 'anime' | 'comic'
  lastEpisodeOrChapter: string
  lastSubId?: string
  updatedAt: number
}

const BOOKMARK_KEY = 'kurunime_bookmarks'
const HISTORY_KEY = 'kurunime_history'

export const storage = {
  getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(BOOKMARK_KEY)
      if (!data) return []
      const parsed = JSON.parse(data)
      if (!Array.isArray(parsed)) return []
      // Filter out invalid items without valid id
      const valid = parsed.filter((item): item is BookmarkItem => Boolean(item && typeof item.id === 'string' && item.id.trim()))
      if (valid.length !== parsed.length) {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(valid))
      }
      return valid
    } catch {
      return []
    }
  },

  isBookmarked(id: string): boolean {
    if (!id || !id.trim()) return false
    const list = this.getBookmarks()
    return list.some((item) => item.id === id)
  },

  toggleBookmark(item: Omit<BookmarkItem, 'addedAt'>): boolean {
    if (!item || !item.id || !item.id.trim()) return false
    const list = this.getBookmarks()
    const index = list.findIndex((i) => i.id === item.id)
    if (index >= 0) {
      list.splice(index, 1)
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list))
      return false
    } else {
      list.unshift({ ...item, addedAt: Date.now() })
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list))
      return true
    }
  },

  removeBookmark(id: string): void {
    if (!id) return
    const list = this.getBookmarks().filter((item) => item.id !== id)
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list))
  },

  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  addHistory(item: Omit<HistoryItem, 'updatedAt'>) {
    const list = this.getHistory().filter((i) => i.id !== item.id)
    list.unshift({ ...item, updatedAt: Date.now() })
    // Keep max 100 history items
    if (list.length > 100) list.pop()
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  },

  clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
  },
}
