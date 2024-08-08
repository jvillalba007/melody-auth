import { Context } from 'hono'
import {
  errorConfig, localeConfig, typeConfig,
} from 'configs'
import {
  consentService,
  emailService, kvService, userService,
} from 'services'
import { userDto } from 'dtos'
import { validateUtil } from 'utils'
import { PaginationDto } from 'dtos/common'

export const getUsers = async (c: Context<typeConfig.Context>) => {
  const {
    page_size: pageSize, page_number: pageNumber,
  } = c.req.query()
  const pagination = pageSize && pageNumber
    ? new PaginationDto({
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
    })
    : undefined

  const result = await userService.getUsers(
    c,
    pagination,
  )
  return c.json(result)
}

export const getUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserDetailByAuthId(
    c,
    authId,
  )
  return c.json({ user })
}

export const getUserAppConsents = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const consentedApps = await consentService.getUserConsentedApps(
    c,
    user.id,
  )
  return c.json({ consentedApps })
}

export const deleteUserAppConsent = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const appId = c.req.param('appId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )
  await consentService.deleteUserAppConsent(
    c,
    user.id,
    Number(appId),
  )

  c.status(204)
  return c.body(null)
}

export const verifyEmail = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  if (user.emailVerified) throw new errorConfig.Forbidden(localeConfig.Error.EmailAlreadyVerified)

  const verificationCode = await emailService.sendEmailVerification(
    c,
    user,
  )
  if (verificationCode) {
    await kvService.storeEmailVerificationCode(
      c.env.KV,
      user.id,
      verificationCode,
    )
  }

  return c.json({ success: true })
}

export const putUser = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const bodyDto = new userDto.PutUserReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authId = c.req.param('authId')

  const user = await userService.updateUser(
    c,
    authId,
    bodyDto,
  )
  return c.json({ user })
}

export const deleteUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.deleteUser(
    c,
    authId,
  )

  c.status(204)
  return c.body(null)
}