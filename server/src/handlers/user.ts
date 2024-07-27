import { Context } from 'hono'
import {
  errorConfig, localeConfig, typeConfig,
} from 'configs'
import { userService } from 'services'
import { userDto } from 'dtos'
import { validateUtil } from 'utils'

export const getUsers = async (c: Context<typeConfig.Context>) => {
  const users = await userService.getUsers(c)
  return c.json({ users })
}

export const getUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )
  return c.json({ user })
}

export const verifyEmail = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  if (user.emailVerified) throw new errorConfig.Forbidden(localeConfig.Error.EmailAlreadyVerified)

  await userService.sendEmailVerification(
    c,
    user,
  )
  return c.json({ success: true })
}

export const updateRoles = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  const reqBody = await c.req.json()

  const bodyDto = new userDto.PutUserRolesReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  await userService.updateRoles(
    c,
    authId,
    bodyDto.roles,
  )
  return c.json({ success: true })
}
