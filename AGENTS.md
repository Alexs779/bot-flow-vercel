# Repository Guidelines

## Project Structure & Module Organization
The gameplay client lives in `src/` with feature folders: `components/` for UI primitives, `pages/` for view shells, `utils/` for shared helpers, `i18n/` for copy, and `assets/` for media. The Express backend sits in `server/` with `routes/`, `services/`, `types/`, and HTTP specs in `server/__tests__/`. Static entry points stay in `public/`, while `dist/` holds build artifacts.

## Build, Test, and Development Commands
- `npm install` — install all client and server dependencies.
- `npm run dev` — launch the Vite dev server on `http://localhost:5173`.
- `npm run server:dev` — run the API with `tsx watch server/index.ts`; export `BOT_TOKEN` and `JWT_SECRET`.
- `npm run build` — type-check and bundle the client into `dist/`.
- `npm run preview` — serve the built client for regression checks.
- `npm run test` / `npm run test:watch` — execute Vitest suites for the client and server.
- `npx ngrok http 3000` (optional) — share the local API with Telegram during QA.

## Coding Style & Naming Conventions
ESLint (`eslint.config.js`) enforces TypeScript, React Hooks, and refresh rules. Follow 2-space indent, double quotes, trailing commas, and omit semicolons. Use PascalCase for components, camelCase for hooks and utilities, SCREAMING_SNAKE_CASE for constants, and prefix storage keys with `bot-dance:`. Co-locate styles with their components and suffix tests with `.test.ts`.

## Testing Guidelines
Vitest runs in a Node environment and picks up `src/**/*.test.ts` and `server/**/*.test.ts`. Organize specs by feature, reuse fixtures from `server/__tests__/helpers.ts`, and assert Telegram signature checks, event persistence, and auth error paths after each change. Run `npm run test` before sharing work and note any manual QA in pull requests.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`type[scope]: subject`) with scopes such as `client`, `server`, `docs`, or `build`. Keep subjects under 72 characters, include body context when behaviour changes, and flag breaking updates explicitly. Pull requests need a narrative summary, linked tasks, test evidence (`npm run test`, manual flows), screenshots for UI work, and callouts for new environment variables or migrations.

## Security & Configuration Tips
Keep credentials outside the repo. The client reads `VITE_API_BASE_URL`; the server requires `BOT_TOKEN`, `JWT_SECRET`, and optionally `PORT`. Store local secrets in `.env.local` and avoid committing Telegram init payloads or ngrok URLs. Optimize new imagery before placing it in `src/assets/images/`.
