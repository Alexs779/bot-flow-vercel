import { getTelegramInitData, TelegramAuthError, type TelegramWebApp, type ValidatedTelegramAuthData } from "./utils/telegramAuth"
import { RU } from "./i18n/ru"

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"
import "./App.css"
import flowForceLogo from "./assets/images/flow-force-logo.png"
import heroImage from "./assets/images/flow-force-hero.webp"
import EventModal from "./components/EventModal"

type Move = {
  id: string
  name: string
  cost: number
}

type MoveStyle = {
  id: string
  label: string
  description: string
  icon?: string
  moves: Move[]
}


type FloatingScore = {
  id: number
  value: number
  x: number
  y: number
}

type View = "stage" | "styles" | "shop" | "events"

type Event = {
  id: string
  title: string
  description: string
  category: string
  country: string
  city: string
  date: string
  time: string
  imageData: string
  instagram?: string
  priceRange?: string
  createdBy: string
  createdAt: string
}

type TelegramUser = {
  id: number
  firstName: string
  lastName?: string
  username?: string
  avatar?: string
}

type AuthStatus = "idle" | "loading" | "authenticated" | "unsupported" | "error"

type AuthResponse = {
  ok: boolean
  sessionToken?: string
  user?: TelegramUser
  error?: string
}

type InvoiceResponse = {
  ok: boolean
  invoiceUrl?: string
  error?: string
}

const STORAGE_KEY_SESSION = "bot-dance:session"
const STORAGE_KEY_EVENTS = "bot-dance:events"
const STORAGE_KEY_USER = "bot-dance:user"
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")
const resolveApiUrl = (path: string) => `${API_BASE_URL}${path}`

const BASE_TAP_POINTS = 1
const BASE_LEVEL_THRESHOLD = 100
const LEVEL_SCALING_FACTOR = 1.15
const FLOATING_DURATION_MS = 700
const TAP_POWER_DIMINISHING = 0.5

const EVENT_CATEGORIES = [
  "Battle",
  "Master Class",
  "Workshop",
  "Jam",
  "Concert",
  "Festival",
  "Competition",
  "Show",
  "Party",
  "Training",
  "Seminar",
  "Contest",
  "Performance",
  "Open Lesson",
  "Casting"
]

const COUNTRY_CODE_MAP: Record<string, string> = {
  'Moldova': 'MD', 'United States': 'US', 'United Kingdom': 'GB', 'Russia': 'RU', 'Romania': 'RO',
  'Germany': 'DE', 'France': 'FR', 'Spain': 'ES', 'Italy': 'IT', 'Poland': 'PL', 'Ukraine': 'UA',
  'Belarus': 'BY', 'Kazakhstan': 'KZ', 'China': 'CN', 'Japan': 'JP', 'Korea North': 'KP', 'Korea South': 'KR',
  'Turkey': 'TR', 'India': 'IN', 'Indonesia': 'ID', 'Brazil': 'BR', 'Canada': 'CA', 'Australia': 'AU',
  'Mexico': 'MX', 'Argentina': 'AR', 'Chile': 'CL', 'Colombia': 'CO', 'Peru': 'PE', 'Egypt': 'EG',
  'Israel': 'IL', 'Saudi Arabia': 'SA', 'United Arab Emirates': 'AE', 'Netherlands': 'NL', 'Sweden': 'SE',
  'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI', 'Switzerland': 'CH', 'Czech Republic': 'CZ', 'Slovakia': 'SK',
  'Slovenia': 'SI', 'Estonia': 'EE', 'Latvia': 'LV', 'Lithuania': 'LT', 'Bulgaria': 'BG', 'Greece': 'GR',
  'Portugal': 'PT', 'Ireland': 'IE', 'Iceland': 'IS', 'New Zealand': 'NZ', 'South Africa': 'ZA', 'Nigeria': 'NG',
  'Kenya': 'KE', 'Morocco': 'MA', 'Tunisia': 'TN', 'Algeria': 'DZ', 'Georgia': 'GE', 'Armenia': 'AM', 'Azerbaijan': 'AZ',
  'Mongolia': 'MN', 'Thailand': 'TH', 'Vietnam': 'VN', 'Philippines': 'PH', 'Singapore': 'SG', 'Malaysia': 'MY',
  'Pakistan': 'PK', 'Bangladesh': 'BD', 'Nepal': 'NP', 'Sri Lanka': 'LK', 'Austria': 'AT', 'Belgium': 'BE',
  'Hungary': 'HU', 'Croatia': 'HR', 'Serbia': 'RS', 'Bosnia and Herzegovina': 'BA', 'North Macedonia': 'MK',
  'Albania': 'AL', 'Montenegro': 'ME', 'Kosovo': 'XK', 'Cyprus': 'CY', 'Malta': 'MT', 'Luxembourg': 'LU'
}

