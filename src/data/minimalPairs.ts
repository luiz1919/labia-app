// Minimal pairs: two words that differ in a single sound. Listening to them and saying them is
// the quickest way to train the sounds your own language does not have. English pairs are for
// Spanish speakers and Spanish pairs for English speakers.
import type { MinimalPair } from './types'

export const MINIMAL_PAIRS: readonly MinimalPair[] = [
  // English (British IPA)
  { id: 'ship-sheep', lang: 'en', words: ['ship', 'sheep'], ipa: ['/ʃɪp/', '/ʃiːp/'], hint: 'La i corta y relajada de ship frente a la i larga y tensa de sheep.' },
  { id: 'live-leave', lang: 'en', words: ['live', 'leave'], ipa: ['/lɪv/', '/liːv/'], hint: 'I corta frente a i larga.' },
  { id: 'fit-feet', lang: 'en', words: ['fit', 'feet'], ipa: ['/fɪt/', '/fiːt/'], hint: 'I corta frente a i larga.' },
  { id: 'full-fool', lang: 'en', words: ['full', 'fool'], ipa: ['/fʊl/', '/fuːl/'], hint: 'La u corta y relajada de full frente a la u larga de fool.' },
  { id: 'pull-pool', lang: 'en', words: ['pull', 'pool'], ipa: ['/pʊl/', '/puːl/'], hint: 'U corta frente a u larga.' },
  { id: 'cat-cut', lang: 'en', words: ['cat', 'cut'], ipa: ['/kæt/', '/kʌt/'], hint: 'La a abierta, casi una e, de cat frente a la a breve y central de cut.' },
  { id: 'hat-hut', lang: 'en', words: ['hat', 'hut'], ipa: ['/hæt/', '/hʌt/'], hint: 'A abierta frente a a central.' },
  { id: 'bad-bed', lang: 'en', words: ['bad', 'bed'], ipa: ['/bæd/', '/bed/'], hint: 'La a muy abierta de bad frente a la e de bed.' },
  { id: 'walk-work', lang: 'en', words: ['walk', 'work'], ipa: ['/wɔːk/', '/wɜːk/'], hint: 'La o larga de walk frente a la vocal central de work, que no es ni o ni e.' },
  { id: 'boat-bought', lang: 'en', words: ['boat', 'bought'], ipa: ['/bəʊt/', '/bɔːt/'], hint: 'El diptongo de boat frente a la o larga de bought.' },
  { id: 'very-berry', lang: 'en', words: ['very', 'berry'], ipa: ['/ˈveri/', '/ˈberi/'], hint: 'La v inglesa se hace con el labio inferior y los dientes; la b, con los dos labios.' },
  { id: 'vote-boat', lang: 'en', words: ['vote', 'boat'], ipa: ['/vəʊt/', '/bəʊt/'], hint: 'V con los dientes frente a b con los labios.' },
  { id: 'think-sink', lang: 'en', words: ['think', 'sink'], ipa: ['/θɪŋk/', '/sɪŋk/'], hint: 'La th de think suena como la z de España; la s, como la s.' },
  { id: 'three-free', lang: 'en', words: ['three', 'free'], ipa: ['/θriː/', '/friː/'], hint: 'Th (lengua entre los dientes) frente a f.' },
  { id: 'then-den', lang: 'en', words: ['then', 'den'], ipa: ['/ðen/', '/den/'], hint: 'La th sonora de then es como la d suave de «cada»; la d de den es fuerte.' },
  { id: 'yet-jet', lang: 'en', words: ['yet', 'jet'], ipa: ['/jet/', '/dʒet/'], hint: 'La y de yet es como la i de «hielo»; la j de jet es como una ch sonora.' },
  { id: 'sheep-cheap', lang: 'en', words: ['sheep', 'cheap'], ipa: ['/ʃiːp/', '/tʃiːp/'], hint: 'Sh es un sonido continuo, como al pedir silencio; ch empieza con un golpe.' },
  { id: 'hair-air', lang: 'en', words: ['hair', 'air'], ipa: ['/heə/', '/eə/'], hint: 'La h inglesa se aspira, como una j muy suave; air empieza directamente por la vocal.' },
  { id: 'sing-sin', lang: 'en', words: ['sing', 'sin'], ipa: ['/sɪŋ/', '/sɪn/'], hint: 'La ng final se hace con el fondo de la boca, como la n de «tengo»; sin acaba en una n normal.' },
  { id: 'light-right', lang: 'en', words: ['light', 'right'], ipa: ['/laɪt/', '/raɪt/'], hint: 'La r inglesa no vibra: la lengua no llega a tocar el paladar.' },
  // Spanish
  { id: 'pero-perro', lang: 'es', words: ['pero', 'perro'], ipa: ['/ˈpeɾo/', '/ˈpero/'], hint: 'Entre vocales, r es un solo toque de la lengua; rr vibra varias veces.' },
  { id: 'caro-carro', lang: 'es', words: ['caro', 'carro'], ipa: ['/ˈkaɾo/', '/ˈkaro/'], hint: 'R simple frente a rr múltiple.' },
  { id: 'coro-corro', lang: 'es', words: ['coro', 'corro'], ipa: ['/ˈkoɾo/', '/ˈkoro/'], hint: 'R simple frente a rr múltiple.' },
  { id: 'pelo-pero', lang: 'es', words: ['pelo', 'pero'], ipa: ['/ˈpelo/', '/ˈpeɾo/'], hint: 'L con la lengua apoyada frente a r con un toque rápido.' },
  { id: 'papa-papá', lang: 'es', words: ['papa', 'papá'], ipa: ['/ˈpapa/', '/paˈpa/'], hint: 'Solo cambia la sílaba fuerte: PA-pa (patata, en Latinoamérica) frente a pa-PÁ.' },
  { id: 'hablo-habló', lang: 'es', words: ['hablo', 'habló'], ipa: ['/ˈablo/', '/aˈblo/'], hint: 'HA-blo (presente, yo) frente a ha-BLÓ (pasado, él o ella).' },
  { id: 'cana-caña', lang: 'es', words: ['cana', 'caña'], ipa: ['/ˈkana/', '/ˈkaɲa/'], hint: 'La ñ se hace con el centro de la lengua contra el paladar, como la ny de «canyon».' },
  { id: 'vaso-bajo', lang: 'es', words: ['vaso', 'bajo'], ipa: ['/ˈbaso/', '/ˈbaxo/'], hint: 'S frente a j, que suena en la garganta. (La v y la b suenan igual en español.)' },
  { id: 'casa-caza', lang: 'es', words: ['casa', 'caza'], ipa: ['/ˈkasa/', '/ˈkaθa/'], regions: ['es-ES'], hint: 'En España la z suena como la th de «think»; en casi toda Latinoamérica las dos suenan igual.' },
]
