import { tw } from '@/helper/tw'

const roadmapData = [
  {
    title: 'Latest Releases',
    steps: [
      'Table plugin',
      'Math equations plugin',
      'Highlighting box plugin',
      'Improved plugin selection menu',
      'Helpful tooltips that open directly on hover',
      'Integrate H5P elements in Serlo Editor content',
      'Custom search to link to other Serlo entities',
    ],
  },
  {
    title: 'Next up',
    steps: [
      'Duplicate existing entities',
      'Redesigned plugin toolbar',
      'Migrations from old to new versions of the Serlo Editor data format',
      'Accessibility improvements for pictures',
      'Easily link to sections of any Serlo entity through URL',
    ],
  },
  {
    title: 'Soon',
    steps: [
      'Differentiate between new paragraph and new lines',
      'Add plugins within paragraphs',
      'Improved focus management',
      'Better keyboard navigation',
      'Impact dashboard – supporting authors with usage data',
    ],
  },
  {
    title: 'Later',
    steps: [
      'Fill-in-the-gap exercise (new plugin)',
      'Drag & Drop exercise (new plugin)',
      'Better support for LMS integrations',
      'Copy & Paste content across plugins',
      'Automated OER license management',
    ],
  },
]

export function EditorRoadmap() {
  return (
    <div className="text-center text-xl sm:flex">
      {roadmapData.map(({ title, steps }, colIndex) => {
        return (
          <div key={title} className="mt-8 flex-1 px-3">
            <h3 className="mb-4 font-handwritten text-3xl text-brand">
              {title}
            </h3>
            <ul className="">
              {steps.map((title) => {
                return (
                  <li
                    key={title}
                    className={tw`
                      mx-auto mb-3 block w-fit rounded-xl px-2 py-1
                      text-base leading-6
                      shadow-menu transition-colors sm:mx-0
                      sm:w-auto
                    `}
                  >
                    {title}
                  </li>
                )
              })}
            </ul>
            {colIndex === 0 ? (
              <img
                src="/_assets/img/jobs/impact.svg"
                className="my-5 mx-3 hidden opacity-75 sm:block"
                alt=""
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
