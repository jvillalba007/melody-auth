'use client'

import { useAuth } from '@melody-auth/react'
import {
  Badge, Button, Card, Checkbox, Label, Table,
  TextInput,
  ToggleSwitch,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useCallback,
  useEffect, useMemo, useState,
} from 'react'
import UserEmailVerified from 'components/UserEmailVerified'
import {
  proxyTool, routeTool,
} from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import useSignalValue from 'app/useSignalValue'
import {
  userInfoSignal, configSignal,
} from 'signals'
import IsSelfLabel from 'components/IsSelfLabel'
import PageTitle from 'components/PageTitle'
import SubmitError from 'components/SubmitError'
import SaveButton from 'components/SaveButton'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'

const Page = () => {
  const { authId } = useParams()
  const configs = useSignalValue(configSignal)

  const t = useTranslations()
  const router = useLocaleRouter()

  const [user, setUser] = useState()
  const [roles, setRoles] = useState()
  const [firstName, setFirstName] = useState()
  const [lastName, setLastName] = useState()
  const [isActive, setIsActive] = useState()
  const [emailResent, setEmailResent] = useState(false)
  const [consentedApps, setConsentedApps] = useState([])
  const { acquireToken } = useAuth()
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const userInfo = useSignalValue(userInfoSignal)
  const enableConsent = configs.ENABLE_USER_APP_CONSENT

  const updateObj = useMemo(
    () => {
      if (!user) return {}
      const obj = {}
      if (userRoles !== user.roles) obj.roles = userRoles
      if (isActive !== user.isActive) obj.isActive = isActive
      if (firstName !== user.firstName) obj.firstName = firstName
      if (lastName !== user.lastName) obj.lastName = lastName
      return obj
    },
    [user, userRoles, isActive, firstName, lastName],
  )

  const isSelf = useMemo(
    () => userInfo.authId === user?.authId,
    [user, userInfo],
  )

  const handleDelete = async () => {
    const token = await acquireToken()
    setIsLoading(true)
    await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'DELETE',
      token,
    })
    router.push(routeTool.Internal.Users)
    setIsLoading(false)
  }

  const handleDeleteConsent = async (appId: number) => {
    const token = await acquireToken()
    setIsLoading(true)
    await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}/consented-apps/${appId}`,
      method: 'DELETE',
      token,
    })
    await getUserConsents()
    setIsLoading(false)
  }

  const getUserConsents = useCallback(
    async () => {
      if (!enableConsent) return
      const token = await acquireToken()
      const consentData = await proxyTool.sendNextRequest({
        endpoint: `/api/users/${authId}/consented-apps`,
        method: 'GET',
        token,
      })
      setConsentedApps(consentData.consentedApps)
    },
    [acquireToken, authId, enableConsent],
  )

  const getUser = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/users/${authId}`,
        method: 'GET',
        token,
      })
      setUser(data.user)
      setFirstName(data.user.firstName)
      setLastName(data.user.lastName)
      setIsActive(data.user.isActive)
      setUserRoles(data.user.roles)
    },
    [acquireToken, authId],
  )

  const handleSave = async () => {
    const token = await acquireToken()
    setIsLoading(true)
    const result = await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'PUT',
      token,
      body: { data: updateObj },
    })
    if (result) await getUser()
    setIsLoading(false)
  }

  const handleResendVerifyEmail = async () => {
    const token = await acquireToken()
    const result = await proxyTool.sendNextRequest({
      endpoint: `/api/users/${authId}`,
      method: 'POST',
      token,
      body: { action: 'verify-email' },
    })
    if (result) setEmailResent(true)
  }

  const handleToggleUserRole = (role: string) => {
    const newRoles = userRoles.includes(role)
      ? userRoles.filter((userRole) => role !== userRole)
      : [...userRoles, role]
    setUserRoles(newRoles)
  }

  useEffect(
    () => {
      const getRoles = async () => {
        const token = await acquireToken()
        const data = await proxyTool.getRoles(token)
        setRoles(data.roles)
      }

      getUser()
      getUserConsents()
      getRoles()
    },
    [getUser, acquireToken, getUserConsents],
  )

  if (!user) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('users.user')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
            <Table.HeadCell />
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('users.authId')}</Table.Cell>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {user.authId}
                  {isSelf && (
                    <IsSelfLabel />
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.email')}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.loginCount')}</Table.Cell>
              <Table.Cell>{user.loginCount}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('users.status')}</Table.Cell>
              <Table.Cell>
                {isSelf && <EntityStatusLabel isEnabled={user.isActive} />}
                {!isSelf && (
                  <ToggleSwitch
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                )}
              </Table.Cell>
            </Table.Row>
            {configs.ENABLE_EMAIL_VERIFICATION && (
              <Table.Row>
                <Table.Cell>{t('users.emailVerified')}</Table.Cell>
                <Table.Cell>
                  <UserEmailVerified user={user} />
                </Table.Cell>
                <Table.Cell>
                  {user.isActive && !user.emailVerified && !emailResent && (
                    <Button
                      size='xs'
                      onClick={handleResendVerifyEmail}>
                      {t('users.resend')}
                    </Button>
                  )}
                  {user.isActive && !user.emailVerified && emailResent && (
                    <div className='flex'>
                      <Badge>{t('users.sent')}</Badge>
                    </div>
                  )}
                </Table.Cell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.Cell>{t('users.roles')}</Table.Cell>
              <Table.Cell>
                <div className='flex items-center gap-6'>
                  {roles?.map((role) => (
                    <div
                      key={role.id}
                      className='flex items-center gap-2'>
                      <Checkbox
                        id={role.id}
                        onChange={() => handleToggleUserRole(role.name)}
                        checked={userRoles.includes(role.name)}
                      />
                      <Label
                        htmlFor={role.id}
                        className='flex'>
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
            {configs.ENABLE_NAMES && (
              <>
                <Table.Row>
                  <Table.Cell>{t('users.firstName')}</Table.Cell>
                  <Table.Cell>
                    <TextInput
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName}
                    />
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>{t('users.lastName')}</Table.Cell>
                  <Table.Cell>
                    <TextInput
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName}
                    />
                  </Table.Cell>
                </Table.Row>
              </>
            )}
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{user.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{user.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
      <SubmitError />
      <section className='flex items-center gap-4 mt-8'>
        <SaveButton
          isLoading={isLoading}
          disabled={!Object.keys(updateObj).length}
          onClick={handleSave}
        />
        <DeleteButton
          isLoading={isLoading}
          confirmDeleteTitle={t(
            'common.deleteConfirm',
            { item: user.email },
          )}
          onConfirmDelete={handleDelete}
        />
      </section>
      {enableConsent && (
        <>
          <h2 className='font-semibold mt-8'>{t('users.consented')}</h2>
          <section className='flex items-center gap-4 mt-4'>
            {consentedApps.map((consented) => (
              <Card key={consented.appId}>
                {consented.appName}
                <DeleteButton
                  onConfirmDelete={() => handleDeleteConsent(consented.appId)}
                  size='xs'
                  buttonText={t('users.revokeConsent')}
                  confirmDeleteTitle={t(
                    'users.confirmRevoke',
                    { item: consented.appName },
                  )}
                />
              </Card>
            ))}
            {!consentedApps.length && (
              <p>{t('users.noConsented')}</p>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default Page