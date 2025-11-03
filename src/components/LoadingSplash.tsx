import "./LoadingSplash.css"
import flowForceLogo from "../assets/images/flow-force-logo.png"
import Spinner from "./Spinner"

type LoadingSplashProps = {
  message?: string
}

export default function LoadingSplash({ message = "Проверяем данные..." }: LoadingSplashProps) {
  return (
    <div className="loading-splash" role="status" aria-busy="true">
      <div className="loading-splash__content">
        <img src={flowForceLogo} alt="Flow Force" className="loading-splash__logo" />
        <Spinner size="large" className="loading-splash__spinner" />
        <p className="loading-splash__message">{message}</p>
      </div>
    </div>
  )
}