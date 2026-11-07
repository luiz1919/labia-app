// English phrasal verbs with their Spanish meanings, searchable both ways.
import type { PhrasalVerb } from './types'

/** Phrasal verbs are an English thing: they only show up when English is one side of the pair. */
export const PHRASAL_VERB_LANG = 'en'

export const PHRASAL_VERBS: readonly PhrasalVerb[] = [
  { id: 'get-up', verb: 'get', particle: 'up', senses: [{ translations: { es: ['levantarse'] }, object: 'none', example: { en: 'I get up at seven every day.', es: 'Me levanto a las siete todos los días.' } }] },
  { id: 'get-over', verb: 'get', particle: 'over', senses: [{ translations: { es: ['superar', 'recuperarse de'] }, object: 'inseparable', example: { en: 'It took her months to get over the break-up.', es: 'Tardó meses en superar la ruptura.' } }] },
  {
    id: 'get-on', verb: 'get', particle: 'on', senses: [
      { translations: { es: ['subirse a', 'subir a'] }, object: 'inseparable', example: { en: 'Get on the bus, quick!', es: '¡Súbete al autobús, rápido!' } },
      { translations: { es: ['llevarse bien'] }, object: 'none', example: { en: 'I get on really well with my sister.', es: 'Me llevo muy bien con mi hermana.' } },
    ],
  },
  { id: 'get-off', verb: 'get', particle: 'off', senses: [{ translations: { es: ['bajarse de', 'bajar de'] }, object: 'inseparable', example: { en: 'We get off at the next stop.', es: 'Nos bajamos en la próxima parada.' } }] },
  { id: 'get-by', verb: 'get', particle: 'by', senses: [{ translations: { es: ['arreglárselas', 'apañarse', 'defenderse'] }, object: 'none', example: { en: 'I can get by in French.', es: 'Me defiendo en francés.' } }] },
  {
    id: 'get-back', verb: 'get', particle: 'back', senses: [
      { translations: { es: ['volver', 'regresar'] }, object: 'none', example: { en: 'When did you get back from Paris?', es: '¿Cuándo volviste de París?' } },
      { translations: { es: ['recuperar'] }, object: 'separable', example: { en: 'I want to get my money back.', es: 'Quiero recuperar mi dinero.' } },
    ],
  },
  {
    id: 'give-up', verb: 'give', particle: 'up', senses: [
      { translations: { es: ['dejar (de hacer algo)'] }, object: 'separable', example: { en: 'I gave up smoking last year.', es: 'Dejé de fumar el año pasado.' } },
      { translations: { es: ['rendirse'] }, object: 'none', example: { en: "Don't give up!", es: '¡No te rindas!' } },
    ],
  },
  { id: 'give-back', verb: 'give', particle: 'back', senses: [{ translations: { es: ['devolver'] }, object: 'separable', example: { en: 'Can you give me my book back?', es: '¿Me puedes devolver el libro?' } }] },
  { id: 'give-in', verb: 'give', particle: 'in', senses: [{ translations: { es: ['ceder', 'rendirse'] }, object: 'none', example: { en: 'She finally gave in and bought him a dog.', es: 'Al final cedió y le compró un perro.' } }] },
  { id: 'look-for', verb: 'look', particle: 'for', senses: [{ translations: { es: ['buscar'] }, object: 'inseparable', example: { en: "I'm looking for my keys.", es: 'Estoy buscando las llaves.' } }] },
  { id: 'look-after', verb: 'look', particle: 'after', senses: [{ translations: { es: ['cuidar', 'cuidar de'] }, object: 'inseparable', example: { en: 'Can you look after my cat this weekend?', es: '¿Puedes cuidar de mi gato este fin de semana?' } }] },
  { id: 'look-forward-to', verb: 'look', particle: 'forward to', senses: [{ translations: { es: ['tener ganas de', 'esperar con ilusión'] }, object: 'inseparable', example: { en: "I'm looking forward to seeing you.", es: 'Tengo muchas ganas de verte.' } }] },
  { id: 'look-up', verb: 'look', particle: 'up', senses: [{ translations: { es: ['buscar (en un diccionario o en internet)', 'consultar'] }, object: 'separable', example: { en: 'Look the word up in the dictionary.', es: 'Busca la palabra en el diccionario.' } }] },
  { id: 'look-out', verb: 'look', particle: 'out', senses: [{ translations: { es: ['tener cuidado', '¡cuidado!'] }, object: 'none', example: { en: "Look out! There's a car coming.", es: '¡Cuidado! Viene un coche.' } }] },
  {
    id: 'put-on', verb: 'put', particle: 'on', senses: [
      { translations: { es: ['ponerse (ropa)'] }, object: 'separable', example: { en: "Put your coat on, it's cold.", es: 'Ponte el abrigo, hace frío.' } },
      { translations: { es: ['engordar (put on weight)'] }, object: 'separable', example: { en: "I've put on three kilos.", es: 'He engordado tres kilos.' } },
    ],
  },
  { id: 'put-off', verb: 'put', particle: 'off', senses: [{ translations: { es: ['posponer', 'aplazar'] }, object: 'separable', example: { en: 'We put off the meeting until Friday.', es: 'Aplazamos la reunión hasta el viernes.' } }] },
  { id: 'put-up-with', verb: 'put', particle: 'up with', senses: [{ translations: { es: ['aguantar', 'soportar'] }, object: 'inseparable', example: { en: "I can't put up with this noise any longer.", es: 'No aguanto más este ruido.' } }] },
  { id: 'put-away', verb: 'put', particle: 'away', senses: [{ translations: { es: ['guardar', 'recoger'] }, object: 'separable', example: { en: 'Put your toys away, please.', es: 'Recoge los juguetes, por favor.' } }] },
  {
    id: 'take-off', verb: 'take', particle: 'off', senses: [
      { translations: { es: ['quitarse (ropa)'] }, object: 'separable', example: { en: 'Take your shoes off, please.', es: 'Quítate los zapatos, por favor.' } },
      { translations: { es: ['despegar'] }, object: 'none', example: { en: 'The plane took off on time.', es: 'El avión despegó puntual.' } },
    ],
  },
  { id: 'take-up', verb: 'take', particle: 'up', senses: [{ translations: { es: ['empezar (una afición o actividad)'] }, object: 'separable', example: { en: "I've taken up yoga.", es: 'He empezado a hacer yoga.' } }] },
  { id: 'take-after', verb: 'take', particle: 'after', senses: [{ translations: { es: ['parecerse a (un familiar)', 'salir a'] }, object: 'inseparable', example: { en: 'She takes after her mother.', es: 'Se parece a su madre.' } }] },
  { id: 'turn-on', verb: 'turn', particle: 'on', senses: [{ translations: { es: ['encender'] }, object: 'separable', example: { en: 'Turn on the light, please.', es: 'Enciende la luz, por favor.' } }] },
  { id: 'turn-off', verb: 'turn', particle: 'off', senses: [{ translations: { es: ['apagar'] }, object: 'separable', example: { en: "Don't forget to turn the TV off.", es: 'No te olvides de apagar la tele.' } }] },
  {
    id: 'turn-up', verb: 'turn', particle: 'up', senses: [
      { translations: { es: ['subir (el volumen)'] }, object: 'separable', example: { en: 'Turn the music up!', es: '¡Sube la música!' } },
      { translations: { es: ['aparecer', 'presentarse'] }, object: 'none', example: { en: 'He turned up late, as usual.', es: 'Apareció tarde, como siempre.' } },
    ],
  },
  {
    id: 'turn-down', verb: 'turn', particle: 'down', senses: [
      { translations: { es: ['rechazar'] }, object: 'separable', example: { en: 'She turned down the job offer.', es: 'Rechazó la oferta de trabajo.' } },
      { translations: { es: ['bajar (el volumen)'] }, object: 'separable', example: { en: 'Can you turn the radio down?', es: '¿Puedes bajar la radio?' } },
    ],
  },
  { id: 'come-back', verb: 'come', particle: 'back', senses: [{ translations: { es: ['volver', 'regresar'] }, object: 'none', example: { en: 'Come back soon!', es: '¡Vuelve pronto!' } }] },
  { id: 'come-across', verb: 'come', particle: 'across', senses: [{ translations: { es: ['encontrarse con (por casualidad)', 'toparse con'] }, object: 'inseparable', example: { en: 'I came across an old photo of you.', es: 'Me encontré una foto antigua tuya.' } }] },
  { id: 'come-up-with', verb: 'come', particle: 'up with', senses: [{ translations: { es: ['idear', 'ocurrírsele (algo a alguien)'] }, object: 'inseparable', example: { en: 'She came up with a great idea.', es: 'Se le ocurrió una idea genial.' } }] },
  {
    id: 'go-on', verb: 'go', particle: 'on', senses: [
      { translations: { es: ['continuar', 'seguir'] }, object: 'none', example: { en: "Go on, I'm listening.", es: 'Sigue, te escucho.' } },
      { translations: { es: ['pasar', 'ocurrir'] }, object: 'none', example: { en: "What's going on?", es: '¿Qué pasa?' } },
    ],
  },
  { id: 'go-out', verb: 'go', particle: 'out', senses: [{ translations: { es: ['salir (a divertirse)'] }, object: 'none', example: { en: 'Are you going out tonight?', es: '¿Sales esta noche?' } }] },
  {
    id: 'go-off', verb: 'go', particle: 'off', senses: [
      { translations: { es: ['sonar (una alarma)', 'explotar'] }, object: 'none', example: { en: 'My alarm went off at six.', es: 'Mi despertador sonó a las seis.' } },
      { translations: { es: ['estropearse (la comida)', 'ponerse malo'] }, object: 'none', example: { en: 'The milk has gone off.', es: 'La leche se ha puesto mala.' } },
    ],
  },
  {
    id: 'break-down', verb: 'break', particle: 'down', senses: [
      { translations: { es: ['averiarse', 'estropearse'] }, object: 'none', example: { en: 'My car broke down on the motorway.', es: 'Se me averió el coche en la autopista.' } },
      { translations: { es: ['venirse abajo', 'derrumbarse'] }, object: 'none', example: { en: 'She broke down in tears.', es: 'Se echó a llorar.' } },
    ],
  },
  { id: 'break-up', verb: 'break', particle: 'up', senses: [{ translations: { es: ['romper', 'cortar (una relación)'] }, object: 'none', example: { en: 'They broke up after five years.', es: 'Rompieron después de cinco años.' } }] },
  { id: 'run-out-of', verb: 'run', particle: 'out of', senses: [{ translations: { es: ['quedarse sin', 'acabarse'] }, object: 'inseparable', example: { en: "We've run out of milk.", es: 'Nos hemos quedado sin leche.' } }] },
  { id: 'run-into', verb: 'run', particle: 'into', senses: [{ translations: { es: ['encontrarse con (por casualidad)', 'toparse con'] }, object: 'inseparable', example: { en: 'I ran into an old friend at the supermarket.', es: 'Me encontré con un viejo amigo en el súper.' } }] },
  { id: 'find-out', verb: 'find', particle: 'out', senses: [{ translations: { es: ['averiguar', 'enterarse de', 'descubrir'] }, object: 'separable', example: { en: 'I need to find out what time the train leaves.', es: 'Tengo que averiguar a qué hora sale el tren.' } }] },
  { id: 'figure-out', verb: 'figure', particle: 'out', senses: [{ translations: { es: ['entender', 'averiguar', 'resolver'] }, object: 'separable', example: { en: "I can't figure out how this works.", es: 'No consigo entender cómo funciona esto.' } }] },
  {
    id: 'work-out', verb: 'work', particle: 'out', senses: [
      { translations: { es: ['hacer ejercicio', 'entrenar'] }, object: 'none', example: { en: 'I work out three times a week.', es: 'Hago ejercicio tres veces por semana.' } },
      { translations: { es: ['resolver', 'calcular'] }, object: 'separable', example: { en: 'Can you work out the answer?', es: '¿Puedes resolverlo?' } },
      { translations: { es: ['salir bien', 'funcionar'] }, object: 'none', example: { en: "Don't worry, it'll work out.", es: 'No te preocupes, saldrá bien.' } },
    ],
  },
  {
    id: 'pick-up', verb: 'pick', particle: 'up', senses: [
      { translations: { es: ['recoger (a alguien o algo)'] }, object: 'separable', example: { en: "I'll pick you up at eight.", es: 'Te recojo a las ocho.' } },
      { translations: { es: ['aprender (sin estudiar)', 'pillar'] }, object: 'separable', example: { en: 'I picked up some Italian on holiday.', es: 'Aprendí algo de italiano en las vacaciones.' } },
    ],
  },
  { id: 'set-up', verb: 'set', particle: 'up', senses: [{ translations: { es: ['montar', 'crear', 'configurar'] }, object: 'separable', example: { en: 'She set up her own company.', es: 'Montó su propia empresa.' } }] },
  { id: 'carry-on', verb: 'carry', particle: 'on', senses: [{ translations: { es: ['seguir', 'continuar'] }, object: 'none', example: { en: "Carry on, you're doing great.", es: 'Sigue, lo estás haciendo genial.' } }] },
  { id: 'hang-out', verb: 'hang', particle: 'out', register: 'informal', senses: [{ translations: { es: ['pasar el rato', 'quedar'] }, object: 'none', example: { en: 'We hang out at the park on Saturdays.', es: 'Los sábados pasamos el rato en el parque.' } }] },
  { id: 'hang-up', verb: 'hang', particle: 'up', senses: [{ translations: { es: ['colgar (el teléfono)'] }, object: 'none', example: { en: "Don't hang up!", es: '¡No cuelgues!' } }] },
  { id: 'call-off', verb: 'call', particle: 'off', senses: [{ translations: { es: ['cancelar', 'suspender'] }, object: 'separable', example: { en: 'They called off the match because of the rain.', es: 'Suspendieron el partido por la lluvia.' } }] },
  { id: 'fill-in', verb: 'fill', particle: 'in', senses: [{ translations: { es: ['rellenar (un formulario)'] }, object: 'separable', example: { en: 'Please fill in this form.', es: 'Rellene este formulario, por favor.' } }] },
  { id: 'show-up', verb: 'show', particle: 'up', register: 'informal', senses: [{ translations: { es: ['aparecer', 'presentarse'] }, object: 'none', example: { en: 'Only five people showed up.', es: 'Solo aparecieron cinco personas.' } }] },
  {
    id: 'wake-up', verb: 'wake', particle: 'up', senses: [
      { translations: { es: ['despertarse'] }, object: 'none', example: { en: 'I woke up at three in the morning.', es: 'Me desperté a las tres de la mañana.' } },
      { translations: { es: ['despertar (a alguien)'] }, object: 'separable', example: { en: 'Wake me up at seven, please.', es: 'Despiértame a las siete, por favor.' } },
    ],
  },
  { id: 'calm-down', verb: 'calm', particle: 'down', senses: [{ translations: { es: ['calmarse', 'tranquilizarse'] }, object: 'none', example: { en: "Calm down, it's not a big deal.", es: 'Tranquilízate, no es para tanto.' } }] },
  {
    id: 'bring-up', verb: 'bring', particle: 'up', senses: [
      { translations: { es: ['criar', 'educar'] }, object: 'separable', example: { en: 'She was brought up by her grandparents.', es: 'La criaron sus abuelos.' } },
      { translations: { es: ['sacar (un tema)', 'mencionar'] }, object: 'separable', example: { en: "Don't bring up politics at dinner.", es: 'No saques el tema de la política en la cena.' } },
    ],
  },
  { id: 'sort-out', verb: 'sort', particle: 'out', senses: [{ translations: { es: ['solucionar', 'arreglar', 'organizar'] }, object: 'separable', example: { en: 'We need to sort out this problem.', es: 'Tenemos que solucionar este problema.' } }] },
  { id: 'throw-away', verb: 'throw', particle: 'away', senses: [{ translations: { es: ['tirar (a la basura)'] }, object: 'separable', example: { en: "Don't throw that box away.", es: 'No tires esa caja.' } }] },
  { id: 'try-on', verb: 'try', particle: 'on', senses: [{ translations: { es: ['probarse (ropa)'] }, object: 'separable', example: { en: 'Can I try these jeans on?', es: '¿Me puedo probar estos vaqueros?' } }] },
  {
    id: 'make-up', verb: 'make', particle: 'up', senses: [
      { translations: { es: ['inventarse'] }, object: 'separable', example: { en: 'He made up an excuse.', es: 'Se inventó una excusa.' } },
      { translations: { es: ['hacer las paces', 'reconciliarse'] }, object: 'none', example: { en: 'They argued but made up the next day.', es: 'Discutieron, pero hicieron las paces al día siguiente.' } },
    ],
  },
  { id: 'check-in', verb: 'check', particle: 'in', senses: [{ translations: { es: ['facturar', 'registrarse (en un hotel)'] }, object: 'none', example: { en: 'We need to check in two hours before the flight.', es: 'Tenemos que facturar dos horas antes del vuelo.' } }] },
  { id: 'hold-on', verb: 'hold', particle: 'on', senses: [{ translations: { es: ['esperar (un momento)'] }, object: 'none', example: { en: "Hold on, I'll get a pen.", es: 'Espera, voy a por un boli.' } }] },
  {
    id: 'cheer-up', verb: 'cheer', particle: 'up', senses: [
      { translations: { es: ['animarse'] }, object: 'none', example: { en: "Cheer up! It's Friday.", es: '¡Anímate! Es viernes.' } },
      { translations: { es: ['animar (a alguien)'] }, object: 'separable', example: { en: "Let's buy her some flowers to cheer her up.", es: 'Vamos a comprarle flores para animarla.' } },
    ],
  },
  { id: 'let-down', verb: 'let', particle: 'down', senses: [{ translations: { es: ['decepcionar', 'fallar'] }, object: 'separable', example: { en: "Don't let me down.", es: 'No me falles.' } }] },
  { id: 'point-out', verb: 'point', particle: 'out', senses: [{ translations: { es: ['señalar', 'hacer notar'] }, object: 'separable', example: { en: 'She pointed out a mistake in my essay.', es: 'Me señaló un error en la redacción.' } }] },
]
