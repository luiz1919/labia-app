// False friends: words that look alike in two languages but mean different things.
import type { FalseFriend } from './types'

export const FALSE_FRIENDS: readonly FalseFriend[] = [
  {
    id: 'actually',
    words: [
      { lang: 'en', word: 'actually', means: ['en realidad', 'de hecho'], example: { en: "Actually, I've never been to London.", es: 'En realidad, nunca he estado en Londres.' } },
      { lang: 'es', word: 'actualmente', means: ['currently', 'nowadays'], example: { es: 'Actualmente vivo en Madrid.', en: 'I currently live in Madrid.' } },
    ],
  },
  {
    id: 'actual',
    words: [
      { lang: 'en', word: 'actual', means: ['real', 'verdadero'], example: { en: 'The actual cost was much higher.', es: 'El coste real fue mucho más alto.' } },
      { lang: 'es', word: 'actual', means: ['current', 'present'], example: { es: 'El gobierno actual ha subido los impuestos.', en: 'The current government has raised taxes.' } },
    ],
  },
  {
    id: 'embarrassed',
    words: [
      { lang: 'en', word: 'embarrassed', means: ['avergonzado', 'con vergüenza'], example: { en: 'I was so embarrassed when I fell over.', es: 'Me dio muchísima vergüenza caerme.' } },
      { lang: 'es', word: 'embarazada', means: ['pregnant'], example: { es: 'Mi hermana está embarazada de cinco meses.', en: 'My sister is five months pregnant.' } },
    ],
  },
  {
    id: 'constipated',
    words: [
      { lang: 'en', word: 'constipated', means: ['estreñido'], example: { en: 'Eat more fibre if you are constipated.', es: 'Come más fibra si estás estreñido.' } },
      { lang: 'es', word: 'constipado', means: ['having a cold', 'stuffed up'], example: { es: 'No voy a trabajar, estoy constipado.', en: "I'm not going to work, I've got a cold." } },
    ],
  },
  {
    id: 'carpet',
    words: [
      { lang: 'en', word: 'carpet', means: ['moqueta', 'alfombra'], example: { en: 'We have a blue carpet in the bedroom.', es: 'Tenemos una moqueta azul en el dormitorio.' } },
      { lang: 'es', word: 'carpeta', means: ['folder', 'binder'], example: { es: 'Guarda los documentos en esta carpeta.', en: 'Keep the documents in this folder.' } },
    ],
  },
  {
    id: 'library',
    words: [
      { lang: 'en', word: 'library', means: ['biblioteca'], example: { en: 'I borrowed this book from the library.', es: 'He sacado este libro de la biblioteca.' } },
      { lang: 'es', word: 'librería', means: ['bookshop', 'bookstore'], example: { es: 'Compré el libro en la librería de la esquina.', en: 'I bought the book at the bookshop on the corner.' } },
    ],
  },
  {
    id: 'sensible',
    words: [
      { lang: 'en', word: 'sensible', means: ['sensato', 'razonable'], example: { en: "That's a very sensible decision.", es: 'Es una decisión muy sensata.' } },
      { lang: 'es', word: 'sensible', means: ['sensitive'], example: { es: 'Tengo la piel muy sensible.', en: 'I have very sensitive skin.' } },
    ],
  },
  {
    id: 'realize',
    words: [
      { lang: 'en', word: 'realize', means: ['darse cuenta de'], example: { en: "I didn't realize it was so late.", es: 'No me di cuenta de que era tan tarde.' } },
      { lang: 'es', word: 'realizar', means: ['to carry out', 'to do', 'to make'], example: { es: 'Vamos a realizar una encuesta.', en: 'We are going to carry out a survey.' } },
    ],
    note: 'En inglés británico también se escribe «realise».',
  },
  {
    id: 'assist',
    words: [
      { lang: 'en', word: 'assist', means: ['ayudar'], example: { en: 'Can I assist you with your bags?', es: '¿Le ayudo con las maletas?' } },
      { lang: 'es', word: 'asistir', means: ['to attend', 'to be present at'], example: { es: 'Asistí a una conferencia sobre el clima.', en: 'I attended a talk about the climate.' } },
    ],
  },
  {
    id: 'attend',
    words: [
      { lang: 'en', word: 'attend', means: ['asistir a', 'acudir a'], example: { en: 'Over 200 people attended the meeting.', es: 'Más de 200 personas asistieron a la reunión.' } },
      { lang: 'es', word: 'atender', means: ['to serve', 'to pay attention', 'to deal with'], example: { es: '¿Ya le atienden?', en: 'Are you being served?' } },
    ],
  },
  {
    id: 'exit',
    words: [
      { lang: 'en', word: 'exit', means: ['salida'], example: { en: 'The exit is at the back of the building.', es: 'La salida está al fondo del edificio.' } },
      { lang: 'es', word: 'éxito', means: ['success', 'hit'], example: { es: 'La obra fue un éxito.', en: 'The play was a success.' } },
    ],
  },
  {
    id: 'success',
    words: [
      { lang: 'en', word: 'success', means: ['éxito'], example: { en: 'The launch was a great success.', es: 'El lanzamiento fue todo un éxito.' } },
      { lang: 'es', word: 'suceso', means: ['event', 'incident'], example: { es: 'El periódico habla de un suceso extraño.', en: 'The newspaper reports a strange incident.' } },
    ],
  },
  {
    id: 'eventually',
    words: [
      { lang: 'en', word: 'eventually', means: ['finalmente', 'al final', 'con el tiempo'], example: { en: 'Eventually, we found the hotel.', es: 'Al final encontramos el hotel.' } },
      { lang: 'es', word: 'eventualmente', means: ['possibly', 'if necessary', 'occasionally'], example: { es: 'Eventualmente podríamos necesitar más personal.', en: 'We might possibly need more staff.' } },
    ],
  },
  {
    id: 'sympathetic',
    words: [
      { lang: 'en', word: 'sympathetic', means: ['comprensivo', 'compasivo'], example: { en: 'My boss was very sympathetic when I was ill.', es: 'Mi jefe fue muy comprensivo cuando estuve enfermo.' } },
      { lang: 'es', word: 'simpático', means: ['nice', 'friendly'], example: { es: 'Tu primo es muy simpático.', en: 'Your cousin is really nice.' } },
    ],
  },
  {
    id: 'preservative',
    words: [
      { lang: 'en', word: 'preservative', means: ['conservante'], example: { en: 'This jam contains no preservatives.', es: 'Esta mermelada no lleva conservantes.' } },
      { lang: 'es', word: 'preservativo', means: ['condom'], example: { es: 'Venden preservativos en la farmacia.', en: "They sell condoms at the chemist's." } },
    ],
  },
  {
    id: 'molest',
    words: [
      { lang: 'en', word: 'molest', means: ['abusar sexualmente de', 'agredir'], example: { en: 'He was accused of molesting a child.', es: 'Lo acusaron de abusar de un menor.' } },
      { lang: 'es', word: 'molestar', means: ['to bother', 'to annoy', 'to disturb'], example: { es: 'Perdone que le moleste.', en: 'Sorry to bother you.' } },
    ],
    note: 'Ojo: «molest» es muy grave en inglés. Para «molestar» usa «bother» o «annoy».',
  },
  {
    id: 'casualty',
    words: [
      { lang: 'en', word: 'casualty', means: ['víctima', 'herido', 'baja'], example: { en: 'There were no casualties in the accident.', es: 'No hubo víctimas en el accidente.' } },
      { lang: 'es', word: 'casualidad', means: ['chance', 'coincidence'], example: { es: '¡Qué casualidad verte aquí!', en: 'What a coincidence to see you here!' } },
    ],
    note: 'En el Reino Unido, «Casualty» es también el servicio de urgencias de un hospital.',
  },
  {
    id: 'career',
    words: [
      { lang: 'en', word: 'career', means: ['trayectoria profesional', 'profesión'], example: { en: 'She has had a long career in journalism.', es: 'Ha tenido una larga trayectoria en el periodismo.' } },
      { lang: 'es', word: 'carrera', means: ['degree', 'race', 'career'], example: { es: 'Estudié la carrera de Derecho en Salamanca.', en: 'I did my law degree in Salamanca.' } },
    ],
    note: 'Falso amigo parcial: «carrera» puede ser «career», pero «hacer la carrera» (estudiar en la universidad) es «to do a degree».',
  },
  {
    id: 'college',
    words: [
      { lang: 'en', word: 'college', means: ['universidad', 'centro de estudios superiores'], example: { en: 'My son is going to college next year.', es: 'Mi hijo empieza la universidad el año que viene.' } },
      { lang: 'es', word: 'colegio', means: ['school'], example: { es: 'Los niños están en el colegio.', en: 'The children are at school.' } },
    ],
    note: 'En EE. UU. «college» es la universidad; en el Reino Unido suele ser un centro de formación después de los 16 años.',
  },
  {
    id: 'lecture',
    words: [
      { lang: 'en', word: 'lecture', means: ['conferencia', 'clase magistral', 'sermón'], example: { en: 'The professor gave a lecture on Cervantes.', es: 'El catedrático dio una conferencia sobre Cervantes.' } },
      { lang: 'es', word: 'lectura', means: ['reading'], example: { es: 'La lectura es mi afición favorita.', en: 'Reading is my favourite hobby.' } },
    ],
  },
  {
    id: 'argument',
    words: [
      { lang: 'en', word: 'argument', means: ['discusión', 'pelea', 'argumento (razonamiento)'], example: { en: 'They had an argument about money.', es: 'Discutieron por dinero.' } },
      { lang: 'es', word: 'argumento', means: ['plot', 'argument (reasoning)'], example: { es: 'El argumento de la película es muy original.', en: 'The plot of the film is very original.' } },
    ],
    note: 'Falso amigo parcial: los dos significan «razonamiento», pero «argument» suele ser una discusión y el argumento de una película es «plot».',
  },
  {
    id: 'fabric',
    words: [
      { lang: 'en', word: 'fabric', means: ['tela', 'tejido'], example: { en: 'This fabric is very soft.', es: 'Esta tela es muy suave.' } },
      { lang: 'es', word: 'fábrica', means: ['factory'], example: { es: 'Mi padre trabajaba en una fábrica de coches.', en: 'My father worked in a car factory.' } },
    ],
  },
  {
    id: 'large',
    words: [
      { lang: 'en', word: 'large', means: ['grande'], example: { en: 'A large coffee, please.', es: 'Un café grande, por favor.' } },
      { lang: 'es', word: 'largo', means: ['long'], example: { es: 'Fue un viaje muy largo.', en: 'It was a very long journey.' } },
    ],
  },
  {
    id: 'advertise',
    words: [
      { lang: 'en', word: 'advertise', means: ['anunciar', 'hacer publicidad'], example: { en: 'They advertise on television.', es: 'Se anuncian en la televisión.' } },
      { lang: 'es', word: 'advertir', means: ['to warn', 'to notice'], example: { es: 'Te advierto que el agua está fría.', en: 'I warn you, the water is cold.' } },
    ],
  },
  {
    id: 'recipient',
    words: [
      { lang: 'en', word: 'recipient', means: ['destinatario', 'receptor'], example: { en: 'Check the name of the recipient.', es: 'Comprueba el nombre del destinatario.' } },
      { lang: 'es', word: 'recipiente', means: ['container'], example: { es: 'Pon la sopa en un recipiente de cristal.', en: 'Put the soup in a glass container.' } },
    ],
  },
  {
    id: 'record',
    words: [
      { lang: 'en', word: 'record', means: ['grabar', 'registrar', 'récord'], example: { en: 'The band recorded a new album.', es: 'El grupo grabó un disco nuevo.' } },
      { lang: 'es', word: 'recordar', means: ['to remember', 'to remind'], example: { es: 'No recuerdo dónde dejé las llaves.', en: "I can't remember where I left my keys." } },
    ],
  },
  {
    id: 'pretend',
    words: [
      { lang: 'en', word: 'pretend', means: ['fingir', 'hacer como que'], example: { en: 'He pretended to be asleep.', es: 'Fingió estar dormido.' } },
      { lang: 'es', word: 'pretender', means: ['to intend', 'to try to', 'to expect'], example: { es: '¿Qué pretendes hacer con eso?', en: 'What do you intend to do with that?' } },
    ],
  },
  {
    id: 'support',
    words: [
      { lang: 'en', word: 'support', means: ['apoyar', 'mantener', 'ser de (un equipo)'], example: { en: 'My family always supports me.', es: 'Mi familia siempre me apoya.' } },
      { lang: 'es', word: 'soportar', means: ['to stand', 'to bear', 'to put up with'], example: { es: 'No soporto el calor.', en: "I can't stand the heat." } },
    ],
    note: '«Soportar» un peso sí es «to support»: «Estas columnas soportan el techo».',
  },
  {
    id: 'resume',
    words: [
      { lang: 'en', word: 'resume', means: ['reanudar', 'retomar'], example: { en: 'The meeting will resume after lunch.', es: 'La reunión se reanudará después de comer.' } },
      { lang: 'es', word: 'resumir', means: ['to summarize', 'to sum up'], example: { es: '¿Puedes resumir el artículo?', en: 'Can you summarize the article?' } },
    ],
    note: 'En EE. UU. «résumé» (con o sin tildes) es el currículum.',
  },
  {
    id: 'topic',
    words: [
      { lang: 'en', word: 'topic', means: ['tema'], example: { en: "Let's change the topic.", es: 'Cambiemos de tema.' } },
      { lang: 'es', word: 'tópico', means: ['cliché', 'stereotype'], example: { es: 'Eso de que los españoles duermen la siesta es un tópico.', en: 'The idea that Spaniards take a siesta is a cliché.' } },
    ],
  },
  {
    id: 'contest',
    words: [
      { lang: 'en', word: 'contest', means: ['concurso', 'competición', 'impugnar'], example: { en: 'She won a singing contest.', es: 'Ganó un concurso de canto.' } },
      { lang: 'es', word: 'contestar', means: ['to answer', 'to reply'], example: { es: 'Todavía no ha contestado a mi mensaje.', en: "He still hasn't answered my message." } },
    ],
  },
  {
    id: 'deception',
    words: [
      { lang: 'en', word: 'deception', means: ['engaño'], example: { en: 'The whole story was a deception.', es: 'Toda la historia fue un engaño.' } },
      { lang: 'es', word: 'decepción', means: ['disappointment'], example: { es: 'La película fue una decepción.', en: 'The film was a disappointment.' } },
    ],
  },
  {
    id: 'compromise',
    words: [
      { lang: 'en', word: 'compromise', means: ['acuerdo (con concesiones)', 'término medio', 'transigir'], example: { en: 'After hours of talks, they reached a compromise.', es: 'Tras horas de negociación, llegaron a un acuerdo.' } },
      { lang: 'es', word: 'compromiso', means: ['commitment', 'engagement', 'obligation'], example: { es: 'Tengo un compromiso esta noche.', en: 'I have a prior engagement tonight.' } },
    ],
  },
  {
    id: 'rope',
    words: [
      { lang: 'en', word: 'rope', means: ['cuerda', 'soga'], example: { en: 'Tie the boat with this rope.', es: 'Ata el barco con esta cuerda.' } },
      { lang: 'es', word: 'ropa', means: ['clothes'], example: { es: 'Tengo que lavar la ropa.', en: 'I need to wash my clothes.' } },
    ],
  },
  {
    id: 'parents',
    words: [
      { lang: 'en', word: 'parents', means: ['padres'], example: { en: 'My parents live in Seville.', es: 'Mis padres viven en Sevilla.' } },
      { lang: 'es', word: 'parientes', means: ['relatives'], example: { es: 'En Navidad vienen todos los parientes.', en: 'All our relatives come at Christmas.' } },
    ],
  },
  {
    id: 'exciting',
    words: [
      { lang: 'en', word: 'exciting', means: ['emocionante', 'apasionante'], example: { en: 'It was a really exciting match.', es: 'Fue un partido muy emocionante.' } },
      { lang: 'es', word: 'excitante', means: ['arousing', 'stimulating'], example: { es: 'El café es una bebida excitante.', en: 'Coffee is a stimulating drink.' } },
    ],
    note: 'Usar «excitante» para un partido o un viaje suena a calco del inglés y puede tener un matiz sexual.',
  },
  {
    id: 'billion',
    words: [
      { lang: 'en', word: 'billion', means: ['mil millones'], example: { en: 'The company is worth three billion dollars.', es: 'La empresa vale tres mil millones de dólares.' } },
      { lang: 'es', word: 'billón', means: ['trillion (a million millions)'], example: { es: 'La deuda supera el billón de euros.', en: 'The debt is over a trillion euros.' } },
    ],
  },
  {
    id: 'terrific',
    words: [
      { lang: 'en', word: 'terrific', means: ['estupendo', 'genial'], example: { en: "You look terrific!", es: '¡Estás estupenda!' } },
      { lang: 'es', word: 'terrorífico', means: ['terrifying', 'horrifying'], example: { es: 'Vimos una película terrorífica.', en: 'We watched a terrifying film.' } },
    ],
  },
  {
    id: 'costume',
    words: [
      { lang: 'en', word: 'costume', means: ['disfraz', 'traje típico', 'vestuario'], example: { en: 'What costume are you wearing to the party?', es: '¿De qué te vas a disfrazar para la fiesta?' } },
      { lang: 'es', word: 'costumbre', means: ['custom', 'habit'], example: { es: 'Tengo la costumbre de leer antes de dormir.', en: 'I have a habit of reading before bed.' } },
    ],
  },
  {
    id: 'diversion',
    words: [
      { lang: 'en', word: 'diversion', means: ['desvío', 'distracción'], example: { en: 'There is a diversion because of the roadworks.', es: 'Hay un desvío por las obras.' } },
      { lang: 'es', word: 'diversión', means: ['fun', 'entertainment'], example: { es: 'Este parque es pura diversión.', en: 'This park is great fun.' } },
    ],
  },
]
