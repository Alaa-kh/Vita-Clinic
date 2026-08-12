import logoUrl from '@/assets/barq-logo.png'

interface BrandMarkProps {
  className?: string
  size?: number
}

export function BrandMark({ className, size = 44 }: BrandMarkProps) {
  return (
    <img
      className={className}
      src={logoUrl}
      alt="BARQ"
      width={size}
      height={size}
      decoding="async"
      draggable={false}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: '0.75rem',
      }}
    />
  )
}
