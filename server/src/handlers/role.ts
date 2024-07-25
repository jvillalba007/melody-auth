import { Context } from 'hono'
import { typeConfig } from 'configs'
import { roleService } from 'services'
import { roleDto } from 'dtos'
import { validateUtil } from 'utils'

export const getRoles = async (c: Context<typeConfig.Context>) => {
  const includeDeleted = c.req.query('include_disabled') === 'true'
  const roles = await roleService.getRoles(
    c,
    includeDeleted,
  )
  return c.json({ roles })
}

export const getRole = async (c: Context<typeConfig.Context>) => {
  const includeDeleted = c.req.query('include_disabled') === 'true'
  const id = Number(c.req.param('id'))
  const role = await roleService.getRoleById(
    c,
    id,
    includeDeleted,
  )
  return c.json({ role })
}

export const postRole = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new roleDto.PostRoleReqDto({ name: String(reqBody.name) })
  await validateUtil.dto(bodyDto)

  const role = await roleService.createRole(
    c,
    bodyDto,
  )

  return c.json({ role })
}

export const putRole = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const id = Number(c.req.param('id'))

  const bodyDto = new roleDto.PutRoleReqDto({ name: String(reqBody.name) })
  await validateUtil.dto(bodyDto)

  const role = await roleService.updateRole(
    c,
    id,
    bodyDto,
  )

  return c.json({ role })
}