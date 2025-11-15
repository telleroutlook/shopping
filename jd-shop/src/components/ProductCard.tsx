import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'
import type { Product } from '@/lib/supabase'

interface ProductCardProps {
  product: Product
  tag?: string
  className?: string
  showBrand?: boolean
  showCount?: boolean
}

export default function ProductCard({
  product,
  tag,
  className,
  showBrand = true,
  showCount = true
}: ProductCardProps) {
  const hasDiscount =
    product.original_price !== undefined &&
    product.original_price !== null &&
    product.original_price > product.price

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group bg-white border border-background-divider rounded-lg overflow-hidden shadow-sm hover:shadow-card-hover transition-shadow duration-base ${className}`}
      aria-label={product.name}
    >
      <div className="relative aspect-square bg-background-surface overflow-hidden">
        <img
          src={product.main_image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-base"
        />
        {tag && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-brand/90 text-white">
            {tag}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        {showBrand && (
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            {product.brand || '品牌'}
          </p>
        )}
        <h3 className="text-base font-medium text-text-primary line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        <RatingStars
          rating={product.rating}
          reviewCount={showCount ? product.review_count : undefined}
          size="sm"
          hideCount={!showCount}
        />
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-error">¥{product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm line-through text-text-tertiary">
              ¥{product.original_price!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