const countryToFlagEmoji = (name?: string | null): string => {
  if (!name) {
    return '';
  }
  const code = COUNTRY_CODE_MAP[name]?.toUpperCase();
  if (!code || code.length !== 2) {
    return '';
  }
  const points = Array.from(code).map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Telegram", href: "https://telegram.org", icon: "telegram" },
  { label: "Discord", href: "https://discord.com", icon: "discord" },
  { label: "Twitter", href: "https://x.com", icon: "twitter" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
]

const MOVE_STYLES: MoveStyle[] = [
  {
    id: "hip-hop",
    label: "HIP-HOP",
    description: "Р“СЂСѓРІ, footwork Рё С„РёСЂРјРµРЅРЅС‹Рµ party steps.",
    icon: "HH",
    moves: [
      { id: "bounce", name: "Bounce", cost: 750 },
      { id: "body-roll", name: "Body Roll", cost: 1800 },
      { id: "hip-roll", name: "Hip Roll", cost: 4500 },
      { id: "chest-pop", name: "Chest Pop", cost: 11000 },
      { id: "shoulder-bounce", name: "Shoulder Bounce", cost: 27000 },
      { id: "arm-waves", name: "Arm Waves", cost: 67500 },
      { id: "point", name: "Point", cost: 168750 },
    ],
  },
  {
    id: "break-dance",
    label: "BREAK DANCE",
    description: "РџР°СѓСЌСЂ, С„СЂРёР·С‹ Рё РјРѕС‰РЅС‹Р№ floorwork.",
    icon: "BD",
    moves: [
      { id: "windmill", name: "Windmill", cost: 2000 },
      { id: "flare", name: "Flare", cost: 5000 },
      { id: "airflare", name: "Airflare", cost: 12500 },
      { id: "freeze", name: "Freeze", cost: 30000 },
      { id: "power-move", name: "Power Move", cost: 75000 },
      { id: "floorwork", name: "Floorwork", cost: 180000 },
      { id: "transition", name: "Transition", cost: 450000 },
    ],
  },
  {
    id: "popping",
    label: "POPPING",
    description: "РР·РѕР»СЏС†РёРё, С…РёС‚С‹ Рё СЂРѕР±РѕС‚РёРєР°.",
    icon: "PP",
    moves: [
      { id: "wave", name: "Wave", cost: 80 },
      { id: "tutting", name: "Tutting", cost: 200 },
      { id: "dime-stop", name: "Dime Stop", cost: 500 },
      { id: "robot", name: "Robot", cost: 1200 },
      { id: "glitch", name: "Glitch", cost: 3000 },
      { id: "isolation", name: "Isolation", cost: 7500 },
      { id: "hit", name: "Hit", cost: 18000 },
    ],
  },
]


const numberFormatter = new Intl.NumberFormat("ru-RU")
const formatNumber = (value: number) => numberFormatter.format(value)

const KEYBOARD_TAP_KEYS = new Set([" ", "Spacebar", "Enter"])

const SOCIAL_ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="17" cy="7" r="1.3" fill="currentColor" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M21 4.2L3.4 11.9c-.8.3-.8 1.5.1 1.8l4.2 1.4 1.5 4.3c.3.9 1.4 1.1 2 .4l2.2-2.3 4.3 3.1c.7.5 1.7.1 1.9-.7l2.8-13.8c.2-.9-.7-1.6-1.4-1.3zM9.8 13.6l8.2-5.3-5.7 6.3c-.2.2-.3.5-.3.8l-.2 2-1-2.7c-.1-.4-.4-.7-.8-.8z"
      />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20 4.8a15.8 15.8 0 00-4-1.3h-.1c-.2.5-.4 1-.5 1.5a15.7 15.7 0 00-6.4 0 8 8 0 00-.5-1.5h-.1a16 16 0 00-4.1 1.3 20.7 20.7 0 00-4 13.6 16.5 16.5 0 005.1 2.5h.1c.4-.7.8-1.4 1.1-2.1l-.3-.2a.1.1 0 01.1-.1c2.8 1.3 5.7 1.3 8.4 0a.1.1 0 01.1.1l-.3.2c.3.7.7 1.4 1.1 2.1h.1a16.3 16.3 0 005.1-2.5 20.6 20.6 0 00-4-13.6zM8.7 15.3c-.9 0-1.6-.8-1.6-1.7s.7-1.7 1.6-1.7 1.6.8 1.6 1.7-.7 1.7-1.6 1.7zm6.6 0c-.9 0-1.6-.8-1.6-1.7s.7-1.7 1.6-1.7 1.6.8 1.6 1.7-.7 1.7-1.6 1.7z"
      />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M3 5.5l7.5 6.5L3.5 18h3l5.1-4.4L17.2 18h3.3l-8-6.9 7.6-5.6h-3l-4.8 4.2-5.3-4.2H3z"
      />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  ),
}

