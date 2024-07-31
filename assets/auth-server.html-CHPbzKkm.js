import{_ as e,c as n,o as s,a}from"./app-MEMgFyQR.js";const i={},t=a(`<h1 id="server-setup" tabindex="-1"><a class="header-anchor" href="#server-setup"><span>Server Setup</span></a></h1><h2 id="prerequisites" tabindex="-1"><a class="header-anchor" href="#prerequisites"><span>Prerequisites</span></a></h2><ul><li>A Cloudflare account (Free plan supported)</li><li>Node.js and npm installed on your local machine</li></ul><h2 id="installation-and-setup" tabindex="-1"><a class="header-anchor" href="#installation-and-setup"><span>Installation and Setup</span></a></h2><h3 id="_1-cloudflare-account-setup" tabindex="-1"><a class="header-anchor" href="#_1-cloudflare-account-setup"><span>1. Cloudflare Account Setup</span></a></h3><ol><li>Sign up for a Cloudflare account if you don&#39;t have one already.</li><li>Install Wrangler CLI and authenticate:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">npx wrangler</span>
<span class="line">wrangler login</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-cloudflare-resource-creation" tabindex="-1"><a class="header-anchor" href="#_2-cloudflare-resource-creation"><span>2. Cloudflare Resource Creation</span></a></h3><p>Go to Cloudflare dashboard</p><ol><li>Create a Worker:</li></ol><ul><li>Go to Workers &amp; Pages -&gt; Overview -&gt; Click &quot;Create&quot; button</li><li>Name the worker &quot;melody-auth&quot;</li><li>After creation, go to the worker settings -&gt; Variables</li><li>Add a variable named &quot;AUTH_SERVER_URL&quot; with the value set to your worker&#39;s URL (e.g., https://melody-auth.[your-account-name].workers.dev)</li></ul><ol start="2"><li>Create a D1 database:</li></ol><ul><li>Go to Workers &amp; Pages -&gt; D1 -&gt; Click &quot;Create database&quot; button</li></ul><ol start="3"><li>Create a KV namespace:</li></ol><ul><li>Go to Workers &amp; Pages -&gt; KV -&gt; Click &quot;Create a namespace&quot; button</li></ul><h3 id="_3-project-setup" tabindex="-1"><a class="header-anchor" href="#_3-project-setup"><span>3. Project Setup</span></a></h3><ol><li>Clone the repository:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">git clone git@github.com:ValueMelody/melody-auth.git</span>
<span class="line">cd melody-auth</span>
<span class="line">npm install</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>Update <code>server/wrangler.toml</code>: Replace the KV id and D1 id with your newly created resources:</li></ol><div class="language-toml line-numbers-mode" data-highlighter="prismjs" data-ext="toml" data-title="toml"><pre class="language-toml"><code><span class="line"><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token table class-name">kv_namespaces</span><span class="token punctuation">]</span><span class="token punctuation">]</span></span>
<span class="line"><span class="token key property">binding</span> <span class="token punctuation">=</span> <span class="token string">&quot;KV&quot;</span></span>
<span class="line"><span class="token key property">id</span> <span class="token punctuation">=</span> <span class="token string">&quot;your_kv_namespace_id&quot;</span></span>
<span class="line"></span>
<span class="line"><span class="token punctuation">[</span><span class="token punctuation">[</span><span class="token table class-name">d1_databases</span><span class="token punctuation">]</span><span class="token punctuation">]</span></span>
<span class="line"><span class="token key property">binding</span> <span class="token punctuation">=</span> <span class="token string">&quot;DB&quot;</span></span>
<span class="line"><span class="token key property">database_name</span> <span class="token punctuation">=</span> <span class="token string">&quot;melody-auth&quot;</span></span>
<span class="line"><span class="token key property">database_id</span> <span class="token punctuation">=</span> <span class="token string">&quot;your_d1_database_id&quot;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-deploy" tabindex="-1"><a class="header-anchor" href="#_4-deploy"><span>4. Deploy</span></a></h3><p>Run the following commands to set up your remote D1, KV, and deploy the code to your Worker:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run prod:secret:generate</span>
<span class="line">npm run prod:migration:apply</span>
<span class="line">npm run prod:deploy</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Now you are all set, you can verify your server by accessing: <code>[your_worker_url]/.well-known/openid-configuration</code></p><h2 id="email-functionality-setup" tabindex="-1"><a class="header-anchor" href="#email-functionality-setup"><span>Email Functionality Setup</span></a></h2><p>Melody Auth supports email-based features such as password reset and email verification. To enable these features, you need to set up SendGrid integration and configure the necessary environment variables in your Cloudflare Worker.</p><h3 id="prerequisites-1" tabindex="-1"><a class="header-anchor" href="#prerequisites-1"><span>Prerequisites</span></a></h3><ul><li>A SendGrid account</li><li>SendGrid API key</li><li>Verified sender email address in SendGrid</li></ul><h3 id="configuration-steps" tabindex="-1"><a class="header-anchor" href="#configuration-steps"><span>Configuration Steps</span></a></h3><ol><li><p>Navigate to the Cloudflare dashboard:</p><ul><li>Go to Workers &amp; Pages</li><li>Select your Melody Auth worker</li><li>Click on &quot;Settings&quot; -&gt; &quot;Variables&quot;</li></ul></li><li><p>Add the following environment variables:</p><table><thead><tr><th>Variable Name</th><th>Description</th><th>Example Value</th></tr></thead><tbody><tr><td>ENVIRONMENT</td><td>Determines the email sending behavior</td><td>&quot;prod&quot; or &quot;dev&quot;</td></tr><tr><td>DEV_EMAIL_RECEIVER</td><td>Email address for testing (used when ENVIRONMENT is not &#39;prod&#39;)</td><td>&quot;test@example.com&quot;</td></tr><tr><td>SENDGRID_API_KEY</td><td>Your SendGrid API key</td><td>&quot;SG.xxxxxxxxxxxxxxxxxxxxxxxx&quot;</td></tr><tr><td>SENDGRID_SENDER_ADDRESS</td><td>Your verified sender email address in SendGrid</td><td>&quot;noreply@yourdomain.com&quot;</td></tr></tbody></table></li><li><p>Click &quot;Save and deploy&quot; to apply the changes.</p></li></ol><h3 id="environment-behavior" tabindex="-1"><a class="header-anchor" href="#environment-behavior"><span>Environment Behavior</span></a></h3><ul><li><p>When <code>ENVIRONMENT</code> is set to &quot;prod&quot;:</p><ul><li>Emails will be sent to the actual user email addresses.</li><li>Use this setting for production deployments.</li></ul></li><li><p>When <code>ENVIRONMENT</code> is not set to &quot;prod&quot; (e.g., set to &quot;dev&quot;):</p><ul><li>All emails will be redirected to the address specified in <code>DEV_EMAIL_RECEIVER</code>.</li><li>This is useful for testing and development to avoid sending emails to real users.</li></ul></li></ul><h3 id="local-development-environment-setup" tabindex="-1"><a class="header-anchor" href="#local-development-environment-setup"><span>Local Development Environment Setup</span></a></h3><p>To set up your local development environment, follow these steps:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">git clone git@github.com:ValueMelody/melody-auth.git</span>
<span class="line">cd melody-auth</span>
<span class="line">npm install</span>
<span class="line"></span>
<span class="line">cd server</span>
<span class="line">cp dev.vars.example dev.vars # Your email functionality related env vars should be put here</span>
<span class="line">npm run dev:secret:generate</span>
<span class="line">npm run dev:migration:apply</span>
<span class="line">npm run dev:start</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="additional-configs" tabindex="-1"><a class="header-anchor" href="#additional-configs"><span>Additional Configs</span></a></h2><p>Melody Auth offers a range of customizable options to tailor the server to your specific needs. You can modify these settings by adjusting the values in the <code>[vars]</code> section of the <code>server/wrangler.toml</code> file.</p><p>To apply your changes:</p><ol><li>Open <code>server/wrangler.toml</code> in your preferred text editor.</li><li>Locate the <code>[vars]</code> section.</li><li>Modify the values as needed.</li><li>Save the file.</li><li>Redeploy your server using the command:</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre class="language-text"><code><span class="line">cd server</span>
<span class="line">npm run prod:deploy</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="authorization-code-expires-in" tabindex="-1"><a class="header-anchor" href="#authorization-code-expires-in"><span>AUTHORIZATION_CODE_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 60 (1 minute)</li><li><strong>Description:</strong> Determines how long the authorization code is valid before it expires.</li></ul><h3 id="spa-access-token-expires-in" tabindex="-1"><a class="header-anchor" href="#spa-access-token-expires-in"><span>SPA_ACCESS_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 1800 (30 minutes)</li><li><strong>Description:</strong> Determines how long the access token granted for single page applications is valid before it expires.</li></ul><h3 id="spa-refresh-token-expires-in" tabindex="-1"><a class="header-anchor" href="#spa-refresh-token-expires-in"><span>SPA_REFRESH_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 604800 (7 days)</li><li><strong>Description:</strong> Determines how long the refresh token granted for single page applications is valid before it expires.</li></ul><h3 id="s2s-access-token-expires-in" tabindex="-1"><a class="header-anchor" href="#s2s-access-token-expires-in"><span>S2S_ACCESS_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 3600 (1 hour)</li><li><strong>Description:</strong> Determines how long the access token granted for server-to-server applications is valid before it expires.</li></ul><h3 id="id-token-expires-in" tabindex="-1"><a class="header-anchor" href="#id-token-expires-in"><span>ID_TOKEN_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 1800 (30 minutes)</li><li><strong>Description:</strong> Determines how long the ID token is valid before it expires.</li></ul><h3 id="server-session-expires-in" tabindex="-1"><a class="header-anchor" href="#server-session-expires-in"><span>SERVER_SESSION_EXPIRES_IN</span></a></h3><ul><li><strong>Default:</strong> 1800 (30 minutes)</li><li><strong>Description:</strong> Determines how long the server session is valid before it expires. If set to 0, the server session will be disabled.</li></ul><h3 id="company-logo-url" tabindex="-1"><a class="header-anchor" href="#company-logo-url"><span>COMPANY_LOGO_URL</span></a></h3><ul><li><strong>Default:</strong> https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg</li><li><strong>Description:</strong> The logo used for branding.</li></ul><h3 id="enable-sign-up" tabindex="-1"><a class="header-anchor" href="#enable-sign-up"><span>ENABLE_SIGN_UP</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Determines if user sign-up is allowed. If set to false, the sign-up button will be suppressed on the sign-in page.</li></ul><h3 id="enable-password-reset" tabindex="-1"><a class="header-anchor" href="#enable-password-reset"><span>ENABLE_PASSWORD_RESET</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Determines if user password reset is allowed. If set to false, the reset password button will be suppressed on the sign-in page. (Email functionality required. To enable email functionality, you need to set valid <code>SENDGRID_API_KEY</code> and <code>SENDGRID_SENDER_ADDRESS</code> environment variables first.)</li></ul><h3 id="enable-names" tabindex="-1"><a class="header-anchor" href="#enable-names"><span>ENABLE_NAMES</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Provides fields for users to enter their first and last names during sign-up. If set to false, the first and last name fields will not show up on the sign-up page.</li></ul><h3 id="names-is-required" tabindex="-1"><a class="header-anchor" href="#names-is-required"><span>NAMES_IS_REQUIRED</span></a></h3><ul><li><strong>Default:</strong> false</li><li><strong>Description:</strong> Determines if users are required to provide their first and last names during sign-up.</li></ul><h3 id="enable-user-app-consent" tabindex="-1"><a class="header-anchor" href="#enable-user-app-consent"><span>ENABLE_USER_APP_CONSENT</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> Requires users to consent to grant access to each app after authentication.</li></ul><h3 id="enable-email-verification" tabindex="-1"><a class="header-anchor" href="#enable-email-verification"><span>ENABLE_EMAIL_VERIFICATION</span></a></h3><ul><li><strong>Default:</strong> true</li><li><strong>Description:</strong> If set to true, users will receive an email to verify their email address after signing up. (Email functionality required. To enable email functionality, you need to set valid <code>SENDGRID_API_KEY</code> and <code>SENDGRID_SENDER_ADDRESS</code> environment variables first.)</li></ul>`,66),l=[t];function r(o,d){return s(),n("div",null,l)}const u=e(i,[["render",r],["__file","auth-server.html.vue"]]),c=JSON.parse('{"path":"/auth-server.html","title":"Server Setup","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Prerequisites","slug":"prerequisites","link":"#prerequisites","children":[]},{"level":2,"title":"Installation and Setup","slug":"installation-and-setup","link":"#installation-and-setup","children":[{"level":3,"title":"1. Cloudflare Account Setup","slug":"_1-cloudflare-account-setup","link":"#_1-cloudflare-account-setup","children":[]},{"level":3,"title":"2. Cloudflare Resource Creation","slug":"_2-cloudflare-resource-creation","link":"#_2-cloudflare-resource-creation","children":[]},{"level":3,"title":"3. Project Setup","slug":"_3-project-setup","link":"#_3-project-setup","children":[]},{"level":3,"title":"4. Deploy","slug":"_4-deploy","link":"#_4-deploy","children":[]}]},{"level":2,"title":"Email Functionality Setup","slug":"email-functionality-setup","link":"#email-functionality-setup","children":[{"level":3,"title":"Prerequisites","slug":"prerequisites-1","link":"#prerequisites-1","children":[]},{"level":3,"title":"Configuration Steps","slug":"configuration-steps","link":"#configuration-steps","children":[]},{"level":3,"title":"Environment Behavior","slug":"environment-behavior","link":"#environment-behavior","children":[]},{"level":3,"title":"Local Development Environment Setup","slug":"local-development-environment-setup","link":"#local-development-environment-setup","children":[]}]},{"level":2,"title":"Additional Configs","slug":"additional-configs","link":"#additional-configs","children":[{"level":3,"title":"AUTHORIZATION_CODE_EXPIRES_IN","slug":"authorization-code-expires-in","link":"#authorization-code-expires-in","children":[]},{"level":3,"title":"SPA_ACCESS_TOKEN_EXPIRES_IN","slug":"spa-access-token-expires-in","link":"#spa-access-token-expires-in","children":[]},{"level":3,"title":"SPA_REFRESH_TOKEN_EXPIRES_IN","slug":"spa-refresh-token-expires-in","link":"#spa-refresh-token-expires-in","children":[]},{"level":3,"title":"S2S_ACCESS_TOKEN_EXPIRES_IN","slug":"s2s-access-token-expires-in","link":"#s2s-access-token-expires-in","children":[]},{"level":3,"title":"ID_TOKEN_EXPIRES_IN","slug":"id-token-expires-in","link":"#id-token-expires-in","children":[]},{"level":3,"title":"SERVER_SESSION_EXPIRES_IN","slug":"server-session-expires-in","link":"#server-session-expires-in","children":[]},{"level":3,"title":"COMPANY_LOGO_URL","slug":"company-logo-url","link":"#company-logo-url","children":[]},{"level":3,"title":"ENABLE_SIGN_UP","slug":"enable-sign-up","link":"#enable-sign-up","children":[]},{"level":3,"title":"ENABLE_PASSWORD_RESET","slug":"enable-password-reset","link":"#enable-password-reset","children":[]},{"level":3,"title":"ENABLE_NAMES","slug":"enable-names","link":"#enable-names","children":[]},{"level":3,"title":"NAMES_IS_REQUIRED","slug":"names-is-required","link":"#names-is-required","children":[]},{"level":3,"title":"ENABLE_USER_APP_CONSENT","slug":"enable-user-app-consent","link":"#enable-user-app-consent","children":[]},{"level":3,"title":"ENABLE_EMAIL_VERIFICATION","slug":"enable-email-verification","link":"#enable-email-verification","children":[]}]}],"git":{"updatedTime":1722461102000,"contributors":[{"name":"Baozier","email":"byn9826@gmail.com","commits":1}]},"filePathRelative":"auth-server.md"}');export{u as comp,c as data};
