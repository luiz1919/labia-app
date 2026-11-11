import type { AboutInfo } from 'firebase-app-kit/ui'
import { BUILD_INFO } from './buildInfo'

/** "Acerca de" (About): firebase-app-kit's AboutPage in "Ajustes" (#/acerca) and its AboutButton on the sign-in screen. */
export const ABOUT: AboutInfo = {
  appName: 'Labia',
  build: BUILD_INFO,
  icon: '/icons/labia.svg',
  tagline: 'Tu diccionario de bolsillo de expresiones, verbos y palabras',
  description: 'Para saber cómo se dice algo, aprender expresiones, falsos amigos y phrasal verbs, practicar la pronunciación y apuntar las palabras que no sabes traducir. Empieza con español ↔ inglés.',
  technology: [
    'React 19 y TypeScript',
    'Vite, como aplicación web instalable (PWA) que funciona sin conexión',
    'Firebase: Authentication, Firestore y Hosting',
    'firebase-app-kit: inicio de sesión, sincronización, comentarios, IA y publicación',
    'Voz del navegador (Web Speech) para escuchar y para reconocer lo que dices',
    'Wiktionary, MyMemory y Free Dictionary API para las traducciones y la pronunciación',
    'La IA que elijas (Google Gemini, OpenAI o Claude), con tu propia clave',
    'Iconos de Lucide',
  ],
  privacyNote: 'Borrador provisional, pendiente de la política de privacidad definitiva.',
  privacy: [
    'Para entrar se usa tu correo y tu contraseña con Firebase Authentication (Google).',
    'Tu par de idiomas, tu despensa y tus favoritos se guardan en tu cuenta (Firestore); solo tú puedes leerlos.',
    'Lo que buscas se envía a los diccionarios elegidos en «Motores de búsqueda» (Wiktionary, MyMemory...) para traducirlo.',
    'Al hablar, el reconocimiento de voz lo hace tu navegador, que puede enviar el audio a sus servidores (Chrome, a Google).',
    'Tus claves de IA se guardan en tu cuenta. Lo que preguntas al asistente y las fotos que lees se envían a la IA que hayas elegido, con tu clave.',
    'Si envías un comentario, se guarda con tu correo; las capturas y los datos técnicos, solo si los añades.',
  ],
  links: [
    { label: 'Soporte', url: '' },
    { label: 'Condiciones de uso', url: '' },
    { label: 'Política de privacidad', url: '' },
    { label: 'Wiktionary (contenido CC BY-SA)', url: 'https://en.wiktionary.org' },
    { label: 'MyMemory', url: 'https://mymemory.translated.net' },
    { label: 'Free Dictionary API', url: 'https://dictionaryapi.dev' },
  ],
  disclaimer: 'Las definiciones, traducciones y grabaciones de fuentes externas pertenecen a sus autores.',
}
