'use client'

import { useAuth } from '@melody-auth/react'
import { Table } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect, useState,
} from 'react'
import { Scope } from 'shared'
import useCurrentLocale from 'hooks/useCurrentLocale'
import EntityStatusLabel from 'components/EntityStatusLabel'
import {
  proxyTool, routeTool,
} from 'tools'
import EditLink from 'components/EditLink'
import SystemLabel from 'components/SystemLabel'
import PageTitle from 'components/PageTitle'
import CreateButton from 'components/CreateButton'
import ClientTypeLabel from 'components/ClientTypeLabel'

const isSystem = (name: string) => Object.values(Scope).some((scope) => scope === name)

const Page = () => {
  const t = useTranslations()
  const locale = useCurrentLocale()

  const [scopes, setScopes] = useState([])
  const { acquireToken } = useAuth()

  useEffect(
    () => {
      const getScopes = async () => {
        const token = await acquireToken()
        const data = await proxyTool.getScopes(token)
        setScopes(data.scopes)
      }

      getScopes()
    },
    [acquireToken],
  )

  return (
    <section>
      <div className='mb-6 flex items-center gap-4'>
        <PageTitle title={t('scopes.title')} />
        <CreateButton
          href={`/${locale}${routeTool.Internal.Scopes}/new`}
        />
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>{t('scopes.name')}</Table.HeadCell>
          <Table.HeadCell>{t('scopes.type')}</Table.HeadCell>
          <Table.HeadCell>{t('scopes.status')}</Table.HeadCell>
          <Table.HeadCell />
        </Table.Head>
        <Table.Body className='divide-y'>
          {scopes.map((scope) => (
            <Table.Row key={scope.id}>
              <Table.Cell>
                <div className='flex items-center gap-2'>
                  {scope.name}
                  {isSystem(scope.name) && <SystemLabel />}
                </div>
              </Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={scope.type} />
              </Table.Cell>
              <Table.Cell>
                <EntityStatusLabel isEnabled={!scope.deletedAt} />
              </Table.Cell>
              <Table.Cell>
                {!isSystem(scope.name) && (
                  <EditLink
                    href={`/${locale}/scopes/${scope.id}`}
                  />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </section>
  )
}

export default Page