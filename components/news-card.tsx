"use client"
import { motion } from "framer-motion"
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react"

type NewsImpact = "positive" | "negative" | "neutral"

type NewsItem = {
  id: string
  title: string
  content: string
  source: string
  date: string
  impact: NewsImpact
  playerName?: string
  teamName?: string
  url?: string
}

interface NewsCardProps {
  news: NewsItem[]
  title?: string
  onNewsClick?: (newsItem: NewsItem) => void
}

export function NewsCard({ news, title = "Latest NBA news:", onNewsClick }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[rgba(184,86,47,0.15)] rounded-[20px] p-5 w-full max-w-[400px]"
    >
      <h3 className="text-white text-xl font-normal leading-[130.94%] mb-5">{title}</h3>

      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={item.id} className="space-y-4">
            {index > 0 && <div className="w-full h-px bg-[#B8562F]" />}
            <NewsCardContent newsItem={item} onNewsClick={onNewsClick} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function NewsCardContent({
  newsItem,
  onNewsClick,
}: {
  newsItem: NewsItem
  onNewsClick?: (newsItem: NewsItem) => void
}) {
  const getImpactIcon = () => {
    switch (newsItem.impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-[#54C863]" />
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-white text-base font-semibold leading-tight mb-1">{newsItem.title}</div>
          <div className="flex items-center gap-2 text-[#AFAFAF] text-xs font-normal">
            <span>{newsItem.source}</span>
            <span>•</span>
            <span>{formatDate(newsItem.date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">{getImpactIcon()}</div>
      </div>

      {/* Content */}
      <div className="text-[#AFAFAF] text-sm font-normal leading-relaxed">
        {newsItem.content.length > 150 ? `${newsItem.content.substring(0, 150)}...` : newsItem.content}
      </div>

      {/* Tags */}
      {(newsItem.playerName || newsItem.teamName) && (
        <div className="flex items-center gap-2">
          {newsItem.playerName && (
            <span className="px-2 py-1 bg-[rgba(255,255,255,0.1)] rounded text-white text-xs font-normal">
              {newsItem.playerName}
            </span>
          )}
          {newsItem.teamName && (
            <span className="px-2 py-1 bg-[rgba(255,255,255,0.1)] rounded text-white text-xs font-normal">
              {newsItem.teamName}
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNewsClick?.(newsItem)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[rgba(255,255,255,0.15)] rounded-[5px] text-white text-xs font-normal hover:bg-[rgba(255,255,255,0.25)] transition-colors"
        >
          Read More
        </button>
        {newsItem.url && (
          <a
            href={newsItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#AFAFAF] text-xs hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Source
          </a>
        )}
      </div>
    </div>
  )
}
