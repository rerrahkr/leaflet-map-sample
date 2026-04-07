'use client'

import { cn } from '@/lib/utils'
import type { Pitch } from '@/lib/mora'

interface AccentDisplayProps {
  moras: string[]
  pitches: Pitch[]
  size?: 'sm' | 'md' | 'lg'
}

export function AccentDisplay({ moras, pitches, size = 'md' }: AccentDisplayProps) {
  if (moras.length === 0) {
    return null
  }

  const sizeClasses = {
    sm: { container: 'gap-0.5', mora: 'min-w-6 h-10 text-sm', label: 'text-[8px]' },
    md: { container: 'gap-1', mora: 'min-w-8 h-12 text-base', label: 'text-[9px]' },
    lg: { container: 'gap-1.5', mora: 'min-w-10 h-14 text-lg', label: 'text-[10px]' },
  }

  const styles = sizeClasses[size]

  return (
    <div className={cn('flex flex-wrap', styles.container)}>
      {moras.map((mora, index) => {
        const pitch = pitches[index] || 'L'
        const isHigh = pitch === 'H'
        const nextPitch = index < moras.length - 1 ? pitches[index + 1] : null

        return (
          <div
            key={index}
            className={cn(
              'relative flex flex-col items-center justify-center px-1 rounded transition-colors',
              styles.mora,
              isHigh
                ? 'bg-pitch-high-bg text-pitch-high'
                : 'bg-pitch-low-bg text-pitch-low'
            )}
          >
            {/* 高低ラベル */}
            <span className={cn(
              'font-bold',
              styles.label,
              isHigh ? 'mb-auto mt-0.5' : 'mt-auto mb-0.5'
            )}>
              {isHigh ? '高' : '低'}
            </span>
            
            {/* モーラテキスト */}
            <span className="font-medium absolute top-1/2 -translate-y-1/2">
              {mora}
            </span>

            {/* 上部の接続線（高音時） */}
            {isHigh && (
              <div className="absolute top-1 left-0 right-0 h-0.5 bg-pitch-high" />
            )}
            
            {/* 下部の接続線（低音時） */}
            {!isHigh && (
              <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-pitch-low" />
            )}

            {/* 次のモーラへの遷移線 */}
            {index < moras.length - 1 && isHigh !== (nextPitch === 'H') && (
              <div 
                className={cn(
                  'absolute right-0 translate-x-1/2 w-0.5 z-10',
                  isHigh && nextPitch === 'L' 
                    ? 'top-1 bottom-[calc(100%-1rem-2px)] bg-gradient-to-b from-pitch-high to-pitch-low' 
                    : 'bottom-1 top-[calc(100%-1rem-2px)] bg-gradient-to-t from-pitch-low to-pitch-high'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
