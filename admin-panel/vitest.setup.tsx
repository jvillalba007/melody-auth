import { vi } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

const customRender = (ui: React.ReactElement) => {
  return render(ui)
}

global.URL = vi.fn().mockImplementation((url) => ({ href: url })) as any

vi.mock(
  'hooks/useCurrentLocale',
  () => ({ default: vi.fn(() => 'en') }),
)

vi.mock(
  'next-intl',
  () => ({
    ...vi.importActual('next-intl'),
    useTranslations: () => (key: string) => key,
  }),
)

export { customRender as render }