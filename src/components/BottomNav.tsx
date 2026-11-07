import { Blocks, MessageSquareQuote, Scale, Search, TriangleAlert } from 'lucide-react'
import { SCREENS, screenHash } from '../screens'
import type { ScreenId } from '../screens'

const ICONS = {
  buscar: Search,
  expresiones: MessageSquareQuote,
  'falsos-amigos': TriangleAlert,
  diferencias: Scale,
  'phrasal-verbs': Blocks,
} as const satisfies Record<ScreenId, unknown>

/** Tab bar at the bottom of the screen, within thumb reach. */
export default function BottomNav({ current }: { current: ScreenId }) {
  return (
    <nav className="bottom-nav" aria-label="Secciones">
      <ul>
        {SCREENS.map(screen => {
          const Icon = ICONS[screen.id]
          return (
            <li key={screen.id}>
              <a href={screenHash(screen.id)} aria-current={screen.id === current ? 'page' : undefined}>
                <Icon size={22} aria-hidden="true" />
                <span>{screen.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
