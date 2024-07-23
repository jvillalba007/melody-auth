import {
  ClientType, Scope,
} from 'shared'
import {
  PostTokenByAuthCode, PostTokenByClientCredentials, PostTokenByRefreshToken,
} from '../../../global'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService,
  consentService,
  jwtService, kvService, roleService, sessionService, userService,
} from 'services'
import {
  cryptoUtil, formatUtil, timeUtil,
} from 'utils'
import { authMiddleware } from 'middlewares'
import {
  getAuthorizeReqHandler, logoutReqHandler, postTokenReqHandler,
} from 'handlers'

const BaseRoute = routeConfig.InternalRoute.OAuth

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize`,
    async (c) => {
      const queryDto = await getAuthorizeReqHandler.parse(c)

      const stored = sessionService.getAuthInfoSession(
        c,
        queryDto.clientId,
      )
      if (stored && stored.request.clientId === queryDto.clientId) {
        const { authCode } = await jwtService.genAuthCode(
          c,
          timeUtil.getCurrentTimestamp(),
          stored.appId,
          queryDto,
          stored.user,
        )

        const url = `${queryDto.redirectUri}?code=${authCode}&state=${queryDto.state}`
        return c.redirect(url)
      }

      const queryString = formatUtil.getQueryString(c)
      return c.redirect(`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`)
    },
  )

  app.post(
    `${BaseRoute}/token`,
    authMiddleware.s2sBasicAuth,
    async (c) => {
      const reqBody = await c.req.parseBody()

      const grantType = String(reqBody.grant_type).toLowerCase()
      const currentTimestamp = timeUtil.getCurrentTimestamp()

      if (grantType === oauthDto.TokenGrantType.AuthorizationCode) {
        const bodyDto = await postTokenReqHandler.parseAuthCode(c)

        const authInfo = await jwtService.getAuthCodeBody(
          c,
          bodyDto.code,
        )

        const isValidChallenge = await cryptoUtil.isValidCodeChallenge(
          bodyDto.codeVerifier,
          authInfo.request.codeChallenge,
          authInfo.request.codeChallengeMethod,
        )
        if (!isValidChallenge) {
          throw new errorConfig.Forbidden(localeConfig.Error.WrongCodeVerifier)
        }

        const requireConsent = await consentService.shouldCollectConsent(
          c,
          authInfo.user.id,
          authInfo.appId,
        )
        if (requireConsent) throw new errorConfig.UnAuthorized(localeConfig.Error.NoConsent)

        const userRoles = await roleService.getUserRoles(
          c,
          authInfo.user.id,
        )
        const authId = authInfo.user.authId
        const scope = authInfo.request.scopes.join(' ')

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          ClientType.SPA,
          currentTimestamp,
          authId,
          scope,
          userRoles,
        )

        const result: PostTokenByAuthCode = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          not_before: currentTimestamp,
          token_type: 'Bearer',
          scope: authInfo.request.scopes.join(' '),
        }

        if (authInfo.request.scopes.includes(Scope.OfflineAccess)) {
          const {
            refreshToken,
            refreshTokenExpiresIn,
            refreshTokenExpiresAt,
          } = await jwtService.genRefreshToken(
            c,
            currentTimestamp,
            authId,
            authInfo.request.clientId,
            scope,
            userRoles,
          )
          result.refresh_token = refreshToken
          result.refresh_token_expires_in = refreshTokenExpiresIn
          result.refresh_token_expires_on = refreshTokenExpiresAt

          await kvService.storeRefreshToken(
            c.env.KV,
            refreshToken,
            refreshTokenExpiresIn,
          )
        }

        if (authInfo.request.scopes.includes(Scope.OpenId)) {
          const { idToken } = await jwtService.genIdToken(
            c,
            currentTimestamp,
            authInfo,
            userRoles,
          )
          result.id_token = idToken
        }

        return c.json(result)
      } else if (grantType === oauthDto.TokenGrantType.RefreshToken) {
        const bodyDto = await postTokenReqHandler.parseRefreshToken(c)

        await kvService.validateRefreshToken(
          c.env.KV,
          bodyDto.refreshToken,
        )

        const refreshTokenBody = await jwtService.getRefreshTokenBody(
          c,
          bodyDto.refreshToken,
        )

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          ClientType.SPA,
          currentTimestamp,
          refreshTokenBody.sub,
          refreshTokenBody.scope,
          refreshTokenBody.roles,
        )

        const result: PostTokenByRefreshToken = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          token_type: 'Bearer',
        }

        return c.json(result)
      } else if (grantType === oauthDto.TokenGrantType.ClientCredentials) {
        const basicAuth = c.get('basic_auth_body')!
        const bodyDto = await postTokenReqHandler.parseClientCredentials(c)

        const app = await appService.verifyS2SClientRequest(
          c,
          basicAuth.username,
          basicAuth.password,
        )

        const validScopes = formatUtil.getValidScopes(
          bodyDto.scopes,
          app,
        )

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          ClientType.S2S,
          currentTimestamp,
          basicAuth.username,
          validScopes.join(' '),
        )

        const result: PostTokenByClientCredentials = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          token_type: 'Bearer',
          scope: validScopes.join(' '),
        }

        return c.json(result)
      } else {
        throw new errorConfig.Forbidden(localeConfig.Error.WrongGrantType)
      }
    },
  )

  app.get(
    `${BaseRoute}/logout`,
    async (c) => {
      const queryDto = await logoutReqHandler.parseGet(c)

      sessionService.removeAuthInfoSession(
        c,
        queryDto.clientId,
      )

      return c.redirect(queryDto.postLogoutRedirectUri)
    },
  )

  app.get(
    `${BaseRoute}/userinfo`,
    authMiddleware.spaProfile,
    async (c) => {
      const accessTokenBody = c.get('access_token_body')!

      const user = await userService.getUserInfo(
        c,
        accessTokenBody.sub,
      )

      return c.json(user)
    },
  )
}