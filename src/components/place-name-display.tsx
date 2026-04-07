'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccentDisplay } from '@/components/accent-display'
import type { Pitch } from '@/lib/mora'
import { HeartIcon, FlagIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlaceNameDisplayProps {
  spelling: string
  moras: string[]
  pitches: Pitch[]
  likeCount: number
  isLiked?: boolean
  onLike?: () => void
  onReport?: () => void
}

export function PlaceNameDisplay({
  spelling,
  moras,
  pitches,
  likeCount,
  isLiked = false,
  onLike,
  onReport,
}: PlaceNameDisplayProps) {
  const [liked, setLiked] = useState(isLiked)
  const [count, setCount] = useState(likeCount)

  const handleLike = () => {
    if (liked) {
      setCount(prev => prev - 1)
    } else {
      setCount(prev => prev + 1)
    }
    setLiked(!liked)
    onLike?.()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-4">
        {/* 地名の綴り */}
        <h3 className="text-2xl font-bold text-foreground tracking-wide">
          {spelling}
        </h3>

        {/* モーラとアクセント表示 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">読みとアクセント</span>
          <AccentDisplay moras={moras} pitches={pitches} size="md" />
        </div>

        {/* アイコン行 */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          {/* いいねボタン */}
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors',
              liked
                ? 'text-pink-500'
                : 'text-muted-foreground hover:text-pink-500'
            )}
          >
            <HeartIcon
              className={cn(
                'size-5 transition-all',
                liked && 'fill-current scale-110'
              )}
            />
            <span className="font-medium">{count}</span>
          </button>

          {/* 報告ボタン */}
          <button
            onClick={onReport}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <FlagIcon className="size-4" />
            <span>報告</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
