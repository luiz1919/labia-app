import { Blocks, ChevronRight, MessageSquareQuote, Scale, TriangleAlert } from 'lucide-react'
import { CONFUSABLES } from '../data/confusables'
import { PHRASAL_VERBS } from '../data/phrasalVerbs'
import type { LanguagePair } from '../languages'
import type { OwnIdiom } from '../ownIdioms.ts'
import { screenHash } from '../screens'
import type { ScreenId } from '../screens'
import { findFalseFriends, findIdioms, phrasalVerbPartner } from '../search'

function count(value: number, one: string, many: string): string {
  return value === 1 ? `1 ${one}` : `${value} ${many}`
}

/** "Aprender" (Learn): the bundled content, one tile per section. */
export default function LearnScreen({ pair, ownIdioms }: { pair: LanguagePair; ownIdioms: readonly OwnIdiom[] }) {
  const idioms = findIdioms('', pair, undefined, ownIdioms)
  const ownCount = idioms.filter(match => match.own).length
  const sections: { id: ScreenId; icon: typeof Blocks; title: string; text: string; detail: string }[] = [
    { id: 'expresiones', icon: MessageSquareQuote, title: 'Expresiones', text: 'El equivalente real, no la traducción literal. Y las tuyas.', detail: count(idioms.length, 'expresión', 'expresiones') + (ownCount ? ` (${count(ownCount, 'tuya', 'tuyas')})` : '') },
    { id: 'falsos-amigos', icon: TriangleAlert, title: 'Falsos amigos', text: 'Palabras que se parecen pero no significan lo mismo.', detail: count(findFalseFriends('', pair).length, 'palabra', 'palabras') },
    { id: 'diferencias', icon: Scale, title: 'Diferencias', text: 'Make o do, ser o estar: la regla y un mini test.', detail: count(CONFUSABLES.filter(entry => entry.lang === pair.source || entry.lang === pair.target).length, 'grupo', 'grupos') },
    { id: 'phrasal-verbs', icon: Blocks, title: 'Phrasal verbs', text: 'Búscalos en inglés o por su significado.', detail: phrasalVerbPartner(pair) ? count(PHRASAL_VERBS.length, 'phrasal verb', 'phrasal verbs') : 'Solo con inglés' },
  ]

  return (
    <section className="screen" aria-labelledby="learn-title">
      <h1 id="learn-title">Aprender</h1>
      <ul className="tiles">
        {sections.map(({ id, icon: Icon, title, text, detail }) => (
          <li key={id}>
            <a className="tile" href={screenHash(id)}>
              <span className="tile-icon"><Icon size={22} aria-hidden="true" /></span>
              <span className="tile-text"><strong>{title}</strong><span>{text}</span><small>{detail}</small></span>
              <ChevronRight size={20} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
