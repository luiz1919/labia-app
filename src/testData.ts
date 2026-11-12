// "Datos de prueba" in "Acerca de", only in "Pruebas" (the dev Firebase project): creates pantry
// words and favorites (src/testDataPlan.ts), and deletes the user's pantry, favorites and own
// expressions there. The language pair and the AI settings are left as they are.
import { assertDevEnvironment, commitInBatches } from 'firebase-app-kit'
import type { AppEnvironment, BatchWrite, WriteProgress } from 'firebase-app-kit'
import type { TestDataActions } from 'firebase-app-kit/ui'
import { collection, doc, getDocs, serverTimestamp } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { pantryKey } from './pantry.ts'
import { planTestData, seededRandom, TEST_DATA_SIZES, testDataSummary } from './testDataPlan.ts'
import type { TestDataSizeId } from './testDataPlan.ts'

export function testDataActions(db: Firestore, uid: string, environment: AppEnvironment): TestDataActions {
  const sizes = (Object.keys(TEST_DATA_SIZES) as TestDataSizeId[]).map(id => ({ id, label: TEST_DATA_SIZES[id].label }))
  const pantryCollection = () => collection(db, 'users', uid, 'pantry')
  const favoritesCollection = () => collection(db, 'users', uid, 'favorites')
  const idiomsCollection = () => collection(db, 'users', uid, 'idioms')

  async function generate(sizeId: string, onProgress: (progress: WriteProgress) => void): Promise<string> {
    assertDevEnvironment(environment)
    if (!(sizeId in TEST_DATA_SIZES)) throw new Error('Cantidad desconocida.')
    const [pantry, favorites] = await Promise.all([getDocs(pantryCollection()), getDocs(favoritesCollection())])
    const existing = {
      favorites: new Set(favorites.docs.map(item => item.id)),
      pantry: new Set(pantry.docs.map(item => pantryKey(String(item.get('text') ?? ''), String(item.get('lang') ?? '')))),
    }
    const plan = planTestData(sizeId as TestDataSizeId, seededRandom(Date.now()), existing)
    if (!plan.favorites.length && !plan.pantry.length) return 'Ya tienes todas las palabras de prueba: bórralas para empezar de nuevo.'
    const writes: BatchWrite[] = [
      ...plan.favorites.map((favorite): BatchWrite => batch => batch.set(doc(favoritesCollection(), favorite.id), {
        term: favorite.term, source: favorite.source, target: favorite.target, translations: favorite.translations, engine: favorite.engine, createdAt: serverTimestamp(),
      })),
      ...plan.pantry.map((item): BatchWrite => batch => batch.set(doc(pantryCollection()), {
        text: item.text, lang: item.lang, createdAt: serverTimestamp(), reviewed: item.reviewed,
      })),
    ]
    await commitInBatches(db, writes, onProgress)
    return testDataSummary(plan)
  }

  async function clear(onProgress: (progress: WriteProgress) => void): Promise<string> {
    assertDevEnvironment(environment)
    const [pantry, favorites, idioms] = await Promise.all([getDocs(pantryCollection()), getDocs(favoritesCollection()), getDocs(idiomsCollection())])
    const writes: BatchWrite[] = [...pantry.docs, ...favorites.docs, ...idioms.docs].map((item): BatchWrite => batch => batch.delete(item.ref))
    await commitInBatches(db, writes, onProgress)
    const n = (value: number) => value.toLocaleString('es')
    return `Borradas ${n(pantry.size)} palabras de la Despensa, ${n(favorites.size)} favoritos y ${n(idioms.size)} expresiones tuyas de Pruebas. Tus idiomas y tus claves de IA se mantienen.`
  }

  return { sizes, generate, clear }
}
