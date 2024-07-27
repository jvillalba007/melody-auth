import {
  useContext, useEffect,
  useRef,
} from 'react'
import { exchangeTokenByAuthCode } from 'web-sdk'
import { useAuth } from './useAuth'
import authContext, { AuthContext } from './context'

const Setup = () => {
  const { acquireToken } = useAuth()
  const context = useContext<AuthContext>(authContext)
  const {
    state, dispatch,
  } = context

  const initialized = useRef(false)

  useEffect(
    () => {
      if (initialized.current) return

      if (state.checkedStorage) initialized.current = true

      if (state.accessTokenStorage) return

      if (state.refreshTokenStorage && !state.accessTokenStorage) {
        acquireToken().catch(() => dispatch({
          type: 'setIsAuthenticating', payload: false,
        }))
        return
      }

      if (state.checkedStorage) {
        exchangeTokenByAuthCode(state.config)
          .then((res) => {
            if (res?.accessTokenStorage) {
              dispatch({
                type: 'setAccessTokenStorage', payload: res.accessTokenStorage,
              })
            } else {
              dispatch({
                type: 'setIsAuthenticating', payload: false,
              })
            }
            if (res?.refreshTokenStorage) {
              dispatch({
                type: 'setRefreshTokenStorage', payload: res.refreshTokenStorage,
              })
            }
          })
          .catch(() => {
            dispatch({
              type: 'setIsAuthenticating', payload: false,
            })
          })
      }
    },
    [dispatch, state.checkedStorage, state.accessTokenStorage, state.config, acquireToken, state.refreshTokenStorage],
  )

  return null
}

export default Setup
