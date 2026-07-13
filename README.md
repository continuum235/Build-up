# build-up

A job and onboarding application built with Expo React Native for the mobile client and a TypeScript Express backend. The app enables user authentication, profile onboarding, language selection, skill collection, job discovery, hiring workflows, and chat/conversation support.

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/ff5327e1-cd14-4396-9ba1-93c0084cc1f5" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/ac6da28e-5a3e-434c-92b5-bb34d577bb55" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/a6b56e78-165a-4680-a85d-cc751d5e153f" width="220"/></td>
    <td><img src="https://github.com/user-attachments/assets/292193c8-45cd-4485-bd86-7979dc30da63" width="220"/></td>
  </tr>
</table>

## Project overview

- `App.tsx` initializes Clerk authentication, secure token storage, language context, and profile context.
- `src/navigation/AppNavigator.tsx` defines the navigation stack for onboarding, job browsing, profile, and messaging screens.
- `server/` contains the Express API, Prisma/Neon database integration, Clerk backend auth, and job/conversation endpoints.
- `server/src/server.ts` is the backend entrypoint.

## Features

- Clerk-based authentication for mobile users
- Role-based onboarding for workers and hirers
- Profile creation flow with language, skills, bio, and role details
- Job listing, job details, accept/reject workflow for workers
- Simple conversation/chat backend with message history
- Express API with authorization middleware and role checks
- Prisma + NeonDB database connectivity for persistence

## Tech stack

- Frontend: Expo, React Native, React Navigation, TypeScript
- Backend: Node.js, Express, TypeScript, Prisma, NeonDB, Clerk
- Auth: Clerk for auth provider and user sync
- Data: Prisma ORM with Neon adapter
- Environment: `dotenv`

## Prerequisites

- Node.js (recommended 18+)
- npm
- Expo CLI installed globally or use `npx expo`
- Android/iOS device or simulator for mobile testing
- Clerk account / API keys for auth
- NeonDB or compatible database with connection string

## Environment variables

### Client

Create a `.env` file at the repository root or configure your environment with:

```env
EXPO_PUBLICCLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Server

Create `server/.env` and set:

```env
PORT=3000
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXX
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?schema=public
```

> The client expects `EXPO_PUBLIC_API_URL` to point to the running backend.

## Setup

Install dependencies for both the client and backend.

```bash
# From repository root
npm install

# Backend dependencies
cd server
npm install
```

## Running locally

### Start the backend server

```bash
cd server
npm run dev
```

The backend listens on `http://localhost:3000` by default.

### Start the Expo client

```bash
cd ..
npm start
```

Or to launch a specific platform:

```bash
npm run android
npm run ios
npm run web
```

## Available scripts

### Root project

- `npm start` - start the Expo development server
- `npm run android` - open Expo app on Android emulator/device
- `npm run ios` - open Expo app on iOS simulator/device
- `npm run web` - run the app in a web browser
- `npm run lint` - run ESLint across the frontend code
- `npm run lint:fix` - auto-fix lint issues
- `npm run format` - format code with Prettier

### Backend server (`server/`)

- `npm run dev` - run the backend using `tsx` in watch mode
- `npm run build` - compile backend TypeScript to `dist/`
- `npm run start` - run the compiled backend from `dist/`
- `npm run lint` - run ESLint for backend source files
- `npm run lint:fix` - fix backend lint issues

## Folder structure

- `App.tsx` - app root and Clerk provider setup
- `src/` - mobile app source code
  - `components/` - reusable UI components
  - `context/` - React contexts for language and profile state
  - `localization/` - i18n configuration and translations
  - `navigation/` - route definitions and app navigator
  - `screens/` - feature screens and onboarding flow
  - `services/` - API clients and job services
  - `utils/` - shared utilities and validation helpers
- `server/` - backend API service
  - `src/` - backend source code
  - `server/src/routes` - Express route definitions
  - `server/src/controllers` - request handlers
  - `server/src/lib` - auth and database helpers
  - `server/src/middleware` - auth and role middleware
  - `server/src/types` - Express type extensions

## API overview

The backend exposes these main routes:

- `GET /health` - health check
- `POST /auth/sync` - sync authenticated user data
- `GET /auth/me` - retrieve current user profile
- `GET /jobs` - list jobs
- `GET /jobs/:id` - get job detail
- `POST /jobs` - create job (HIRER only)
- `PATCH /jobs/:id` - update job (HIRER only)
- `DELETE /jobs/:id` - delete job (HIRER only)
- `POST /jobs/:jobId/accept` - worker accepts a job
- `POST /jobs/:jobId/reject` - worker rejects a job
- `GET /conversations` - list conversations
- `POST /conversations` - create or find a conversation
- `GET /conversations/:id/messages` - fetch messages
- `POST /conversations/:id/messages` - send a new message

## Notes

- Update Clerk keys before running production builds.
- Ensure the app’s `EXPO_PUBLIC_API_URL` matches the backend host and port.
- If using Expo Go, ensure the mobile device can reach the local backend.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Run `npm install` and `cd server && npm install`.
4. Add tests for new behavior.
5. Submit a pull request with a clear description.

## Figma Link
https://www.figma.com/design/CVwIhr6rSFajjV8DZv7U4A/Untitled?node-id=0-1&p=f
