import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from 'shared'
import app from 'index'
import {
  migrate, mock,
} from 'tests/mock'
import { routeConfig } from 'configs'
import { oauthDto } from 'dtos'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = ''

describe(
  'get system info',
  () => {
    test(
      'should return system info',
      async () => {
        const res = await app.request(
          `${BaseRoute}/info`,
          {},
          mock(db),
        )
        const json = await res.json() as { configs: object }

        expect(json.configs).toStrictEqual({
          AUTHORIZATION_CODE_EXPIRES_IN: 300,
          SPA_ACCESS_TOKEN_EXPIRES_IN: 1800,
          SPA_REFRESH_TOKEN_EXPIRES_IN: 604800,
          S2S_ACCESS_TOKEN_EXPIRES_IN: 3600,
          ID_TOKEN_EXPIRES_IN: 1800,
          SERVER_SESSION_EXPIRES_IN: 1800,
          AUTH_SERVER_URL: 'http://localhost:8787',
          SUPPORTED_LOCALES: ['en', 'fr'],
          ENABLE_LOCALE_SELECTOR: true,
          COMPANY_LOGO_URL: 'https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg',
          GOOGLE_AUTH_CLIENT_ID: '',
          ENABLE_SIGN_UP: true,
          ENABLE_PASSWORD_RESET: true,
          PASSWORD_RESET_EMAIL_THRESHOLD: 5,
          ENABLE_NAMES: true,
          NAMES_IS_REQUIRED: false,
          ENABLE_USER_APP_CONSENT: true,
          ENFORCE_ONE_MFA_ENROLLMENT: true,
          ENABLE_EMAIL_VERIFICATION: true,
          EMAIL_MFA_IS_REQUIRED: false,
          OTP_MFA_IS_REQUIRED: false,
          ACCOUNT_LOCKOUT_THRESHOLD: 5,
          ACCOUNT_LOCKOUT_EXPIRES_IN: 86400,
          UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: true,
          ALLOW_EMAIL_MFA_AS_BACKUP: true,
          TERMS_LINK: '',
          PRIVACY_POLICY_LINK: '',
          ENABLE_EMAIL_LOG: false,
        })
      },
    )
  },
)

describe(
  'get openid config',
  () => {
    test(
      'should return openid config',
      async () => {
        const res = await app.request(
          `${BaseRoute}/.well-known/openid-configuration`,
          {},
          mock(db),
        )
        const json = await res.json() as { configs: object }

        const serverUrl = 'http://localhost:8787'
        const oauthRoot = `${serverUrl}${routeConfig.InternalRoute.OAuth}`
        expect(json).toStrictEqual({
          issuer: serverUrl,
          authorization_endpoint: `${oauthRoot}/authorize`,
          token_endpoint: `${oauthRoot}/token`,
          userinfo_endpoint: `${oauthRoot}/userinfo`,
          scopes_supported: Object.values(Scope),
          response_types_supported: ['code'],
          grant_types_supported: Object.values(oauthDto.TokenGrantType),
          token_endpoint_auth_methods_supported: ['client_secret_basic'],
          claims_supported: ['sub', 'email', 'first_name', 'last_name', 'locale'],
          id_token_signing_alg_values_supported: ['RS256'],
          jwks_uri: `${serverUrl}/.well-known/jwks.json`,
          code_challenge_methods_supported: ['plain', 'S256'],
        })
      },
    )
  },
)

describe(
  'get jwks',
  () => {
    test(
      'should return jwks',
      async () => {
        const res = await app.request(
          `${BaseRoute}/.well-known/jwks.json`,
          {},
          mock(db),
        )
        const json = await res.json() as { keys: any[] }

        expect(json.keys[0]).toStrictEqual({
          kty: 'RSA',
          n: expect.any(String),
          e: 'AQAB',
          alg: 'RS256',
          use: 'sig',
          kid: expect.any(String),
        })
      },
    )
  },
)

describe(
  'get swagger',
  () => {
    test(
      'should return swagger',
      async () => {
        const res = await app.request(
          `${BaseRoute}/api/v1/swagger`,
          {},
          mock(db),
        )
        const swagger = await res.text()
        expect(swagger).toContain('html')
      },
    )
  },
)