function getSocialIcon(icon: string) {
  return SOCIAL_ICONS[icon as keyof typeof SOCIAL_ICONS] || null
}

function App() {
  const [view, setView] = useState<View>("stage")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
  const [lifetimeScore, setLifetimeScore] = useState(0)
  const [balance, setBalance] = useState(0)
  const [ownedMoves, setOwnedMoves] = useState<string[]>([])
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle")
  const [authError, setAuthError] = useState<string | null>(null)
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false)

  const [isInvoicePending, setIsInvoicePending] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  const ru = RU



  const tapButtonRef = useRef<HTMLDivElement | null>(null)
  const floatingIdRef = useRef(0)
  const isInitializedRef = useRef(false)
  const isAuthenticatingRef = useRef(false)

  const tapPower = useMemo(() => {
    const moveBonus = ownedMoves.length * TAP_POWER_DIMINISHING
    return Math.floor(BASE_TAP_POINTS + Math.pow(moveBonus, 0.85))
  }, [ownedMoves.length])

  const level = useMemo(() => {
    let currentLevel = 1
    let totalRequired = 0
    let currentScore = lifetimeScore

    while (currentScore >= 0) {
      const levelThreshold = Math.floor(BASE_LEVEL_THRESHOLD * Math.pow(LEVEL_SCALING_FACTOR, currentLevel - 1))
      if (currentScore < levelThreshold) break
      currentScore -= levelThreshold
      totalRequired += levelThreshold
      currentLevel++
    }

    return currentLevel
  }, [lifetimeScore])

  const levelProgress = useMemo(() => {
    let currentLevel = 1
    let currentScore = lifetimeScore

    while (currentScore >= 0) {
      const levelThreshold = Math.floor(BASE_LEVEL_THRESHOLD * Math.pow(LEVEL_SCALING_FACTOR, currentLevel - 1))
      if (currentScore < levelThreshold) {
        return currentScore / levelThreshold
      }
      currentScore -= levelThreshold
      currentLevel++
    }

    return 0
  }, [lifetimeScore])

  const selectedStyle = useMemo(
    () => MOVE_STYLES.find((style) => style.id === selectedStyleId) ?? null,
    [selectedStyleId],
  )

  const authenticateWithTelegram = useCallback(async () => {
    // Prevent duplicate authentication calls
    if (isAuthenticatingRef.current) {
      console.log('[AUTH] Authentication already in progress, skipping...')
      return
    }
    isAuthenticatingRef.current = true

    console.log('[AUTH] Starting Telegram authentication...')
    
    const webApp = window.Telegram?.WebApp
    if (!webApp) {
      console.error("[AUTH] Telegram WebApp API is not available")
      setAuthStatus("unsupported")
      setAuthError("Telegram WebApp API is not available. Open the bot directly from Telegram.")
      isAuthenticatingRef.current = false
      return
    }

    console.log("[AUTH] Telegram WebApp is available:", {
      hasInitData: !!webApp.initData,
      initDataLength: webApp.initData?.length || 0,
      hasInitDataUnsafe: !!webApp.initDataUnsafe,
      hasUser: !!webApp.initDataUnsafe?.user
    })

    let initPayload: ValidatedTelegramAuthData
    try {
      initPayload = getTelegramInitData(webApp)
      console.log("[AUTH] Telegram init data validated successfully:", {
        hasInitData: !!initPayload.initData,
        authDate: initPayload.authDate,
        hasHash: !!initPayload.hash,
        userId: initPayload.user.id
      })
    } catch (error) {
      console.error("[AUTH] Telegram init data validation failed", error)
      setAuthStatus("error")
      setAuthError(error instanceof TelegramAuthError ? error.message : "Failed to validate Telegram init data.")
      isAuthenticatingRef.current = false
      return
    }

    setAuthStatus("loading")
    setAuthError(null)

    try {
      const apiUrl = resolveApiUrl("/api/auth/telegram")
      console.log("[AUTH] Sending auth request to:", apiUrl)
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: initPayload.initData }),
      })

      console.log("[AUTH] Auth response received:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      const payload = await response.json().catch(() => ({})) as AuthResponse
      console.log("[AUTH] Auth response payload:", payload)
      
      if (!response.ok || !payload.ok || !payload.sessionToken) {
        const message = payload.error ?? `Telegram login failed (status ${response.status}).`
        console.error("[AUTH] Authentication failed:", message)
        throw new Error(message)
      }

      console.log("[AUTH] Authentication successful:", {
        hasSessionToken: !!payload.sessionToken,
        hasUser: !!payload.user,
        userId: payload.user?.id
      })

      setSessionToken(payload.sessionToken)
      sessionStorage.setItem(STORAGE_KEY_SESSION, payload.sessionToken)
      if (payload.user) {
        setTelegramUser(payload.user)
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(payload.user))
      } else {
        setTelegramUser(null)
        sessionStorage.removeItem(STORAGE_KEY_USER)
      }
      setAuthStatus("authenticated")
      setAuthError(null)
    } catch (error) {
      console.error("[AUTH] Telegram auth failed", error)
      setAuthStatus("error")
      setAuthError(error instanceof Error ? error.message : "Telegram authorization failed.")
      setTelegramUser(null)
      sessionStorage.removeItem(STORAGE_KEY_USER)
    } finally {
      isAuthenticatingRef.current = false
    }
  }, [])

  useEffect(() => {
    // Prevent double initialization in development (StrictMode) and HMR
    if (isInitializedRef.current) {
      console.log('[APP INIT] Already initialized, skipping...')
      return
    }
    isInitializedRef.current = true

    console.log('[APP INIT] Starting Telegram WebApp initialization...')
    
    const webApp = window.Telegram?.WebApp
    if (!webApp) {
      console.error("[APP INIT] Telegram WebApp API is not available in useEffect")
      setAuthStatus("unsupported")
      setAuthError("Telegram WebApp API is not available. Open the bot directly from Telegram.")
      return
    }

    console.log("[APP INIT] Telegram WebApp found, initializing...")
    webApp.ready()
    webApp.expand() // Use full-height viewport provided by Telegram

    const cachedToken = sessionStorage.getItem(STORAGE_KEY_SESSION)
    console.log("[APP INIT] Checking cached token:", {
      hasCachedToken: !!cachedToken,
      tokenLength: cachedToken?.length || 0
    })
    
    if (cachedToken) {
      console.log("[APP INIT] Using cached session token")
      setSessionToken(cachedToken)
      setAuthStatus("authenticated")
      setAuthError(null)

      const cachedUserRaw = sessionStorage.getItem(STORAGE_KEY_USER)
      if (cachedUserRaw) {
        try {
          const parsedUser = JSON.parse(cachedUserRaw) as TelegramUser
          console.log("[APP INIT] Using cached user:", {
            userId: parsedUser.id,
            firstName: parsedUser.firstName
          })
          setTelegramUser(parsedUser)
        } catch (parseError) {
          console.warn("[APP INIT] Failed to parse cached Telegram user", parseError)
          sessionStorage.removeItem(STORAGE_KEY_USER)
          setTelegramUser(null)
        }
      } else {
        console.log("[APP INIT] No cached user found")
        setTelegramUser(null)
      }

      return
    }

    console.log("[APP INIT] No cached token found, starting authentication...")
    void authenticateWithTelegram()

    // Cleanup function for HMR and component unmount
    return () => {
      console.log("[APP INIT] Cleanup - resetting initialization flag")
      isInitializedRef.current = false
    }
  }, [authenticateWithTelegram])

  // Load events from localStorage
  useEffect(() => {
    console.log('[EVENTS] Loading events from localStorage...')
    
    const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS)

    if (!savedEvents) {
      console.log('[EVENTS] No saved events found')
      return
    }

    try {
      const parsed = JSON.parse(savedEvents) as unknown

      if (!Array.isArray(parsed)) {
        console.warn('[EVENTS] Saved events is not an array, ignoring')
        return
      }



      const normalized: Event[] = []



      parsed.forEach((item) => {

        if (typeof item !== "object" || item === null) {

          return

        }



        const record = item as Partial<Event> & { location?: string }

        const identifier =

          typeof record.id === "string"

            ? record.id

            : `legacy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`



        const instagramHandle =

          typeof record.instagram === "string"

            ? record.instagram.replace(/^@+/, "").trim()

            : ""



        const priceInfo =

          typeof record.priceRange === "string" ? record.priceRange.trim() : ""



        normalized.push({

          id: identifier,

          title: typeof record.title === "string" ? record.title : "Р‘РµР· РЅР°Р·РІР°РЅРёСЏ",

          description: typeof record.description === "string" ? record.description : "",

          category: typeof record.category === "string" ? record.category : EVENT_CATEGORIES[0],

          country: typeof record.country === "string" ? record.country : "",

          city:

            typeof record.city === "string"

              ? record.city

              : typeof record.location === "string"

                ? record.location

                : "",

          date: typeof record.date === "string" ? record.date : "",

          time: typeof record.time === "string" ? record.time : "",

          imageData: typeof record.imageData === "string" ? record.imageData : "",

          instagram: instagramHandle ? instagramHandle : undefined,

          priceRange: priceInfo ? priceInfo : undefined,

          createdBy: typeof record.createdBy === "string" ? record.createdBy : "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ",

          createdAt:

            typeof record.createdAt === "string"

              ? record.createdAt

              : new Date().toISOString(),

        })

      })



      setEvents(normalized)
      console.log(`[EVENTS] Successfully loaded ${normalized.length} events from localStorage`)
    } catch (error) {
      console.error("[EVENTS] Failed to parse saved events:", error)
    }

  }, [])

  const initiateInvoice = useCallback(async (move: Move) => {
    if (!sessionToken) {
      setAuthError("Р С’Р Р†РЎвЂљР С•РЎР‚Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ Р Р…Р Вµ Р Р…Р В°Р в„–Р Т‘Р ВµР Р…Р В°. Р СџР ВµРЎР‚Р ВµР В·Р В°Р С—РЎС“РЎРѓРЎвЂљР С‘РЎвЂљР Вµ Р СР С‘Р Р…Р С‘-Р С—РЎР‚Р С‘Р В»Р С•Р В¶Р ВµР Р…Р С‘Р Вµ.")
      return
    }

    const webApp = window.Telegram?.WebApp
    if (!webApp) {
      setAuthError("Р С›Р С—Р В»Р В°РЎвЂљР В° Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р Р…Р В° РЎвЂљР С•Р В»РЎРЉР С”Р С• Р Р†Р Р…РЎС“РЎвЂљРЎР‚Р С‘ Telegram.")
      return
    }

    setIsInvoicePending(true)
    setAuthError(null)

    try {
      const response = await fetch(resolveApiUrl("/api/telegram/payments/invoice"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, moveId: move.id }),
      })

      const payload = await response.json().catch(() => ({})) as InvoiceResponse
      if (!response.ok || !payload.ok || !payload.invoiceUrl) {
        const message = payload.error ?? `Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ РЎРѓР С•Р В·Р Т‘Р В°РЎвЂљРЎРЉ РЎРѓРЎвЂЎРЎвЂРЎвЂљ (Р С”Р С•Р Т‘ ${response.status}).`
        throw new Error(message)
      }

      webApp.openInvoice(payload.invoiceUrl, (status: string) => {
        if (status === "paid") {
          setOwnedMoves((prev) => (prev.includes(move.id) ? prev : [...prev, move.id]))
          webApp.showAlert(`Р С™Р С•Р СР В±Р С• ${move.name} РЎвЂљР ВµР С—Р ВµРЎР‚РЎРЉ РЎвЂљР Р†Р С•РЎвЂ!`)
        } else if (status === "cancelled") {
          webApp.showAlert("Р С›Р С—Р В»Р В°РЎвЂљР В° Р С•РЎвЂљР СР ВµР Р…Р ВµР Р…Р В°.")
        } else if (status === "failed") {
          webApp.showAlert("Р С›Р С—Р В»Р В°РЎвЂљР В° Р Р…Р Вµ Р С—РЎР‚Р С•РЎв‚¬Р В»Р В°, Р С—Р С•Р С—РЎР‚Р С•Р В±РЎС“Р в„–РЎвЂљР Вµ Р ВµРЎвЂ°РЎвЂ РЎР‚Р В°Р В·.")
        }
      })
    } catch (error) {
      console.error("Failed to initiate invoice", error)
      setAuthError(error instanceof Error ? error.message : "Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ Р С‘Р Р…Р С‘РЎвЂ Р С‘Р С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉ Р С•Р С—Р В»Р В°РЎвЂљРЎС“.")
    } finally {
      setIsInvoicePending(false)
    }
  }, [sessionToken])

  const handleTap = useCallback((x: number, y: number) => {
    // Add vibration for mobile feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    setBalance((prev) => prev + tapPower)
    setLifetimeScore((prev) => prev + tapPower)

    floatingIdRef.current += 1
    const floating: FloatingScore = {
      id: floatingIdRef.current,
      value: tapPower,
      x,
      y,
    }

    setFloatingScores((prev) => [...prev, floating])
  }, [tapPower])

  const handlePointerTap = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    handleTap(x, y)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!KEYBOARD_TAP_KEYS.has(event.key)) {
      return
    }
    event.preventDefault()
    handleTap(50, 50)
  }


  useEffect(() => {
    if (floatingScores.length === 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setFloatingScores((prev) => prev.slice(1))
    }, FLOATING_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [floatingScores])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false)
        setView("stage")
        setSelectedStyleId(null)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  // Clear floating scores when leaving the stage view
  useEffect(() => {
    if (view !== "stage") {
      setFloatingScores([])
    }
  }, [view])

  const handleBuyMove = (move: Move) => {
    if (ownedMoves.includes(move.id) || isInvoicePending) {
      return
    }

    if (sessionToken && authStatus === "authenticated") {
      void initiateInvoice(move)
      return
    }

    if (balance < move.cost) {
      setAuthError("Р СњР ВµР Т‘Р С•РЎРѓРЎвЂљР В°РЎвЂљР С•РЎвЂЎР Р…Р С• Flow. Р СџР С•Р С—РЎР‚Р С•Р В±РЎС“Р в„–РЎвЂљР Вµ Р Р…Р В°Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р ВµРЎвЂ°РЎвЂ Р С•РЎвЂЎР С”Р С‘.")
      return
    }

    setBalance((prev) => prev - move.cost)
    setOwnedMoves((prev) => [...prev, move.id])
  }

  const handleShowShop = (styleId: string) => {
    setSelectedStyleId(styleId)
    setView("shop")
    setIsSidebarOpen(false)
  }

  const handleShowStyles = () => {
    setView("styles")
    setSelectedStyleId(null)
  }

  const handleBackToStage = () => {
    setView("stage")
    setSelectedStyleId(null)
  }

  const handleShowEvents = () => {
    setView("events")
    setIsSidebarOpen(false)
  }

  const handleAddEvent = (event: Event) => {
    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents))
  }

  const getEventTimestamp = (event: Event) => {

    if (!event.date) {

      return 0

    }



    const timePart = event.time ? event.time : "00:00"

    const composed = `${event.date}T${timePart}`

    const timestamp = Date.parse(composed)

    if (!Number.isNaN(timestamp)) {

      return timestamp

    }



    return Date.parse(event.date)

  }



  const formatEventDate = (event: Event) => {

    if (!event.date) {

      return "Р”Р°С‚Р° РЅРµ СѓРєР°Р·Р°РЅР°"

    }



    const timePart = event.time ? event.time : "00:00"

    const date = new Date(`${event.date}T${timePart}`)

    if (Number.isNaN(date.getTime())) {

      return event.date

    }



    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date)

  }



  const renderStage = () => (
    <div
      ref={tapButtonRef}
      role="button"
      tabIndex={0}
      className="landing__tap"
      onPointerDown={handlePointerTap}
      onKeyDown={handleKeyDown}
    >
      <div className="landing__avatar">
        <img src={heroImage} alt="Flow Force dancer" className="landing__character" />
        {floatingScores.map((floating) => (
          <span
            key={floating.id}
            className="landing__score"
            style={{ left: `${floating.x}%`, top: `${floating.y}%` }}
          >
            +{floating.value}
          </span>
        ))}
      </div>
      <p className="landing__cta">{ru.common.cta}</p>
    </div>
  )

