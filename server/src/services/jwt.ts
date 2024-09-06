import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  verify, decode,
} from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import {
  ClientType, IdTokenBody,
} from 'shared'
import { SignatureKey } from 'hono/utils/jwt/jws'
import {
  errorConfig, typeConfig,
} from 'configs'
import { kvService } from 'services'
import { cryptoUtil } from 'utils'

const base64UrlEncode = (data: string) => btoa(data)
  .replace(
    /\+/g,
    '-',
  )
  .replace(
    /\//g,
    '_',
  )
  .replace(
    /=+$/,
    '',
  )

const decodeBase64 = (str: string): Uint8Array => {
  const binary = atob(str)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  const half = binary.length / 2
  for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
    bytes[i] = binary.charCodeAt(i)
    bytes[j] = binary.charCodeAt(j)
  }
  return bytes
}

const pemToBinary = (pem: string): Uint8Array => {
  return decodeBase64(pem.replace(
    /-+(BEGIN|END).*/g,
    '',
  ).replace(
    /\s/g,
    '',
  ))
}

export const signWithKid = async (
  c: Context<typeConfig.Context>, payload: object,
) => {
  const privateKey = await kvService.getJwtPrivateSecret(c.env.KV)
  const publicKey = await kvService.getJwtPublicSecret(c.env.KV)
  const jwk = await cryptoUtil.secretToJwk(publicKey)

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBinary(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign'],
  )

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: jwk.kid,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const encoder = new TextEncoder()
  const signingInputBytes = encoder.encode(signingInput)

  const signature = await crypto.subtle.sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    key,
    signingInputBytes,
  )

  // Step 5: Base64URL encode the signature
  const signatureArray = new Uint8Array(signature)
  const signatureBase64Url = base64UrlEncode(String.fromCharCode(...signatureArray))

  // Step 6: Combine the parts to form the final JWT
  const jwt = `${signingInput}.${signatureBase64Url}`

  return jwt
}

export const getAccessTokenBody = async (
  context: Context<typeConfig.Context>,
  accessToken: string,
) => {
  const publicSecret = await kvService.getJwtPublicSecret(context.env.KV)

  let accessTokenBody: typeConfig.AccessTokenBody
  try {
    accessTokenBody = await verify(
      accessToken,
      publicSecret,
      'RS256',
    ) as unknown as typeConfig.AccessTokenBody
  } catch (e) {
    throw new errorConfig.UnAuthorized()
  }

  return accessTokenBody
}

export const genAccessToken = async (
  c: Context<typeConfig.Context>,
  type: ClientType,
  currentTimestamp: number,
  sub: string,
  azp: string,
  scope: string,
  roles?: string[] | null,
) => {
  const {
    SPA_ACCESS_TOKEN_EXPIRES_IN,
    S2S_ACCESS_TOKEN_EXPIRES_IN,
  } = env(c)

  const isSpa = type === ClientType.SPA
  const accessTokenExpiresIn = isSpa
    ? SPA_ACCESS_TOKEN_EXPIRES_IN
    : S2S_ACCESS_TOKEN_EXPIRES_IN
  const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
  const accessTokenBody: typeConfig.AccessTokenBody = {
    sub,
    azp,
    scope,
    iat: currentTimestamp,
    exp: accessTokenExpiresAt,
  }
  if (roles) accessTokenBody.roles = roles

  const accessToken = await signWithKid(
    c,
    accessTokenBody as unknown as JWTPayload,
  )
  return {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  }
}

export const genIdToken = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  authInfo: typeConfig.AuthCodeBody,
  roles: string[],
) => {
  const {
    ID_TOKEN_EXPIRES_IN: idTokenExpiresIn,
    AUTH_SERVER_URL: authServerUrl,
  } = env(c)
  const idTokenExpiresAt = currentTimestamp + idTokenExpiresIn
  const body: IdTokenBody = {
    iss: authServerUrl,
    sub: authInfo.user.authId,
    azp: authInfo.request.clientId,
    exp: idTokenExpiresAt,
    iat: currentTimestamp,
    email: authInfo.user.email,
    locale: authInfo.user.locale,
    first_name: authInfo.user.firstName,
    last_name: authInfo.user.lastName,
  }
  body.roles = roles

  const idToken = await signWithKid(
    c,
    body as unknown as JWTPayload,
  )
  return { idToken }
}

export interface GoogleUser {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  id: string;
}

export const verifyGoogleCredential = async (credential: string) => {
  const decoded = decode(credential)
  const header = decoded.header as unknown as { kid: string }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  const certs = await response.json() as { keys: { kid: string }[] }
  const publicKey = certs.keys.find((key) => key.kid === header.kid)
  const result = await verify(
    credential,
    publicKey as unknown as SignatureKey,
    'RS256',
  )
  if ('iss' in result && result.iss === 'https://accounts.google.com' && 'email' in result) {
    const user = {
      firstName: result.given_name,
      lastName: result.family_name,
      email: result.email,
      emailVerified: result.email_verified,
      id: result.sub,
    } as GoogleUser
    return user
  }

  return undefined
}
