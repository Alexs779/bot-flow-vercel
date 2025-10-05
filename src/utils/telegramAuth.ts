export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 86400;

export class TelegramAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelegramAuthError';
  }
}

export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type TelegramInitDataUnsafe = {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: number | string;
  hash?: string;
  [key: string]: unknown;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: TelegramInitDataUnsafe;
  ready: () => void;
  expand: () => void;
  openInvoice: (url: string, callback: (status: string) => void) => void;
  showAlert: (message: string) => void;
};

export type ValidatedTelegramAuthData = {
  initData: string;
  authDate: number;
  hash: string;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    avatarUrl?: string;
  };
};

export type TelegramAuthValidationOptions = {
  /** Maximum age of the auth data in seconds. Defaults to 86400 (1 day). */
  maxAgeSeconds?: number;
  /** Overrideable clock for testing. */
  now?: () => number;
};

export const getTelegramInitData = (
  webApp: TelegramWebApp,
  options?: TelegramAuthValidationOptions,
): ValidatedTelegramAuthData => {
  if (!webApp) {
    throw new TelegramAuthError('Telegram WebApp API is not available.');
  }

  const initData = webApp.initData;
  if (!initData || typeof initData !== 'string') {
    throw new TelegramAuthError('Telegram init data is missing.');
  }

  const unsafe = webApp.initDataUnsafe;
  if (!unsafe || typeof unsafe !== 'object') {
    throw new TelegramAuthError('Telegram init data is incomplete.');
  }

  const { auth_date: rawAuthDate, hash, user } = unsafe;

  if (!hash || typeof hash !== 'string') {
    throw new TelegramAuthError('Telegram init data hash is missing.');
  }

  if (!user || typeof user !== 'object' || typeof user.id !== 'number') {
    throw new TelegramAuthError('Telegram user information is missing.');
  }

  const parsedAuthDate =
    typeof rawAuthDate === 'string' ? Number.parseInt(rawAuthDate, 10) : rawAuthDate;

  if (typeof parsedAuthDate !== 'number' || !Number.isFinite(parsedAuthDate)) {
    throw new TelegramAuthError('Telegram auth date is invalid.');
  }

  const authDate = parsedAuthDate;

  const now = options?.now?.() ?? Date.now();
  const maxAgeSeconds = options?.maxAgeSeconds ?? TELEGRAM_AUTH_MAX_AGE_SECONDS;
  const ageSeconds = Math.floor(now / 1000) - authDate;

  if (ageSeconds > maxAgeSeconds) {
    throw new TelegramAuthError('Telegram init data is too old. Please reopen the WebApp.');
  }

  if (ageSeconds < 0) {
    throw new TelegramAuthError('Telegram auth date is in the future.');
  }

  return {
    initData,
    authDate,
    hash,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      avatarUrl: user.photo_url,
    },
  };
};
