# Google OAuth setup

The code is wired for Google sign-in via Auth.js. It activates automatically once
`AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set in `.env` (until then, only the dev
email login shows). This guide creates those credentials. ~5 minutes.

## 1. Create OAuth credentials in Google Cloud

1. Go to <https://console.cloud.google.com/> and create (or select) a project.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**. Fill in app name, support email, developer email.
   - While the app is in **Testing**, add your Google account under **Test users**
     (only test users can sign in until you publish).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - your production origin, e.g. `https://your-app.vercel.app`
   - **Authorized redirect URIs** (Auth.js callback path):
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-app.vercel.app/api/auth/callback/google`
4. Create. Copy the **Client ID** and **Client secret**.

## 2. Add to `.env`

```
AUTH_GOOGLE_ID="<client id>.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="<client secret>"
```

Restart the dev server (`npm run dev`) so the new env is picked up. The sign-in page
will now show **Continue with Google** above the dev login.

## How it works here

- `lib/auth.ts` adds the Google provider only when both env vars are present
  (`googleEnabled`), so the app never breaks if they're missing.
- Sessions are **JWT** (required because the dev Credentials provider coexists). The
  Prisma adapter still persists the `User` + `Account` rows on Google sign-in.
- `allowDangerousEmailAccountLinking` links a Google login to an existing user with the
  same email (e.g. one created via the dev login). Remove it in `lib/auth.ts` if you
  want strict, explicit account linking.

## Production notes

- Set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (and `AUTH_SECRET`, `DATABASE_URL`,
  `DIRECT_URL`) in your host's env.
- Set `AUTH_URL` to your production URL if Auth.js can't infer it (we set
  `trustHost: true`, which usually handles this behind a proxy).
- Add the production redirect URI in the Google console (step 1.3).
- **Publish** the OAuth consent screen when you're ready for non-test users.

## Remove the dev login (optional)

Once Google works, you can drop the Credentials provider: delete the `Credentials({...})`
block and its import in `lib/auth.ts`, and the dev-login `<form>` in
`app/sign-in/page.tsx`. With only OAuth left you could also switch to database sessions
(`session: { strategy: "database" }`).