const renderStyles = () => (
    <div className="moves" role="region" aria-live="polite">
      <h2 className="moves__title">{ru.common.movesTitle}</h2>
      <div className="moves__grid">
        {MOVE_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            className="moves__card"
            onClick={() => handleShowShop(style.id)}
          >
            <span className="moves__card-label">{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

const renderShop = () => {
    if (!selectedStyle) {
      return null
    }

    return (
      <div className="moves" role="region" aria-live="polite">
        <div className="moves__style">
          <h2 className="moves__title">{selectedStyle.label}</h2>
        </div>
        <div className="moves__list">
          {selectedStyle.moves.map((move) => (
            <article key={move.id} className="moves__item">
              <div className="moves__item-info">
                <h3 className="moves__item-name">{move.name}</h3>
                <p className="moves__item-meta">
                  {ru.common.costLabel} <span className="moves__item-cost">{formatNumber(move.cost)} FLOW</span>
                </p>
              </div>
              <button
                type="button"
                className="moves__buy"
                onClick={() => handleBuyMove(move)}
                disabled={
                  ownedMoves.includes(move.id) ||
                  Boolean(sessionToken && authStatus === "authenticated" && isInvoicePending)
                }
              >
                {ownedMoves.includes(move.id)
                  ? ru.common.buttonPurchased
                  : sessionToken
                    ? ru.common.buttonBuy
                    : ru.common.buttonExchange}
              </button>
            </article>
          ))}
        </div>
      </div>
    )
  }

const renderEvents = () => (
  <div className="events" role="region" aria-live="polite">
    <div className="events__header">
      <h2 className="events__title">{ru.events.title}</h2>
      <button
        type="button"
        className="events__add-button"
        onClick={() => setIsEventModalOpen(true)}
      >
        {ru.events.addButton}
      </button>
    </div>

    <EventModal
      isOpen={isEventModalOpen}
      onClose={() => setIsEventModalOpen(false)}
      onAddEvent={handleAddEvent}
    />

    {events.length === 0 ? (
      <p className="events__empty">{ru.events.empty}</p>
    ) : (
      <div className="events__grid">
        {events
          .slice()
          .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
          .map((event) => {
            const timestamp = getEventTimestamp(event)
            const hasDate = Number.isFinite(timestamp) && timestamp !== 0
            const formattedDate = hasDate ? formatEventDate(event) : ru.common.dateFallback
            const flagEmoji = countryToFlagEmoji(event.country)
            const locationLabel = [event.country, event.city].filter(Boolean).join(', ')
            const instagramHandle = event.instagram ? event.instagram.replace(/^@+/, '') : ''
            const instagramHref = instagramHandle ? `https://instagram.com/${instagramHandle}` : ''

            return (
              <article key={event.id} className="event-card">
                <div className="event-card__image-wrapper">
                  {event.imageData ? (
                    <img
                      src={event.imageData}
                      alt={`${ru.common.eventPosterAlt} ${event.title}`}
                      className="event-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="event-card__image event-card__image--placeholder">
                      <span>{ru.common.noImage}</span>
                    </div>
                  )}
                  <span className="event-card__badge">{event.category.toUpperCase()}</span>
                </div>
                <div className="event-card__body">
                  <h3 className="event-card__title">{event.title}</h3>
                  {locationLabel && (
                    <div className="event-card__location">
                      {flagEmoji && <span aria-hidden="true">{flagEmoji}</span>}
                      <span>{locationLabel}</span>
                    </div>
                  )}
                  <div className="event-card__meta">
                    <div className="event-card__meta-item">
                      <span aria-hidden="true" className="event-card__emoji">рџ“…</span>
                      <span>{formattedDate}</span>
                    </div>
                    {event.time && (
                      <div className="event-card__meta-item">
                        <span aria-hidden="true" className="event-card__emoji">вЏ°</span>
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.priceRange && (
                      <div className="event-card__meta-item event-card__meta-item--price">
                        <span aria-hidden="true" className="event-card__emoji">рџ’µ</span>
                        <span>{event.priceRange}</span>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="event-card__description">{event.description}</p>
                  )}
                  {instagramHandle && (
                    <a
                      className="event-card__instagram"
                      href={instagramHref}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      @{instagramHandle}
                    </a>
                  )}
                  <div className="event-card__footer">
                    <span>{ru.common.createdByPrefix}{event.createdBy}</span>
                    <span>{new Date(event.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </article>
            )
          })}
      </div>
    )}
  </div>
)


  return (

    <div className="app">
      <main className="landing">
        <header className="landing__header">
          <div className="landing__metrics">
            <div className="landing__metric">
              <span className="landing__metric-label">Flow</span>
              <span className="landing__metric-value">{formatNumber(balance)}</span>
            </div>
            <div className="landing__metric">
              <span className="landing__metric-label">LVL</span>
              <span className="landing__metric-value">{level}</span>
            </div>
            <div className="landing__metric">
              <span className="landing__metric-label">Power</span>
              <span className="landing__metric-value">+{tapPower}</span>
            </div>
          </div>
          <div className="landing__progress" role="progressbar" aria-valuenow={Math.round(levelProgress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span className="landing__progress-fill" style={{ width: `${Math.round(levelProgress * 100)}%` }} />
          </div>
          <div className="landing__controls">
            {view !== "stage" ? (
              <button
                type="button"
                className="landing__control"
                onClick={handleBackToStage}
              >
                {ru.common.back}
              </button>
            ) : null}
            <button
              type="button"
              className="landing__control"
              onClick={() => setIsLogPanelOpen(true)}
              aria-expanded={isLogPanelOpen}
              aria-controls="logs-panel"
            >
              {ru.common.logs}
            </button>
            <button
              type="button"
              className="landing__control"
              onClick={() => setIsSidebarOpen(true)}
              aria-expanded={isSidebarOpen}
            >
              {ru.common.menu}
            </button>
          </div>
        </header>

        <section className="landing__stage">
          {view === "stage" ? renderStage() : null}
          {view === "styles" ? renderStyles() : null}
          {view === "shop" ? renderShop() : null}
          {view === "events" ? renderEvents() : null}
        </section>

        {view === "stage" ? (
          <div className="landing__actions">
            <button type="button" className="landing__moves" onClick={handleShowStyles}>
              {ru.common.catalog}
            </button>
          </div>
        ) : null}
      </main>

      <aside className={`sidebar${isSidebarOpen ? " sidebar--open" : ""}`} aria-hidden={!isSidebarOpen}>
        <div className="sidebar__inner">
          <div className="sidebar__brand">
            <img src={flowForceLogo} alt="Flow Force" className="sidebar__logo" />
            <p className="sidebar__title">Flow Force</p>
          </div>
          <ul className="sidebar__list">
            {ru.events.sidebar.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <footer className="sidebar__footer">
            <button
              type="button"
              className="sidebar__events"
              onClick={handleShowEvents}
            >
              {ru.events.title}
            </button>
          </footer>
          <ul className="sidebar__social">
            {SOCIAL_LINKS.map(({ icon, href, label }) => (
              <li key={icon}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {getSocialIcon(icon)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {isSidebarOpen ? (
        <button type="button" className="sidebar__scrim" aria-label="Р вЂ”Р В°Р С”РЎР‚РЎвЂ№РЎвЂљРЎРЉ" onClick={() => setIsSidebarOpen(false)} />
      ) : null}
      {isLogPanelOpen ? (
        <div className="log-panel" role="dialog" aria-modal="true" aria-labelledby="log-panel-title" id="logs-panel">
          <button
            type="button"
            className="log-panel__backdrop"
            aria-label={ru.common.logsClose}
            onClick={() => setIsLogPanelOpen(false)}
          />
          <div className="log-panel__content">
            <header className="log-panel__header">
              <h2 className="log-panel__title" id="log-panel-title">{ru.common.logsTitle}</h2>
              <button
                type="button"
                className="log-panel__close"
                onClick={() => setIsLogPanelOpen(false)}
              >
                {ru.common.logsClose}
              </button>
            </header>
            <div className="log-panel__body">
              <dl className="log-panel__meta">
                <div>
                  <dt>{ru.common.logsAuthStatus}</dt>
                  <dd style={{ color: authStatus === 'authenticated' ? 'green' : authStatus === 'error' ? 'red' : 'orange' }}>
                    {authStatus}
                  </dd>
                </div>
                <div>
                  <dt>{ru.common.logsSession}</dt>
                  <dd style={{ wordBreak: 'break-all', fontSize: '10px' }}>
                    {sessionToken ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt>{ru.common.logsError}</dt>
                  <dd style={{ color: 'red', wordBreak: 'break-word' }}>
                    {authError ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt>API URL</dt>
                  <dd style={{ wordBreak: 'break-all', fontSize: '10px' }}>
                    {API_BASE_URL}
                  </dd>
                </div>
              </dl>
              <section className="log-panel__section">
                <h3 className="log-panel__section-title">Telegram</h3>
                {telegramUser ? (
                  <pre className="log-panel__code">{JSON.stringify(telegramUser, null, 2)}</pre>
                ) : (
                  <p className="log-panel__empty">{ru.common.logsEmpty}</p>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App















