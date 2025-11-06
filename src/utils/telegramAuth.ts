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
  enableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
};

// Новые типы для совместимости с @telegram-apps/sdk
export type TelegramLaunchParams = {
  initDataRaw?: string;
  initData?: {
    query_id?: string;
    user?: TelegramWebAppUser;
    auth_date?: number;
    hash?: string;
    [key: string]: unknown;
  };
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

// Функция для получения init данных с использованием @telegram-apps/sdk подхода
export const getTelegramInitDataFromSDK = (
  options?: TelegramAuthValidationOptions,
): ValidatedTelegramAuthData => {
  // Проверяем доступность WebApp API
  if (!window.Telegram?.WebApp) {
    throw new TelegramAuthError('Telegram WebApp API is not available.');
  }

  const webApp = window.Telegram.WebApp;
  
  // Получаем init данные напрямую из WebApp
  const initDataRaw = webApp.initData;
  if (!initDataRaw || typeof initDataRaw !== 'string') {
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
    initData: initDataRaw,
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


// Новая функция для получения init данных с использованием официального SDK
export const getTelegramInitDataWithSDK = async (
  options?: TelegramAuthValidationOptions,
): Promise<ValidatedTelegramAuthData> => {
  try {
    // Официальная рекомендация SDK — использовать retrieveLaunchParams
    const { retrieveLaunchParams } = await import('@telegram-apps/sdk')
    const { initDataRaw, initData } = retrieveLaunchParams()

    // Если SDK не вернул данные (редкие случаи или нестандартный запуск),
    // пробуем собрать через window.Telegram.WebApp как запасной вариант.
    if (!initDataRaw || typeof initDataRaw !== 'string') {
      const webApp = window.Telegram?.WebApp
      if (webApp) {
        return getTelegramInitData(webApp, options)
      }
      throw new TelegramAuthError('Telegram init data is missing.')
    }

    const data = (initData as TelegramInitDataUnsafe | undefined) ?? {}
    const { auth_date: rawAuthDate, hash, user } = data

    if (!hash || typeof hash !== 'string') {
      throw new TelegramAuthError('Telegram init data hash is missing.')
    }
    if (!user || typeof user !== 'object' || typeof user.id !== 'number') {
      throw new TelegramAuthError('Telegram user information is missing.')
    }

    const parsedAuthDate =
      typeof rawAuthDate === 'string' ? Number.parseInt(rawAuthDate, 10) : rawAuthDate

    if (typeof parsedAuthDate !== 'number' || !Number.isFinite(parsedAuthDate)) {
      throw new TelegramAuthError('Telegram auth date is invalid.')
    }

    const now = options?.now?.() ?? Date.now()
    const maxAgeSeconds = options?.maxAgeSeconds ?? TELEGRAM_AUTH_MAX_AGE_SECONDS
    const ageSeconds = Math.floor(now / 1000) - parsedAuthDate

    if (ageSeconds > maxAgeSeconds) {
      throw new TelegramAuthError('Telegram init data is too old. Please reopen the WebApp.')
    }
    if (ageSeconds < 0) {
      throw new TelegramAuthError('Telegram auth date is in the future.')
    }

    return {
      initData: initDataRaw,
      authDate: parsedAuthDate,
      hash,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        avatarUrl: user.photo_url,
      },
    }
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      throw error
    }
    throw new TelegramAuthError(`Failed to get Telegram init data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
};

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
          query_id?: string;
          auth_date?: number | string;
          hash?: string;
        };
        ready: () => void;
        expand: () => void;
        openInvoice: (url: string, callback: (status: string) => void) => void;
        showAlert: (message: string) => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}
