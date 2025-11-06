import { useEffect, useRef } from 'react'
import './LogPanel.css'

type LogLevel = 'info' | 'error' | 'warning' | 'success'
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unsupported' | 'error'

export type LogEntry = {
  timestamp: string
  message: string
  level: LogLevel
}

type TelegramUser = {
  id: number
  firstName: string
  lastName?: string
  username?: string
  avatar?: string
}

interface LogPanelProps {
  logs: LogEntry[]
  onClose: () => void
  authStatus: AuthStatus
  authError: string | null
  sessionToken: string | null
  apiBaseUrl: string
  telegramUser: TelegramUser | null
}

const LogPanel: React.FC<LogPanelProps> = ({
  logs,
  onClose,
  authStatus,
  authError,
  sessionToken,
  apiBaseUrl,
  telegramUser
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [logs])

  const getAuthStatusColor = (status: AuthStatus): string => {
    switch (status) {
      case 'authenticated': return '#00C851'
      case 'error': return '#ff4444'
      case 'idle': return '#888'
      case 'loading': return '#ffbb33'
      case 'unsupported': return '#ff4444'
      default: return '#888'
    }
  }

  return (
    <div className="log-panel">
      <div className="log-panel-header">
        <span className="log-panel-title">Debug Logs</span>
        <button className="log-panel-close" onClick={onClose}>×</button>
      </div>
      <div className="log-content" ref={contentRef}>
        {/* Auth Status Section */}
        <div className="log-section">
          <h3 className="log-section-title">Authentication Status</h3>
          <div className="log-info-grid">
            <div className="log-info-item">
              <span className="log-info-label">Status:</span>
              <span className="log-info-value" style={{ color: getAuthStatusColor(authStatus) }}>
                {authStatus}
              </span>
            </div>
            {authError && (
              <div className="log-info-item">
                <span className="log-info-label">Error:</span>
                <span className="log-info-value log-line--error">{authError}</span>
              </div>
            )}
            {sessionToken && (
              <div className="log-info-item">
                <span className="log-info-label">Session:</span>
                <span className="log-info-value log-token">{sessionToken}</span>
              </div>
            )}
            <div className="log-info-item">
              <span className="log-info-label">API URL:</span>
              <span className="log-info-value log-url">{apiBaseUrl || '(not set)'}</span>
            </div>
          </div>
        </div>

        {/* Telegram User Section */}
        {telegramUser && (
          <div className="log-section">
            <h3 className="log-section-title">Telegram User</h3>
            <pre className="log-code">
              {JSON.stringify(telegramUser, null, 2)}
            </pre>
          </div>
        )}

        {/* Log Messages Section */}
        <div className="log-section">
          <h3 className="log-section-title">Log Messages</h3>
          {logs.length === 0 ? (
            <div className="log-empty">No logs available</div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={`${log.timestamp}-${index}`} 
                className={`log-line log-line--${log.level}`}
              >
                <span className="log-timestamp">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LogPanel