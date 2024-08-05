import {
  sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'

export async function GET () {
  return sendS2SRequest({
    method: 'GET',
    uri: '/api/v1/roles',
  })
}

export async function POST (request: Request) {
  const reqBody = await request.json()
  if (!reqBody || !reqBody.data) return throwForbiddenError()

  return sendS2SRequest({
    method: 'POST',
    uri: '/api/v1/roles',
    body: JSON.stringify(reqBody.data),
  })
}
