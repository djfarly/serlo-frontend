import React from 'react'

import { InstanceData } from '@/data-types'

export const InstanceDataContext = React.createContext<InstanceData | null>(
  null
)

export const InstanceDataProvider = InstanceDataContext.Provider

export function useInstanceData() {
  return React.useContext(InstanceDataContext)!
}
