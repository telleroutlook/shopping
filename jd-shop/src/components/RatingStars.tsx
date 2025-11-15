import { Star } from 'lucide-react'
import clsx from 'clsx'

interface RatingStarsProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
  className?: string
  hideCount?: boolean
}

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4'
} as const

export default function RatingStars({
  rating,
  reviewCount,
  size = 'md',
  className,
  hideCount = false
}: RatingStarsProps) {
  const normalizedRating = Math.min(5, Math.max(0, Math.round(rating)))
  const starSize = sizeMap[size] ?? sizeMap.md

  return (
    <div className={clsx('flex items-center space-x-2 text-sm', className)}>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={clsx(
              starSize,
              value <= normalizedRating ? 'fill-warning text-warning' : 'text-gray-300'
            )}
          />
        ))}
      </div>
      {!hideCount && reviewCount !== undefined && (
        <span className="text-xs text-text-tertiary">({reviewCount})</span>
      )}
    </div>
  )
}
