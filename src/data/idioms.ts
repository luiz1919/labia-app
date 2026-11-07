// Idioms: the real equivalent in each language, not the literal translation.
import type { Idiom } from './types'

export const IDIOMS: readonly Idiom[] = [
  {
    id: 'head-in-the-clouds',
    meaning: 'Estar distraído, sin prestar atención a lo que pasa alrededor.',
    expressions: [
      { lang: 'es', text: 'estar en las nubes', literal: { en: 'to be in the clouds' }, register: 'informal' },
      { lang: 'en', text: 'to have your head in the clouds', literal: { es: 'tener la cabeza en las nubes' }, register: 'informal' },
      { lang: 'en', text: 'to be miles away', literal: { es: 'estar a millas de distancia' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'Perdona, ¿qué decías? Estaba en las nubes.', en: 'Sorry, what were you saying? I was miles away.' },
  },
  {
    id: 'arm-and-a-leg',
    meaning: 'Ser muy caro.',
    expressions: [
      { lang: 'es', text: 'costar un ojo de la cara', literal: { en: 'to cost an eye of the face' }, register: 'informal', keywords: ['cuesta un ojo de la cara'] },
      { lang: 'es', text: 'costar un riñón', literal: { en: 'to cost a kidney' }, register: 'informal', regions: ['es-ES'] },
      { lang: 'en', text: 'to cost an arm and a leg', literal: { es: 'costar un brazo y una pierna' }, register: 'informal' },
    ],
    example: { es: 'Ese coche le ha costado un ojo de la cara.', en: 'That car cost him an arm and a leg.' },
  },
  {
    id: 'pull-someones-leg',
    meaning: 'Engañar a alguien en broma, hacerle creer algo que no es verdad.',
    expressions: [
      { lang: 'es', text: 'tomarle el pelo a alguien', literal: { en: "to take someone's hair" }, register: 'informal', keywords: ['tomar el pelo', 'me estás tomando el pelo'] },
      { lang: 'en', text: "to pull someone's leg", literal: { es: 'tirarle de la pierna a alguien' }, register: 'informal', keywords: ['pull my leg', "you're pulling my leg"] },
    ],
    example: { es: '¿En serio? ¿No me estarás tomando el pelo?', en: "Seriously? You're not pulling my leg, are you?" },
  },
  {
    id: 'raining-cats-and-dogs',
    meaning: 'Llover muchísimo.',
    expressions: [
      { lang: 'es', text: 'llover a cántaros', literal: { en: 'to rain by the jugful' }, register: 'informal', keywords: ['está lloviendo a cántaros'] },
      { lang: 'en', text: "it's pouring down", literal: { es: 'está vertiéndose' }, register: 'informal', keywords: ["it's pouring"] },
      { lang: 'en', text: 'to rain cats and dogs', literal: { es: 'llover gatos y perros' }, register: 'informal' },
      { lang: 'en', text: "it's bucketing down", literal: { es: 'está cayendo a cubos' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'No salgas ahora, está lloviendo a cántaros.', en: "Don't go out now, it's pouring down." },
  },
  {
    id: 'piece-of-cake',
    meaning: 'Ser muy fácil.',
    expressions: [
      { lang: 'es', text: 'ser pan comido', literal: { en: 'to be eaten bread' }, register: 'informal', keywords: ['es pan comido'] },
      { lang: 'en', text: 'to be a piece of cake', literal: { es: 'ser un trozo de tarta' }, register: 'informal', keywords: ["it's a piece of cake"] },
      { lang: 'en', text: 'to be a walk in the park', literal: { es: 'ser un paseo por el parque' }, register: 'informal' },
    ],
    example: { es: 'El examen fue pan comido.', en: 'The exam was a piece of cake.' },
  },
  {
    id: 'not-mince-words',
    meaning: 'Decir lo que uno piensa con franqueza, aunque moleste.',
    expressions: [
      { lang: 'es', text: 'no tener pelos en la lengua', literal: { en: 'to have no hairs on your tongue' } },
      { lang: 'en', text: 'not to mince your words', literal: { es: 'no picar tus palabras' }, keywords: ["doesn't mince her words", "doesn't mince his words"] },
    ],
    example: { es: 'Mi abuela no tiene pelos en la lengua.', en: "My grandmother doesn't mince her words." },
  },
  {
    id: 'put-your-foot-in-it',
    meaning: 'Equivocarse, sobre todo diciendo algo inoportuno.',
    expressions: [
      { lang: 'es', text: 'meter la pata', literal: { en: 'to put the paw in' }, register: 'informal', keywords: ['metí la pata'] },
      { lang: 'en', text: 'to put your foot in it', literal: { es: 'meter el pie en ello' }, register: 'informal', regions: ['en-GB'] },
      { lang: 'en', text: 'to put your foot in your mouth', literal: { es: 'meterse el pie en la boca' }, register: 'informal', regions: ['en-US'] },
    ],
    example: { es: 'Metí la pata y le conté lo de la fiesta sorpresa.', en: 'I put my foot in it and told her about the surprise party.' },
  },
  {
    id: 'mad-as-a-hatter',
    meaning: 'Estar loco o comportarse de forma muy rara.',
    expressions: [
      { lang: 'es', text: 'estar como una cabra', literal: { en: 'to be like a goat' }, register: 'informal', keywords: ['está como una cabra'] },
      { lang: 'en', text: 'to be as mad as a hatter', literal: { es: 'estar tan loco como un sombrerero' }, register: 'informal' },
      { lang: 'en', text: 'to be off your rocker', literal: { es: 'haberse caído de la mecedora' }, register: 'informal' },
    ],
    example: { es: 'Tu vecino está como una cabra.', en: 'Your neighbour is as mad as a hatter.' },
  },
  {
    id: 'hit-the-nail-on-the-head',
    meaning: 'Acertar plenamente.',
    expressions: [
      { lang: 'es', text: 'dar en el clavo', literal: { en: 'to hit on the nail' }, keywords: ['has dado en el clavo'] },
      { lang: 'en', text: 'to hit the nail on the head', literal: { es: 'golpear el clavo en la cabeza' } },
    ],
    example: { es: 'Has dado en el clavo: el problema es el precio.', en: "You've hit the nail on the head: the problem is the price." },
  },
  {
    id: 'pull-the-other-one',
    meaning: 'No me lo creo; no intentes engañarme.',
    expressions: [
      { lang: 'es', text: 'a otro perro con ese hueso', literal: { en: 'to another dog with that bone' }, register: 'informal' },
      { lang: 'en', text: 'pull the other one', literal: { es: 'tira de la otra (pierna)' }, register: 'informal', regions: ['en-GB'] },
      { lang: 'en', text: 'yeah, right', literal: { es: 'sí, claro' }, register: 'informal' },
    ],
    example: { es: '¿Que has corrido una maratón sin entrenar? A otro perro con ese hueso.', en: 'You ran a marathon without training? Pull the other one.' },
  },
  {
    id: 'two-birds-one-stone',
    meaning: 'Conseguir dos cosas con una sola acción.',
    expressions: [
      { lang: 'es', text: 'matar dos pájaros de un tiro', literal: { en: 'to kill two birds with one shot' } },
      { lang: 'en', text: 'to kill two birds with one stone', literal: { es: 'matar dos pájaros con una piedra' } },
    ],
    example: { es: 'Si vamos al centro, matamos dos pájaros de un tiro: comemos y compramos el regalo.', en: "If we go into town, we'll kill two birds with one stone: we can eat and buy the present." },
  },
  {
    id: 'better-late-than-never',
    meaning: 'Es mejor hacer algo tarde que no hacerlo.',
    expressions: [
      { lang: 'es', text: 'más vale tarde que nunca', literal: { en: 'late is worth more than never' }, keywords: ['mejor tarde que nunca'] },
      { lang: 'en', text: 'better late than never', literal: { es: 'mejor tarde que nunca' } },
    ],
  },
  {
    id: 'silver-lining',
    meaning: 'De una situación mala también puede salir algo bueno.',
    expressions: [
      { lang: 'es', text: 'no hay mal que por bien no venga', literal: { en: "there's no bad that doesn't come for good" } },
      { lang: 'en', text: 'every cloud has a silver lining', literal: { es: 'cada nube tiene un forro de plata' } },
      { lang: 'en', text: 'a blessing in disguise', literal: { es: 'una bendición disfrazada' } },
    ],
    example: { es: 'Perdí el tren, pero conocí a mi mujer en la estación. No hay mal que por bien no venga.', en: 'I missed the train, but I met my wife at the station. Every cloud has a silver lining.' },
  },
  {
    id: 'fed-up',
    meaning: 'Estar harto de algo o de alguien.',
    expressions: [
      { lang: 'es', text: 'estar hasta las narices', literal: { en: 'to be up to the nostrils' }, register: 'informal', keywords: ['estoy hasta las narices'] },
      { lang: 'es', text: 'estar hasta el moño', literal: { en: 'to be up to the bun (hair)' }, register: 'informal' },
      { lang: 'en', text: 'to be sick and tired of something', literal: { es: 'estar enfermo y cansado de algo' }, register: 'informal', keywords: ['sick and tired'] },
      { lang: 'en', text: 'to be fed up to the back teeth', literal: { es: 'estar alimentado hasta las muelas' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'Estoy hasta las narices del ruido de las obras.', en: "I'm sick and tired of the noise from the building works." },
  },
  {
    id: 'pull-your-socks-up',
    meaning: 'Esforzarse más, espabilar.',
    expressions: [
      { lang: 'es', text: 'ponerse las pilas', literal: { en: 'to put your batteries in' }, register: 'informal', keywords: ['ponte las pilas'] },
      { lang: 'en', text: 'to get your act together', literal: { es: 'juntar tu número' }, register: 'informal' },
      { lang: 'en', text: 'to pull your socks up', literal: { es: 'subirse los calcetines' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'Si quieres aprobar, ponte las pilas.', en: 'If you want to pass, you need to pull your socks up.' },
  },
  {
    id: 'last-straw',
    meaning: 'Lo último que faltaba para que alguien pierda la paciencia.',
    expressions: [
      { lang: 'es', text: 'ser la gota que colma el vaso', literal: { en: 'to be the drop that overfills the glass' }, keywords: ['la gota que colmó el vaso'] },
      { lang: 'en', text: 'to be the last straw', literal: { es: 'ser la última paja' }, keywords: ['the last straw'] },
      { lang: 'en', text: "the straw that broke the camel's back", literal: { es: 'la paja que rompió la espalda del camello' } },
    ],
    example: { es: 'Llegar tarde otra vez fue la gota que colmó el vaso.', en: 'Being late again was the last straw.' },
  },
  {
    id: 'go-off-on-a-tangent',
    meaning: 'Desviarse del tema principal al hablar.',
    expressions: [
      { lang: 'es', text: 'irse por las ramas', literal: { en: 'to go off along the branches' }, register: 'informal', keywords: ['no te vayas por las ramas'] },
      { lang: 'en', text: 'to go off on a tangent', literal: { es: 'irse por una tangente' }, register: 'informal' },
    ],
    example: { es: 'Siempre se va por las ramas y no termina la historia.', en: 'He always goes off on a tangent and never finishes the story.' },
  },
  {
    id: 'beat-around-the-bush',
    meaning: 'Evitar decir algo directamente.',
    expressions: [
      { lang: 'es', text: 'andarse con rodeos', literal: { en: 'to walk around with detours' }, keywords: ['sin rodeos', 'déjate de rodeos'] },
      { lang: 'en', text: 'to beat around the bush', literal: { es: 'dar golpes alrededor del arbusto' }, regions: ['en-US'] },
      { lang: 'en', text: 'to beat about the bush', literal: { es: 'dar golpes alrededor del arbusto' }, regions: ['en-GB'] },
    ],
    example: { es: 'Déjate de rodeos y dime qué ha pasado.', en: "Stop beating around the bush and tell me what's happened." },
  },
  {
    id: 'get-to-the-point',
    meaning: 'Hablar directamente de lo importante.',
    expressions: [
      { lang: 'es', text: 'ir al grano', literal: { en: 'to go to the grain' }, keywords: ['vamos al grano'] },
      { lang: 'en', text: 'to get to the point', literal: { es: 'llegar al punto' } },
      { lang: 'en', text: 'to cut to the chase', literal: { es: 'saltar a la persecución' }, register: 'informal' },
    ],
    example: { es: 'No tenemos mucho tiempo, así que vamos al grano.', en: "We don't have much time, so let's cut to the chase." },
  },
  {
    id: 'split-hairs',
    meaning: 'Complicar las cosas buscando problemas o detalles donde no los hay.',
    expressions: [
      { lang: 'es', text: 'buscarle tres pies al gato', literal: { en: 'to look for three feet on the cat' }, register: 'informal' },
      { lang: 'en', text: 'to split hairs', literal: { es: 'partir pelos' }, register: 'informal' },
    ],
    example: { es: 'Está bien así, no le busques tres pies al gato.', en: "It's fine as it is, don't split hairs." },
  },
  {
    id: 'middle-of-nowhere',
    meaning: 'Estar en un lugar muy lejano o apartado.',
    expressions: [
      { lang: 'es', text: 'estar en el quinto pino', literal: { en: 'to be at the fifth pine tree' }, register: 'informal', regions: ['es-ES'], keywords: ['en el quinto pino'] },
      { lang: 'es', text: 'donde el diablo perdió el poncho', literal: { en: 'where the devil lost his poncho' }, register: 'informal', regions: ['es-419'] },
      { lang: 'en', text: 'in the middle of nowhere', literal: { es: 'en medio de ninguna parte' }, register: 'informal' },
      { lang: 'en', text: 'the back of beyond', literal: { es: 'la parte de atrás del más allá' }, register: 'informal', regions: ['en-GB'] },
      { lang: 'en', text: 'out in the boondocks', literal: { es: 'allá en los boondocks (zona rural remota)' }, register: 'informal', regions: ['en-US'] },
    ],
    example: { es: 'Su casa está en el quinto pino.', en: 'Their house is in the middle of nowhere.' },
  },
  {
    id: 'thick-as-thieves',
    meaning: 'Ser amigos inseparables.',
    expressions: [
      { lang: 'es', text: 'ser uña y carne', literal: { en: 'to be nail and flesh' }, register: 'informal', keywords: ['son uña y carne'] },
      { lang: 'en', text: 'to be as thick as thieves', literal: { es: 'ser tan íntimos como ladrones' }, register: 'informal' },
      { lang: 'en', text: 'to be joined at the hip', literal: { es: 'estar unidos por la cadera' }, register: 'informal' },
    ],
    example: { es: 'Desde el colegio, Ana y Marta son uña y carne.', en: 'Ana and Marta have been as thick as thieves since school.' },
  },
  {
    id: 'push-the-boat-out',
    meaning: 'Gastar mucho dinero, sobre todo en una celebración.',
    expressions: [
      { lang: 'es', text: 'tirar la casa por la ventana', literal: { en: 'to throw the house out of the window' }, register: 'informal' },
      { lang: 'en', text: 'to go all out', literal: { es: 'ir con todo' }, register: 'informal' },
      { lang: 'en', text: 'to push the boat out', literal: { es: 'empujar el barco' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'Para su boda tiraron la casa por la ventana.', en: 'They really pushed the boat out for their wedding.' },
  },
  {
    id: 'talk-someones-ear-off',
    meaning: 'Hablar muchísimo.',
    expressions: [
      { lang: 'es', text: 'hablar por los codos', literal: { en: 'to talk through your elbows' }, register: 'informal', keywords: ['habla por los codos'] },
      { lang: 'en', text: 'to talk nineteen to the dozen', literal: { es: 'hablar diecinueve por docena' }, register: 'informal', regions: ['en-GB'] },
      { lang: 'en', text: "to talk someone's ear off", literal: { es: 'hablarle a alguien hasta arrancarle la oreja' }, register: 'informal', regions: ['en-US'] },
      { lang: 'en', text: 'to be a chatterbox', literal: { es: 'ser una caja de parloteo' }, register: 'informal' },
    ],
    example: { es: 'Mi sobrino habla por los codos.', en: 'My nephew is a real chatterbox.' },
  },
  {
    id: 'blind-as-a-bat',
    meaning: 'Ver muy mal.',
    expressions: [
      { lang: 'es', text: 'no ver tres en un burro', literal: { en: 'not to see three on a donkey' }, register: 'informal', regions: ['es-ES'] },
      { lang: 'en', text: 'to be as blind as a bat', literal: { es: 'estar tan ciego como un murciélago' }, register: 'informal' },
    ],
    example: { es: 'Sin gafas no veo tres en un burro.', en: "I'm as blind as a bat without my glasses." },
  },
  {
    id: 'sharp-as-a-tack',
    meaning: 'Ser muy listo y espabilado.',
    expressions: [
      { lang: 'es', text: 'ser más listo que el hambre', literal: { en: 'to be smarter than hunger' }, register: 'informal' },
      { lang: 'en', text: 'to be as sharp as a tack', literal: { es: 'estar tan afilado como una chincheta' }, register: 'informal', regions: ['en-US'] },
      { lang: 'en', text: 'to be as bright as a button', literal: { es: 'ser tan brillante como un botón' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'Esa niña es más lista que el hambre.', en: 'That girl is as bright as a button.' },
  },
  {
    id: 'in-your-element',
    meaning: 'Sentirse cómodo y seguro en una situación.',
    expressions: [
      { lang: 'es', text: 'estar como pez en el agua', literal: { en: 'to be like a fish in water' } },
      { lang: 'en', text: 'to be in your element', literal: { es: 'estar en tu elemento' } },
      { lang: 'en', text: 'to take to something like a duck to water', literal: { es: 'tomarle el gusto a algo como un pato al agua' }, regions: ['en-GB'] },
    ],
    example: { es: 'En la cocina está como pez en el agua.', en: "He's in his element in the kitchen." },
  },
  {
    id: 'fish-out-of-water',
    meaning: 'Sentirse incómodo o fuera de lugar. Esta se dice igual en los dos idiomas.',
    expressions: [
      { lang: 'es', text: 'sentirse como pez fuera del agua', literal: { en: 'to feel like a fish out of water' } },
      { lang: 'en', text: 'to feel like a fish out of water', literal: { es: 'sentirse como un pez fuera del agua' } },
    ],
    example: { es: 'En la fiesta me sentía como pez fuera del agua.', en: 'I felt like a fish out of water at the party.' },
  },
  {
    id: 'lend-a-hand',
    meaning: 'Ayudar a alguien.',
    expressions: [
      { lang: 'es', text: 'echar una mano', literal: { en: 'to throw a hand' }, register: 'informal', keywords: ['¿me echas una mano?'] },
      { lang: 'en', text: 'to give someone a hand', literal: { es: 'darle una mano a alguien' }, register: 'informal', keywords: ['give me a hand'] },
      { lang: 'en', text: 'to lend a hand', literal: { es: 'prestar una mano' } },
    ],
    example: { es: '¿Me echas una mano con la mudanza?', en: 'Can you give me a hand with the move?' },
  },
  {
    id: 'around-the-corner',
    meaning: 'Estar muy cerca, en el espacio o en el tiempo.',
    expressions: [
      { lang: 'es', text: 'a la vuelta de la esquina', literal: { en: 'at the turn of the corner' } },
      { lang: 'en', text: 'just around the corner', literal: { es: 'justo al doblar la esquina' } },
    ],
    example: { es: 'Las vacaciones están a la vuelta de la esquina.', en: 'The holidays are just around the corner.' },
  },
  {
    id: 'rock-and-a-hard-place',
    meaning: 'Tener que elegir entre dos opciones igual de malas.',
    expressions: [
      { lang: 'es', text: 'estar entre la espada y la pared', literal: { en: 'to be between the sword and the wall' } },
      { lang: 'en', text: 'to be between a rock and a hard place', literal: { es: 'estar entre una roca y un lugar duro' } },
      { lang: 'en', text: 'to be between the devil and the deep blue sea', literal: { es: 'estar entre el diablo y el profundo mar azul' } },
    ],
    example: { es: 'Si acepto, pierdo a mis amigos; si no, el trabajo. Estoy entre la espada y la pared.', en: "If I accept, I lose my friends; if I don't, the job. I'm between a rock and a hard place." },
  },
  {
    id: 'sleep-like-a-log',
    meaning: 'Dormir profundamente.',
    expressions: [
      { lang: 'es', text: 'dormir como un tronco', literal: { en: 'to sleep like a log' }, register: 'informal', keywords: ['dormí como un tronco'] },
      { lang: 'es', text: 'dormir como un lirón', literal: { en: 'to sleep like a dormouse' }, register: 'informal' },
      { lang: 'en', text: 'to sleep like a log', literal: { es: 'dormir como un tronco' }, register: 'informal', keywords: ['slept like a log'] },
      { lang: 'en', text: 'to sleep like a baby', literal: { es: 'dormir como un bebé' }, register: 'informal' },
    ],
    example: { es: 'Después de la excursión dormí como un tronco.', en: 'I slept like a log after the hike.' },
  },
  {
    id: 'out-of-sight-out-of-mind',
    meaning: 'Lo que no se ve, no preocupa ni se echa de menos.',
    expressions: [
      { lang: 'es', text: 'ojos que no ven, corazón que no siente', literal: { en: "eyes that don't see, heart that doesn't feel" } },
      { lang: 'en', text: 'out of sight, out of mind', literal: { es: 'fuera de la vista, fuera de la mente' } },
      { lang: 'en', text: "what the eye doesn't see, the heart doesn't grieve over", literal: { es: 'lo que el ojo no ve, el corazón no lo llora' }, regions: ['en-GB'] },
    ],
  },
  {
    id: 'silence-is-golden',
    meaning: 'A veces es mejor callar que hablar.',
    expressions: [
      { lang: 'es', text: 'en boca cerrada no entran moscas', literal: { en: "flies don't get into a closed mouth" } },
      { lang: 'en', text: 'silence is golden', literal: { es: 'el silencio es de oro' } },
      { lang: 'en', text: 'least said, soonest mended', literal: { es: 'lo menos dicho, lo antes arreglado' }, regions: ['en-GB'] },
    ],
  },
  {
    id: 'black-sheep',
    meaning: 'La persona que es distinta o tiene mala fama dentro de un grupo o una familia. Igual en los dos idiomas.',
    expressions: [
      { lang: 'es', text: 'ser la oveja negra', literal: { en: 'to be the black sheep' } },
      { lang: 'en', text: 'to be the black sheep (of the family)', literal: { es: 'ser la oveja negra (de la familia)' }, keywords: ['black sheep of the family'] },
    ],
    example: { es: 'Mi tío siempre ha sido la oveja negra de la familia.', en: 'My uncle has always been the black sheep of the family.' },
  },
  {
    id: 'wrong-side-of-the-bed',
    meaning: 'Empezar el día de mal humor o con mala suerte.',
    expressions: [
      { lang: 'es', text: 'levantarse con el pie izquierdo', literal: { en: 'to get up with the left foot' }, register: 'informal', keywords: ['me levanté con el pie izquierdo'] },
      { lang: 'en', text: 'to get out of bed on the wrong side', literal: { es: 'salir de la cama por el lado equivocado' }, register: 'informal', regions: ['en-GB'] },
      { lang: 'en', text: 'to get up on the wrong side of the bed', literal: { es: 'levantarse por el lado equivocado de la cama' }, register: 'informal', regions: ['en-US'] },
    ],
    example: { es: 'Hoy me he levantado con el pie izquierdo.', en: 'I got out of bed on the wrong side today.' },
  },
  {
    id: 'couldnt-care-less',
    meaning: 'No importar nada en absoluto.',
    expressions: [
      { lang: 'es', text: 'importar un pimiento', literal: { en: 'to matter a pepper' }, register: 'informal', keywords: ['me importa un pimiento'] },
      { lang: 'es', text: 'importar un bledo', literal: { en: 'to matter an amaranth (a weed)' }, register: 'informal', keywords: ['me importa un bledo'] },
      { lang: 'es', text: 'importar un carajo', literal: { en: 'to matter a dick' }, register: 'vulgar', keywords: ['me importa un carajo'] },
      { lang: 'en', text: "I couldn't care less", literal: { es: 'no podría importarme menos' }, register: 'informal' },
      { lang: 'en', text: 'not to give a damn', literal: { es: 'no dar una maldición' }, register: 'informal', keywords: ["I don't give a damn"] },
      { lang: 'en', text: 'not to give a toss', literal: { es: 'no dar un lanzamiento' }, register: 'vulgar', regions: ['en-GB'] },
    ],
    example: { es: 'Lo que piensen los demás me importa un pimiento.', en: "I couldn't care less what other people think." },
  },
  {
    id: 'break-a-leg',
    meaning: 'Desear suerte, sobre todo antes de una actuación.',
    expressions: [
      { lang: 'es', text: '¡mucha mierda!', literal: { en: 'lots of shit!' }, register: 'vulgar' },
      { lang: 'es', text: '¡mucha suerte!', literal: { en: 'lots of luck!' } },
      { lang: 'en', text: 'break a leg!', literal: { es: '¡rómpete una pierna!' }, register: 'informal' },
    ],
    example: { es: 'Hoy es el estreno, ¿no? ¡Mucha mierda!', en: "It's opening night today, isn't it? Break a leg!" },
  },
  {
    id: 'red-as-a-beetroot',
    meaning: 'Ponerse muy colorado, normalmente por vergüenza.',
    expressions: [
      { lang: 'es', text: 'ponerse rojo como un tomate', literal: { en: 'to turn red like a tomato' }, register: 'informal', keywords: ['rojo como un tomate'] },
      { lang: 'en', text: 'to go as red as a beetroot', literal: { es: 'ponerse tan rojo como una remolacha' }, register: 'informal', regions: ['en-GB'] },
      { lang: 'en', text: 'to turn as red as a beet', literal: { es: 'ponerse tan rojo como una remolacha' }, register: 'informal', regions: ['en-US'] },
    ],
    example: { es: 'Cuando le dijeron el piropo se puso rojo como un tomate.', en: 'When they paid him the compliment, he went as red as a beetroot.' },
  },
  {
    id: 'broke',
    meaning: 'No tener dinero.',
    expressions: [
      { lang: 'es', text: 'estar sin blanca', literal: { en: 'to be without a "blanca" (an old coin)' }, register: 'informal', regions: ['es-ES'], keywords: ['estoy sin blanca'] },
      { lang: 'es', text: 'estar pelado', literal: { en: 'to be peeled' }, register: 'informal' },
      { lang: 'en', text: 'to be broke', literal: { es: 'estar roto' }, register: 'informal', keywords: ["I'm broke"] },
      { lang: 'en', text: 'to be skint', literal: { es: 'estar despellejado' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'No puedo ir al concierto, estoy sin blanca.', en: "I can't go to the concert, I'm broke." },
  },
  {
    id: 'squeaky-wheel',
    meaning: 'Quien no pide o se queja, no consigue lo que quiere.',
    expressions: [
      { lang: 'es', text: 'quien no llora, no mama', literal: { en: "who doesn't cry, doesn't get breastfed" }, register: 'informal' },
      { lang: 'en', text: 'the squeaky wheel gets the grease', literal: { es: 'la rueda que chirría se lleva la grasa' }, regions: ['en-US'] },
      { lang: 'en', text: "if you don't ask, you don't get", literal: { es: 'si no pides, no consigues' } },
    ],
  },
  {
    id: 'grin-and-bear-it',
    meaning: 'Afrontar los problemas con buena actitud.',
    expressions: [
      { lang: 'es', text: 'al mal tiempo, buena cara', literal: { en: 'to bad weather, a good face' } },
      { lang: 'en', text: 'to keep your chin up', literal: { es: 'mantener la barbilla alta' }, keywords: ['keep your chin up', 'chin up'] },
      { lang: 'en', text: 'to grin and bear it', literal: { es: 'sonreír y aguantarlo' } },
    ],
    example: { es: 'Sé que es difícil, pero al mal tiempo, buena cara.', en: "I know it's hard, but keep your chin up." },
  },
  {
    id: 'rip-someone-off',
    meaning: 'Engañar a alguien dándole algo de peor calidad de lo que parece.',
    expressions: [
      { lang: 'es', text: 'dar gato por liebre', literal: { en: 'to give cat instead of hare' }, register: 'informal', keywords: ['nos dieron gato por liebre'] },
      { lang: 'en', text: 'to rip someone off', literal: { es: 'arrancarle algo a alguien' }, register: 'informal', keywords: ['rip-off'] },
      { lang: 'en', text: 'to sell someone a pup', literal: { es: 'venderle a alguien un cachorro' }, register: 'informal', regions: ['en-GB'] },
    ],
    example: { es: 'Ese reloj no es de oro: te han dado gato por liebre.', en: "That watch isn't gold: you've been ripped off." },
  },
  {
    id: 'suck-up-to-someone',
    meaning: 'Halagar a alguien por interés.',
    expressions: [
      { lang: 'es', text: 'hacerle la pelota a alguien', literal: { en: 'to make the ball for someone' }, register: 'informal', regions: ['es-ES'], keywords: ['hacer la pelota', 'pelota', 'pelotero'] },
      { lang: 'es', text: 'lamerle las botas a alguien', literal: { en: "to lick someone's boots" }, register: 'informal', keywords: ['lamer las botas'] },
      { lang: 'en', text: 'to suck up to someone', literal: { es: 'chuparle hacia arriba a alguien' }, register: 'informal', keywords: ['suck up'] },
      { lang: 'en', text: 'to butter someone up', literal: { es: 'untarle mantequilla a alguien' }, register: 'informal' },
    ],
    example: { es: 'Siempre le está haciendo la pelota al jefe.', en: "He's always sucking up to the boss." },
  },
  {
    id: 'blood-from-a-stone',
    meaning: 'Pedir algo imposible a quien no puede darlo.',
    expressions: [
      { lang: 'es', text: 'pedirle peras al olmo', literal: { en: 'to ask the elm tree for pears' }, keywords: ['pedir peras al olmo'] },
      { lang: 'en', text: "you can't get blood from a stone", literal: { es: 'no se puede sacar sangre de una piedra' }, keywords: ['blood from a stone', 'blood out of a stone'] },
    ],
    example: { es: 'Esperar que sea puntual es pedirle peras al olmo.', en: "Expecting him to be on time is like trying to get blood from a stone." },
  },
]
