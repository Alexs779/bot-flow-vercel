import "dotenv/config"
import { createApp } from "./app"

const botToken = process.env.BOT_TOKEN ?? ""
const jwtSecret = process.env.JWT_SECRET ?? ""
const port = Number.parseInt(process.env.PORT ?? "3000", 10)

if (!botToken) {
  throw new Error("BOT_TOKEN environment variable is required.")
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required.")
}

const app = createApp({ botToken, jwtSecret })

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`)
})
