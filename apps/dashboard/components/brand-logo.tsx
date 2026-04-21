import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  /** Высота логотипа в px (ширина подстраивается под пропорции `logo-w.svg` 169×38). */
  height?: number
  /** Для LCP: не откладывать загрузку. */
  priority?: boolean
}

/** Wordmark из `public/logo-w.svg` (через `<img>`, без next/image — стабильнее для SVG). */
export function BrandLogo({ className, height = 32, priority }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG wordmark, без оптимизатора
    <img
      src="/logo-w.svg"
      alt="Lemnity"
      width={169}
      height={38}
      style={{ height, width: 'auto' }}
      className={cn('shrink-0 object-contain object-left invert dark:invert-0', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
