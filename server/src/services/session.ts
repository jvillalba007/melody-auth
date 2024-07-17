import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { oauthDto } from 'dtos'
import { userModel } from 'models'
import {
  formatUtil, timeUtil,
} from 'utils'

export const setAuthInfoSession = (
  c: Context<typeConfig.Context>,
  appId: number,
  user: userModel.Record,
  request: oauthDto.GetAuthorizeReqQueryDto,
) => {
  const { SERVER_SESSION_EXPIRES_IN: sessionExpiresIn } = env(c)
  if (sessionExpiresIn) {
    const session = c.get('session')
    const key = formatUtil.getAuthInfoSessionKeyByClientId(request.clientId)
    session.set(
      key,
      {
        appId,
        user,
        request,
        expiresOn: timeUtil.getCurrentTimestamp() + sessionExpiresIn,
      },
    )
  }
}

export const getAuthInfoSession = (
  c: Context<typeConfig.Context>, clientId: string,
) => {
  const { SERVER_SESSION_EXPIRES_IN: sessionExpiresIn } = env(c)
  if (sessionExpiresIn) {
    const session = c.get('session')
    const key = formatUtil.getAuthInfoSessionKeyByClientId(clientId)
    const stored = session.get(key) as {
      appId: number;
      user: userModel.Record;
      request: oauthDto.GetAuthorizeReqQueryDto;
      expiresOn: number;
    }
    if (!stored || timeUtil.getCurrentTimestamp() > stored.expiresOn) return null

    return stored
  }
  return null
}

export const removeAuthInfoSession = (
  c: Context<typeConfig.Context>, clientId: string,
) => {
  const { SERVER_SESSION_EXPIRES_IN: sessionExpiresIn } = env(c)
  if (sessionExpiresIn) {
    const session = c.get('session')
    const key = formatUtil.getAuthInfoSessionKeyByClientId(clientId)
    session.set(
      key,
      null,
    )
  }
}
