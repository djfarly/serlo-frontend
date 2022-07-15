import { faWarning } from '@fortawesome/free-solid-svg-icons'
import { getNodeId, isUiNodeInputAttributes } from '@ory/integrations/ui'
import {
  SelfServiceLoginFlow,
  SelfServiceRecoveryFlow,
  SelfServiceRegistrationFlow,
  SubmitSelfServiceLoginFlowBody,
  SubmitSelfServiceRecoveryFlowBody,
  SubmitSelfServiceRegistrationFlowBody,
} from '@ory/kratos-client'
import { AxiosError } from 'axios'
import { NextRouter } from 'next/router'
import { Dispatch, FormEvent, Fragment, SetStateAction, useState } from 'react'

import { StaticInfoPanel } from '../static-info-panel'
import { Node } from '@/components/auth/node'

export interface FlowProps<T extends SubmitPayload> {
  flow:
    | SelfServiceLoginFlow
    | SelfServiceRegistrationFlow
    | SelfServiceRecoveryFlow
  onSubmit: (values: T) => Promise<void>
}

export enum FlowType {
  login = 'login',
  registration = 'registration',
  settings = 'settings',
  recovery = 'recovery',
  verification = 'verification',
}

export type SubmitPayload =
  | SubmitSelfServiceLoginFlowBody
  | SubmitSelfServiceRegistrationFlowBody
  | SubmitSelfServiceRecoveryFlowBody

export function Flow<T extends SubmitPayload>(props: FlowProps<T>) {
  const { flow, onSubmit } = props

  const [isLoading, setIsLoading] = useState(false)
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const values: Record<string, unknown> = {}
    flow.ui.nodes.forEach((node) => {
      if (isUiNodeInputAttributes(node.attributes)) {
        if (
          node.attributes.type === 'hidden' ||
          node.attributes.type === 'submit' ||
          node.attributes.type === 'button'
        ) {
          values[getNodeId(node)] = node.attributes.value
        }
      }
    })
    return values
  })

  const { action, method, messages, nodes } = flow.ui

  // eslint-disable-next-line no-console
  console.log(messages)

  return (
    <form
      action={action}
      method={method}
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
    >
      {messages
        ? messages.map((message) => {
            return (
              <StaticInfoPanel key={message.id} type="warning" icon={faWarning}>
                {message.text}
              </StaticInfoPanel>
            )
          })
        : null}

      <div className="mx-side max-w-[18rem]">
        {nodes.map((node) => {
          const id = getNodeId(node)

          return (
            <Fragment key={id}>
              <Node
                node={node}
                disabled={isLoading}
                value={values[id]}
                onChange={(value) => {
                  setValues((values) => {
                    return {
                      ...values,
                      [id]: value,
                    }
                  })
                }}
                onSubmit={handleSubmit}
              />
            </Fragment>
          )
        })}
      </div>
    </form>
  )

  function handleSubmit(e: FormEvent | MouseEvent, method?: string) {
    e.stopPropagation()
    e.preventDefault()

    if (isLoading) return Promise.resolve()

    setIsLoading(true)

    return onSubmit({
      ...values,
      ...(method === undefined ? {} : { method }),
    } as T).finally(() => {
      setIsLoading(false)
    })
  }
}

// A small function to help us deal with errors coming from fetching a flow.
export function handleFlowError<S>(
  router: NextRouter,
  flowType: FlowType,
  resetFlow: Dispatch<SetStateAction<S | undefined>>
) {
  return async (error: AxiosError) => {
    const data = error.response?.data as {
      redirect_browser_to: string
      error: {
        id: string
      }
    }

    // at moment all flows are in the same folder. Ajust if they were moved somewhere else
    const flowPath = `/auth/${flowType}`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (data.error?.id) {
      case 'session_aal2_required':
        // 2FA is enabled and enforced, but user did not perform 2fa yet!
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        window.location.href = data.redirect_browser_to
        return
      case 'session_already_available':
        // User is already signed in, let's redirect them home!
        await router.push('/')
        return
      case 'session_refresh_required':
        // We need to re-authenticate to perform this action
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        window.location.href = data.redirect_browser_to
        return
      case 'self_service_flow_return_to_forbidden':
        // The flow expired, let's request a new one.
        // toast.error('The return_to address is not allowed.')
        resetFlow(undefined)
        await router.push(flowPath)
        return
      case 'self_service_flow_expired':
        // The flow expired, let's request a new one.
        // toast.error('Your interaction expired, please fill out the form again.')
        resetFlow(undefined)
        await router.push(flowPath)
        return
      case 'security_csrf_violation':
        // A CSRF violation occurred. Best to just refresh the flow!
        // toast.error(
        //   'A security violation was detected, please fill out the form again.'
        // )
        resetFlow(undefined)
        await router.push(flowPath)
        return
      case 'security_identity_mismatch':
        // The requested item was intended for someone else. Let's request a new flow...
        resetFlow(undefined)
        await router.push(flowPath)
        return
      case 'browser_location_change_required':
        // Ory Kratos asked us to point the user to this URL.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        window.location.href = data.redirect_browser_to
        return
    }

    switch (error.response?.status) {
      case 410:
        // The flow expired, let's request a new one.
        resetFlow(undefined)
        await router.push(flowPath)
        return
    }

    // We are not able to handle the error? Return it.
    return Promise.reject(error)
  }
}
