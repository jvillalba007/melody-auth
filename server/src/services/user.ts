import { Context } from 'hono'
import { env } from 'hono/adapter'
import { GetUserInfoRes } from 'shared'
import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { Forbidden } from 'configs/error'
import {
  identityDto, userDto,
} from 'dtos'
import {
  PostAuthorizeReqWithNamesDto, PostAuthorizeReqWithPasswordDto,
} from 'dtos/identity'
import {
  roleModel, userModel, userRoleModel,
} from 'models'
import {
  emailService, kvService, roleService,
} from 'services'
import {
  cryptoUtil, timeUtil,
} from 'utils'

export const getUserInfo = async (
  c: Context<typeConfig.Context>, authId: string,
): Promise<GetUserInfoRes> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const roles = await roleService.getUserRoles(
    c,
    user.id,
  )

  const result: GetUserInfoRes = {
    authId: user.authId,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    emailVerified: !!user.emailVerified,
    roles,
  }

  const { ENABLE_NAMES: enableNames } = env(c)
  if (enableNames) {
    result.firstName = user.firstName
    result.lastName = user.lastName
  }

  return result
}

export const getUsers = async (c: Context<typeConfig.Context>): Promise<userModel.ApiRecord[]> => {
  const users = await userModel.getAll(c.env.DB)

  const { ENABLE_NAMES: enableNames } = env(c)

  const result = users.map((user) => userModel.convertToApiRecord(
    user,
    enableNames,
  ))
  return result
}

export const getUserByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<userModel.ApiRecordWithRoles> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const { ENABLE_NAMES: enableNames } = env(c)

  const roles = await roleService.getUserRoles(
    c,
    user.id,
  )

  const result = userModel.convertToApiRecordWithRoles(
    user,
    enableNames,
    roles,
  )
  return result
}

export const verifyPasswordSignIn = async (
  c: Context<typeConfig.Context>,
  bodyDto: PostAuthorizeReqWithPasswordDto,
): Promise<userModel.Record> => {
  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }

  if (!user.password || !cryptoUtil.bcryptCompare(
    bodyDto.password,
    user.password,
  )) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }

  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }
  return user
}

export const createAccountWithPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: PostAuthorizeReqWithNamesDto,
): Promise<userModel.Record> => {
  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
  )

  if (user) throw new Forbidden(localeConfig.Error.EmailTaken)

  const password = await cryptoUtil.bcryptText(bodyDto.password)

  const newUser = await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: bodyDto.email,
      password,
      firstName: bodyDto.firstName,
      lastName: bodyDto.lastName,
    },
  )

  return newUser
}

export const verifyUserEmail = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostVerifyEmailReqDto,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    bodyDto.id,
  )
  if (!user || user.emailVerified) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const isValid = await kvService.verifyEmailVerificationCode(
    c.env.KV,
    user.id,
    bodyDto.code,
  )
  if (!isValid) throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)

  await userModel.update(
    c.env.DB,
    user.id,
    { emailVerified: 1 },
  )

  return true
}

export const sendPasswordReset = async (
  c: Context<typeConfig.Context>,
  email: string,
): Promise<true> => {
  const user = await userModel.getByEmail(
    c.env.DB,
    email,
  )
  if (!user || !user.isActive) return true

  const resetCode = await emailService.sendPasswordReset(
    c,
    user,
  )

  if (resetCode) {
    await kvService.storePasswordResetCode(
      c.env.KV,
      user.id,
      resetCode,
    )
  }

  return true
}

export const resetUserPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostAuthorizeResetReqDto,
): Promise<true> => {
  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const isValid = await kvService.verifyPasswordResetCode(
    c.env.KV,
    user.id,
    bodyDto.code,
  )

  if (!isValid) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }

  const password = await cryptoUtil.bcryptText(bodyDto.password)
  await userModel.update(
    c.env.DB,
    user.id,
    { password },
  )
  return true
}

export const increaseLoginCount = async (
  c: Context<typeConfig.Context>,
  userId: number,
) => {
  await userModel.updateCount(
    c.env.DB,
    userId,
  )
  return true
}

export const updateUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
  dto: userDto.PutUserReqDto,
): Promise<userModel.ApiRecordWithRoles> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )

  if (!user) throw new errorConfig.NotFound()

  const updateObj: userModel.Update = {
    firstName: dto.firstName,
    lastName: dto.lastName,
  }
  if (dto.isActive !== undefined) updateObj.isActive = dto.isActive ? 1 : 0

  const updatedUser = Object.keys(updateObj).length
    ? await userModel.update(
      c.env.DB,
      user.id,
      updateObj,
    )
    : user

  const { ENABLE_NAMES: enableNames } = env(c)

  const userRoles = await userRoleModel.getAllByUserId(
    c.env.DB,
    user.id,
  )

  if (dto.roles && userRoles) {
    const allRoles = await roleModel.getAll(c.env.DB)
    const targetRoles = allRoles.filter((role) => !!dto.roles?.includes(role.name))

    const recordsToDisable = userRoles.filter((userRole) => targetRoles.every((role) => role.id !== userRole.roleId))
    const recordsToCreate = targetRoles.filter((role) => userRoles.every((userRole) => userRole.roleId !== role.id))

    const currentTime = timeUtil.getDbCurrentTime()
    for (const recordToDisable of recordsToDisable) {
      await userRoleModel.update(
        c.env.DB,
        recordToDisable.id,
        { deletedAt: currentTime },
      )
    }

    for (const recordToCreate of recordsToCreate) {
      await userRoleModel.create(
        c.env.DB,
        {
          userId: user.id, roleId: recordToCreate.id,
        },
      )
    }
  }

  const roleNames = dto.roles ?? (userRoles).map((userRole) => userRole.roleName)

  return userModel.convertToApiRecordWithRoles(
    updatedUser,
    enableNames,
    roleNames,
  )
}
