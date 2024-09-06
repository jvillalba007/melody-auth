import { sendS2SRequest } from 'app/api/request'

type Params = {
  authId: string;
}

export async function POST (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId

  return sendS2SRequest({
    method: 'POST',
    uri: `/api/v1/users/${authId}/otp-mfa`,
  })
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/otp-mfa`,
  })
}