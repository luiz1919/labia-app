import { AudioLines, BookOpen, Search, Sparkles } from 'lucide-react'
import { screenHash, TABS } from '../screens'
import type { TabId } from '../screens'

const ICONS = {
  buscar: Search,
  aprender: BookOpen,
  pronunciar: AudioLines,
  asistente: Sparkles,
} as const satisfies Record<TabId, unknown>

/** Tab bar at the bottom of the screen, within thumb reach. */
export default function BottomNav({ current }: { current: TabId | null }) {
  return (
    <nav className="bottom-nav" aria-label="Secciones">
      <ul>
        {TABS.map(tab => {
          const Icon = ICONS[tab.id]
          return (
            <li key={tab.id}>
              <a href={screenHash(tab.id)} aria-current={tab.id === current ? 'page' : undefined}>
                <Icon size={22} aria-hidden="true" />
                <span>{tab.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
