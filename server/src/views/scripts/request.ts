import { html } from 'hono/html'
import { oauthDto } from 'dtos'

export const parseAuthorizeFieldValues = (queryDto: oauthDto.GetAuthorizeReqDto) => html`
  email: document.getElementById('form-email').value,
  password: document.getElementById('form-password').value,
  clientId: "${queryDto.clientId}",
  redirectUri: "${queryDto.redirectUri}",
  responseType: "${queryDto.responseType}",
  state: "${queryDto.state}",
  codeChallenge: "${queryDto.codeChallenge}",
  codeChallengeMethod: "${queryDto.codeChallengeMethod}",
  locale: "${queryDto.locale}",
  scope: "${queryDto.scopes.join(' ')}"
`
