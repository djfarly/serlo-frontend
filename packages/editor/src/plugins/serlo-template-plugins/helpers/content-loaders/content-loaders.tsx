import { UuidType } from '@serlo/frontend/src/data-types'

import { ExternalRevisionLoader } from './external-revision-loader'
import { RevisionHistoryLoader } from './revision-history-loader'

interface ContentLoadersProps {
  id: number
  currentRevision: number
  entityType: UuidType
  onSwitchRevision: (data: any) => void
}

export function ContentLoaders({
  id,
  currentRevision,
  entityType,
  onSwitchRevision,
}: ContentLoadersProps) {
  return id ? (
    <RevisionHistoryLoader
      id={id}
      currentRevision={currentRevision}
      onSwitchRevision={onSwitchRevision}
    />
  ) : (
    <ExternalRevisionLoader
      entityType={entityType}
      onSwitchRevision={onSwitchRevision}
    />
  )
}
