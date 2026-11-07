import { useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import type { Confusable } from '../data/types'
import type { LanguageCode, LanguagePair } from '../languages'
import { Example } from './bits'

function Quiz({ entry }: { entry: Confusable }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const answered = Object.keys(answers).length
  const correct = entry.quiz.filter((question, index) => answers[index] === question.answer).length

  return (
    <div className="quiz">
      <ol className="quiz-questions">
        {entry.quiz.map((question, index) => {
          const chosen = answers[index]
          const done = chosen !== undefined
          const right = chosen === question.answer
          const [before, after] = question.sentence.split('___')
          return (
            <li key={question.sentence}>
              <p className="quiz-sentence" lang={entry.lang}>{before}<span className={`quiz-gap${done ? (right ? ' quiz-right' : ' quiz-wrong') : ''}`}>{done ? question.fill ?? question.answer : <span className="sr-only">(hueco)</span>}</span>{after}</p>
              <div className="quiz-options" role="group" aria-label="Elige la palabra">
                {entry.words.map(word => (
                  <button key={word} type="button" lang={entry.lang} className={`chip${done && word === question.answer ? ' chip-right' : ''}${done && word === chosen && !right ? ' chip-wrong' : ''}`} disabled={done} aria-pressed={chosen === word} onClick={() => setAnswers(current => ({ ...current, [index]: word }))}>{word}</button>
                ))}
              </div>
              {done && (
                <p className={`quiz-feedback ${right ? 'quiz-right' : 'quiz-wrong'}`} role="status">
                  {right ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                  <span><strong>{right ? '¡Correcto!' : `No: es «${question.answer}».`}</strong> {question.why}</span>
                </p>
              )}
            </li>
          )
        })}
      </ol>
      {answered === entry.quiz.length && (
        <div className="quiz-result" role="status">
          <strong>{correct} de {entry.quiz.length} correctas</strong>
          <button className="secondary-button" type="button" onClick={() => setAnswers({})}><RotateCcw size={16} aria-hidden="true" />Repetir</button>
        </div>
      )}
    </div>
  )
}

/** "What is the difference between X and Y?": rule, examples and a mini quiz. */
export default function ConfusableCard({ entry, pair }: { entry: Confusable; pair: LanguagePair }) {
  const translation: LanguageCode = pair.source === entry.lang ? pair.target : pair.source

  return (
    <article className="card">
      <div className="card-heading"><h3 lang={entry.lang}>{entry.words.join(' / ')}</h3></div>
      <p className="card-meaning">{entry.rule}</p>
      <details className="card-details">
        <summary>Ejemplos</summary>
        <dl className="usages">
          {entry.usages.map(usage => (
            <div key={usage.word}>
              <dt lang={entry.lang}>{usage.word}</dt>
              <dd>{usage.use}</dd>
              {usage.examples.map(example => <dd key={example[entry.lang]}><Example example={example} first={entry.lang} second={translation} /></dd>)}
            </div>
          ))}
        </dl>
      </details>
      <details className="card-details">
        <summary>Ponte a prueba ({entry.quiz.length} preguntas)</summary>
        <Quiz entry={entry} />
      </details>
    </article>
  )
}
