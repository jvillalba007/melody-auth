import { dbConfig } from 'configs'
import { timeUtil } from 'utils'

export interface Record {
  id: number;
  authId: string;
  email: string | null;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: number;
  emailVerificationCode: string | null;
  emailVerificationCodeExpiresOn: number | null;
  passwordResetCode: string | null;
  passwordResetCodeExpiresOn: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiRecord {
  id: number;
  authId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified: boolean;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  authId: string;
  email: string | null;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface Update {
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  deletedAt?: string | null;
  updatedAt?: string | null;
  emailVerified?: number;
  emailVerificationCode?: string | null;
  emailVerificationCodeExpiresOn?: number | null;
  passwordResetCode?: string | null;
  passwordResetCodeExpiresOn?: number | null;
}

const TableName = dbConfig.TableName.User

export const convertToApiRecord = (
  record: Record,
  enabledNames: boolean,
  roles: string[] | null,
): ApiRecord => {
  const result: ApiRecord = {
    id: record.id,
    authId: record.authId,
    email: record.email,
    emailVerified: !!record.emailVerified,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  }
  if (roles) result.roles = roles
  if (enabledNames) {
    result.firstName = record.firstName
    result.lastName = record.lastName
  }
  return result
}

export const getAll = async (
  db: D1Database, includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName}`
  if (!includeDeleted) query = `${query} WHERE deletedAt IS NULL`
  const stmt = db.prepare(query)
  const { results: users }: { results: Record[] } = await stmt.all()
  return users
}

export const getById = async (
  db: D1Database,
  id: number,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE id = $1 AND deletedAt IS NULL`)
    .bind(id)
  const user = await stmt.first() as Record | null
  return user
}

export const getByAuthId = async (
  db: D1Database,
  authId: string,
  includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName} WHERE authId = $1`
  if (!includeDeleted) query = `${query} AND deletedAt IS NULL`
  const stmt = db.prepare(query)
    .bind(authId)
  const user = await stmt.first() as Record | null
  return user
}

export const getByEmailAndPassword = async (
  db: D1Database, email: string, password: string,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE email = $1 AND password = $2 AND deletedAt IS NULL`)
    .bind(
      email,
      password,
    )
  const user = await stmt.first() as Record | null
  return user
}

export const getByEmail = async (
  db: D1Database, email: string, includeDeleted = false,
) => {
  let query = `SELECT * FROM ${TableName} WHERE email = $1`
  if (!includeDeleted) query = `${query} AND deletedAt IS NULL`
  const stmt = db.prepare(query)
    .bind(email)
  const user = await stmt.first() as Record | null
  return user
}

export const create = async (
  db: D1Database, create: Create,
) => {
  const createKeys: (keyof Create)[] = ['authId', 'email', 'password', 'firstName', 'lastName']
  const createValues: string[] = []
  const createBinds: (string | null)[] = []
  createKeys.forEach((
    key, index,
  ) => {
    createValues.push(`$${index + 1}`)
    createBinds.push(create[key])
  })
  const query = `INSERT INTO ${TableName} (${createKeys.join(',')}) values (${createValues.join(',')})`

  const stmt = db.prepare(query).bind(...createBinds)
  const result = await stmt.run()
  if (!result.success) return null
  const id = result.meta.last_row_id
  return getById(
    db,
    id,
  )
}

export const update = async (
  db: D1Database, id: number, update: Update,
) => {
  const setQueries: string[] = []
  const binds = []

  const parsedUpdate = {
    ...update,
    updatedAt: timeUtil.getDbCurrentTime(),
  }
  const updateKeys: (keyof Update)[] = [
    'password', 'firstName', 'lastName', 'deletedAt', 'updatedAt',
    'emailVerified', 'emailVerificationCode', 'emailVerificationCodeExpiresOn',
    'passwordResetCode', 'passwordResetCodeExpiresOn',
  ]
  updateKeys.forEach((key) => {
    const value = parsedUpdate[key]
    if (value === undefined) return
    setQueries.push(`${key} = $${setQueries.length + 1}`)
    binds.push(value)
  })

  binds.push(id)
  const query = `UPDATE ${TableName} set ${setQueries.join(',')} where id = $${setQueries.length + 1}`
  const stmt = db.prepare(query).bind(...binds)

  const result = await stmt.run()
  if (!result.success) return null
  return getById(
    db,
    id,
  )
}