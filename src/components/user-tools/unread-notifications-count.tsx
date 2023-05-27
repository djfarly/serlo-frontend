import clsx from 'clsx'
import { gql } from 'graphql-request'

import { FaIcon, FaIconProps } from '../fa-icon'
import { useGraphqlSwrWithAuth } from '@/api/use-graphql-swr'

export interface UnreadNotificationsCountProps {
  icon?: FaIconProps['icon']
  onlyNumber?: boolean
}

export function UnreadNotificationsCount({
  icon,
  onlyNumber,
}: UnreadNotificationsCountProps) {
  const { data } = useGraphqlSwrWithAuth<{
    notifications: {
      totalCount: number
    }
  }>({
    query: gql`
      {
        notifications(unread: true) {
          totalCount
        }
      }
    `,
    config: {
      refreshInterval: 60 * 1000, // seconds
    },
  })

  const count = data === undefined ? 0 : data.notifications.totalCount
  const displayCount = count > 9 ? '+' : count

  if (onlyNumber) return <>{data === undefined ? '…' : count}</>

  return (
    <span
      className={clsx(
        'relative inline-block h-[1em] w-5',
        count > 0 && 'text-brand',
        'notification-count-span'
      )}
    >
      {icon && (
        <FaIcon
          icon={icon}
          className="absolute inset-0 h-6 w-5 group-hover:text-white group-active:text-white"
        />
      )}
      <span
        className={clsx(
          'absolute mt-0.25 block text-sm text-white',
          'z-50 w-5 text-center',
          'transition-all group-hover:text-brand group-active:text-brand'
        )}
      >
        {displayCount}
      </span>
    </span>
  )
}
