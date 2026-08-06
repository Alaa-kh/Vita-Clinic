import { CareCard } from '@/features/care/components/CareCard'
import type { Care } from '@/features/care/types/care'
import { Reveal } from '@/shared/components/Reveal/Reveal'
import styles from '@/features/care/components/CareGrid.module.scss'

interface CareGridProps {
  items: Care[]
}

export function CareGrid({ items }: CareGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((care, index) => (
        <Reveal
          key={care.id}
          delayMs={Math.min(index, 8) * 90}
          variant={index % 2 === 0 ? 'scale' : 'up'}
        >
          <CareCard care={care} />
        </Reveal>
      ))}
    </div>
  )
}
