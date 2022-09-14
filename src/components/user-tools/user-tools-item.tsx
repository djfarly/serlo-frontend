import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import clsx from 'clsx'
import { default as NextLink } from 'next/link'

import { FaIcon } from '../fa-icon'

export interface UserToolsItemProps {
  title: string
  href?: string
  onClick?: () => void
  icon: IconDefinition
  aboveContent?: boolean
}

const aboveClasses = clsx(
  'serlo-button-green',
  'text-sm m-0.5 ml-1 leading-browser'
)

const belowClasses = clsx(
  'serlo-button-green-transparent',
  'py-1 m-1 text-base leading-browser'
)

export function UserToolsItem({
  title,
  href,
  onClick,
  icon,
  aboveContent,
}: UserToolsItemProps) {
  const classes = aboveContent ? aboveClasses : belowClasses

  const inner = (
    <>
      <FaIcon icon={icon} className="lg:mr-0.5" /> {title}
    </>
  )

  if (href)
    return (
      <NavigationMenu.Item>
        <NextLink href={href} passHref>
          {renderLink()}
        </NextLink>
      </NavigationMenu.Item>
    )

  if (onClick)
    return (
      <NavigationMenu.Item onClick={onClick}>
        {renderLink()}
      </NavigationMenu.Item>
    )

  return <span className={classes}>{inner}</span>

  function renderLink() {
    return (
      <NavigationMenu.Link className={classes}>{inner}</NavigationMenu.Link>
    )
  }
}
