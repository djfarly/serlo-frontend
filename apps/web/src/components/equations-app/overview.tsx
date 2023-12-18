import { faCheck, faPlay } from '@fortawesome/free-solid-svg-icons'

import { ReadonlyMathField } from './readonly-math-field'
import { FaIcon } from '../fa-icon'
import { linearEquationData } from '@/data/de/gleichungs-app'
import { cn } from '@/helper/cn'

interface OverviewProps {
  selectLevel: (n: number) => void
  solved: number[]
}

export function Overview({ selectLevel, solved }: OverviewProps) {
  return (
    <div>
      <h2 className="mb-6 mt-8 text-center text-2xl font-bold mobileExt:mb-8 mobileExt:mt-12">
        Lineare Gleichungen
      </h2>
      {linearEquationData.levels.map((level) => (
        <div key={level.number}>
          <h3 className="mb-4 mt-8 text-xl font-bold">
            Level {level.number} - {level.heading}
          </h3>
          {level.tasks.map((t) => (
            <div
              key={t.number}
              className="my-5 flex items-baseline justify-start"
            >
              <span
                className={cn(
                  'mr-3 inline-block flex h-6 w-6 items-center justify-center rounded-full',
                  t.isGolden ? 'bg-yellow-400' : 'bg-gray-200'
                )}
              >
                <span>{t.number}</span>
              </span>
              <span className="text-xl">
                <ReadonlyMathField value={t.latex} />
              </span>
              {solved.includes(t.number) && (
                <span className="ml-2 text-green-500">
                  <FaIcon icon={faCheck} />
                </span>
              )}
              <span className="flex-grow"></span>
              <span>
                <button
                  className="rounded bg-green-200 bg-green-300 px-3 py-1"
                  onClick={() => {
                    selectLevel(t.number)
                  }}
                >
                  <FaIcon icon={faPlay} />
                </button>
              </span>
            </div>
          ))}
        </div>
      ))}
      <div className="mt-12 rounded bg-gray-100 p-2">
        Diese App befindet sich in Entwicklung.
        <br />
        <a
          href="https://forms.gle/PFUYn8fn5zAkzpqe8"
          target="_blank"
          rel="noreferrer"
          className="serlo-link"
        >
          Wir freuen uns über dein Feedback
        </a>
        .
      </div>
    </div>
  )
}
