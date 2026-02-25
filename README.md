# Meet App — AI-Powered Meeting Summaries

Browser-based video conferencing with instant AI summaries. Phase 1 (Core Video MVP) is implemented.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js v5 (email/password + Google OAuth)
- **Video:** LiveKit (WebRTC)

## Quick Start (already done)

1. **Database** — SQLite is configured (`dev.db`). No setup needed.
2. **Auth** — AUTH_SECRET is set in `.env.local`.
3. **Run** — `npm run dev` is available.

For **video meetings**, add LiveKit credentials (free at [cloud.livekit.io](https://cloud.livekit.io)):

1. Create a project → copy the URL, API Key, and API Secret.
2. Add to `.env.local`:
   ```
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your_key
   LIVEKIT_API_SECRET=your_secret
   ```
3. Restart the dev server.

For **Google sign-in**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
3. Application type: **Web application**
4. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` — use your dev server port (e.g. 3004) and ensure `AUTH_URL` in `.env.local` matches
5. Copy Client ID and Client Secret to `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
6. Restart the dev server.

## Manual Setup (from scratch)

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Phase 1 Features

- ✅ NextAuth (email/password + Google OAuth)
- ✅ Meeting creation with shareable room links
- ✅ Pre-join lobby with camera/mic preview and device selection
- ✅ Live meeting room (LiveKit) with video grid
- ✅ Participants panel
- ✅ In-meeting chat
- ✅ Guest join (no account required)

## Routes

| Route | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Sign in / Register |
| `/dashboard` | User dashboard (past meetings) |
| `/meetings/new` | Create meeting |
| `/join` | Join by room code or link |
| `/meet/[roomCode]/lobby` | Pre-join lobby |
| `/meet/[roomCode]` | Live meeting room |

## Next Phases

- **Phase 2:** Audio recording & upload to S3/R2
- **Phase 3:** Gemini AI summary generation
- **Phase 4:** Dashboard polish, email notifications
- **Phase 5:** Export, share, mobile responsiveness
