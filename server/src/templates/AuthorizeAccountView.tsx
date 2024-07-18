import { html } from 'hono/html'
import { validateEmail } from 'templates/scripts/email'
import {
  validateConfirmPassword, validatePassword,
} from 'templates/scripts/password'
import FieldError from 'templates/components/FieldError'
import {
  validateFirstName, validateLastName,
} from 'templates/scripts/name'
import {
  localeConfig, routeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import Layout from 'templates/components/Layout'
import AuthorizeCommonFields from 'templates/components/AuthorizeCommonFields'
import RequiredSymbol from 'templates/components/RequiredSymbol'
import PoweredBy from 'templates/components/PoweredBy'
import {
  handleError, handleRedirect, parseCommonFormFields, parseResponse, resetError,
} from 'templates/scripts/form'

const AuthorizeAccount = ({
  queryDto, logoUrl, enableNames, namesIsRequired, queryString,
}: {
  queryDto: oauthDto.GetAuthorizeReqQueryDto;
  logoUrl: string;
  enableNames: boolean;
  namesIsRequired: boolean;
  queryString: string;
}) => {
  return (
    <Layout>
      <section class='flex-col items-center gap-4'>
        {!!logoUrl && (
          <img
            class='logo'
            src={logoUrl}
            alt='Logo'
          />
        )}
        <h1>{localeConfig.AuthorizeAccountPage.Title}</h1>
        <form
          autocomplete='on'
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <AuthorizeCommonFields queryDto={queryDto} />
            <section class='flex-col gap-2'>
              <label
                class='label'
                for='confirmPassword'
              >
                {localeConfig.AuthorizeAccountPage.ConfirmPasswordLabel}
                <RequiredSymbol />
              </label>
              <input
                class='input'
                type='password'
                id='form-confirmPassword'
                name='confirmPassword'
              />
              <FieldError id='confirmPassword-error' />
            </section>
            {enableNames && (
              <>
                <section class='flex-row gap-4'>
                  <section class='flex-col gap-2'>
                    <label
                      class='label'
                      for='firstName'
                    >
                      {localeConfig.AuthorizeAccountPage.FirstNameLabel}
                      {namesIsRequired && <RequiredSymbol />}
                    </label>
                    <input
                      class='input'
                      type='text'
                      id='form-firstName'
                      name='firstName'
                    />
                    <FieldError id='firstName-error' />
                  </section>
                  <section class='flex-col gap-2'>
                    <label
                      class='label'
                      for='lastName'
                    >
                      {localeConfig.AuthorizeAccountPage.LastNameLabel}
                      {namesIsRequired && <RequiredSymbol />}
                    </label>
                    <input
                      class='input'
                      type='text'
                      id='form-lastName'
                      name='lastName'
                    />
                    <FieldError id='lastName-error' />
                  </section>
                </section>
              </>
            )}
            <div
              id='submit-error'
              class='alert mt-4 hidden'>
            </div>
            <button
              class='button mt-4'
              type='submit'
            >
              {localeConfig.AuthorizeAccountPage.SignUpBtn}
            </button>
          </section>
        </form>
        <a
          class='button-text mt-4'
          href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
        >
          {localeConfig.AuthorizeAccountPage.SignInBtn}
        </a>
        <PoweredBy />
      </section>
      {html`
        <script>
          ${resetError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateEmail()}
            ${validatePassword()}
            ${validateConfirmPassword()}
            ${enableNames && namesIsRequired ? validateFirstName() : ''}
            ${enableNames && namesIsRequired ? validateLastName() : ''}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-account', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  firstName: document.getElementById('form-firstName').value,
                  lastName: document.getElementById('form-lastName').value,
                  ${parseCommonFormFields()}
                })
            })
            .then((response) => {
              ${parseResponse()}
            })
            .then((data) => {
              ${handleRedirect()}
            })
            .catch((error) => {
              ${handleError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizeAccount
