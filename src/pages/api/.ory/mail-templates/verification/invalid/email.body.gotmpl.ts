import { NextApiRequest, NextApiResponse } from 'next'

const template = `Hi,

someone asked to verify this email address, but we were unable to find an account for this address.

If this was you, check if you signed up using a different address.

If this was not you, please ignore this email.`

export default function de(_req: NextApiRequest, res: NextApiResponse) {
  res.send(template)
}
