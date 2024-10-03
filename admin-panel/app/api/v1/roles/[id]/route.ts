import {
  sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'

type Params = {
  id: string;
}

export async function GET (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/roles/${id}`,
  })
}

export async function PUT (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  const reqBody = await request.json()
  console.log(reqBody)
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'PUT',
    uri: `/api/v1/roles/${id}`,
    body: JSON.stringify(reqBody),
  })
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/roles/${id}`,
  })
}