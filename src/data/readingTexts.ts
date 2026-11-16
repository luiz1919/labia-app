// English texts to read aloud in "Leer en voz alta". Short (about 40 to 60 words, so one breath of
// phone use), without digits (the recognizer writes numbers as digits, which cannot be compared
// with the words), and each one leans on sounds that Spanish speakers find hard.

export type ReadingLevel = 'easy' | 'medium' | 'hard'

export const READING_LEVELS: Readonly<Record<ReadingLevel, string>> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' }

export interface ReadingText {
  id: string
  title: string
  level: ReadingLevel
  /** The sounds it practices, in Spanish. */
  focus: string
  text: string
}

export const READING_TEXTS: readonly ReadingText[] = [
  {
    id: 'morning',
    title: 'Una mañana normal',
    level: 'easy',
    focus: 'Sonidos sh, ch y th',
    text: 'Every morning I wake up at seven. I take a shower, brush my teeth and make a cup of tea. Then I eat bread with butter and read the news. At eight I catch the bus to work.',
  },
  {
    id: 'cafe',
    title: 'En la cafetería',
    level: 'easy',
    focus: 'Frases para pedir',
    text: 'Hello, I would like a coffee with milk, please. Is there any cake today? I think I will have a piece of cheesecake. How much is it? Thank you very much. Have a nice day.',
  },
  {
    id: 'family',
    title: 'Mi familia',
    level: 'easy',
    focus: 'Vocales cortas y th',
    text: 'I have a small family. My mother is a teacher and my father is a doctor. My brother likes to play football with his friends. On Sundays we all have lunch together at my grandmother\'s house.',
  },
  {
    id: 'weather',
    title: 'El tiempo',
    level: 'easy',
    focus: 'Sonidos w, th y sh',
    text: 'Today the weather is very nice. The sun is shining and there are few clouds in the sky. Yesterday it was cold and it rained all day. Tomorrow will be warm, so we are going to the beach.',
  },
  {
    id: 'ship-sheep',
    title: 'El barco y la oveja',
    level: 'medium',
    focus: 'Vocal corta y larga (ship / sheep)',
    text: 'The sheep sat on the ship and watched the green hills slip by. A big fish jumped out of the deep water and landed with a splash. The captain said it was a good sign, and everyone began to cheer.',
  },
  {
    id: 'thursday',
    title: 'Jueves de sopa',
    level: 'medium',
    focus: 'Sonido th',
    text: 'I think Thursday is the best day of the week. My three brothers and their thirty friends are coming through the north gate. Together we will enjoy a thick, warm soup, whatever the weather.',
  },
  {
    id: 'village',
    title: 'El pueblo en noviembre',
    level: 'medium',
    focus: 'Sonidos v y b',
    text: 'Very few people visit the village in November, but the view from the bridge is lovely. We bought a bottle of vinegar and a basket of berries, then walked back by the river before it became too dark.',
  },
  {
    id: 'yesterday',
    title: 'Lo que hice ayer',
    level: 'medium',
    focus: 'Final -ed del pasado',
    text: 'Yesterday I walked to the market, talked to a neighbor and helped her carry two heavy bags. Then I cooked dinner, washed the dishes and watched a film until I finally decided to go to bed.',
  },
  {
    id: 'train',
    title: 'El tren a Edimburgo',
    level: 'medium',
    focus: 'Palabras de varias sílabas',
    text: 'The train to Edinburgh leaves from platform nine at half past ten. Please remember to bring your passport and a bottle of water. If you are late, you might not find a free seat, because the weekend trains are always crowded.',
  },
  {
    id: 'business',
    title: 'Un asunto delicado',
    level: 'hard',
    focus: 'Entonación y palabras cortas',
    text: 'I never said she stole my money. I only said that somebody had borrowed it without asking, and that is an entirely different thing. Honestly, I would rather forget the whole business and enjoy a quiet evening at home.',
  },
  {
    id: 'ough',
    title: 'Las trampas de «ough»',
    level: 'hard',
    focus: 'Misma escritura, sonidos distintos',
    text: 'Although the weather was rough, a thoughtful colleague walked through the borough and bought some bread and cough medicine. He thought about it thoroughly and decided he had enough courage to knock on the door.',
  },
  {
    id: 'colonel',
    title: 'El coronel',
    level: 'hard',
    focus: 'Palabras que no se leen como se escriben',
    text: 'On Wednesday the colonel gave a short speech about a comfortable chair, a vegetable garden and some very expensive jewelry. Nobody understood why, but everybody clapped, because the sandwiches afterwards were delicious.',
  },
]
