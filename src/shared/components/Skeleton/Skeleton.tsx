import type { CSSProperties } from 'react'
import styles from './Skeleton.module.scss'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={[styles.bone, className ?? ''].filter(Boolean).join(' ')} style={style} />
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.media} />
      <div className={styles.body}>
        <Skeleton style={{ height: '1rem', width: '72%' }} />
        <Skeleton style={{ height: '0.8rem', width: '48%' }} />
        <Skeleton style={{ height: '0.9rem', width: '36%' }} />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
