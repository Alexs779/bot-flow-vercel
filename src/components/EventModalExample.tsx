import { useState } from "react"

import { RU } from "../i18n/ru"
import EventModal from "./EventModal"

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

export default function EventModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  const ruModal = RU.modal
  const ruEvents = RU.events

  const handleAddEvent = (event: Event) => {
    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    localStorage.setItem("bot-dance:events", JSON.stringify(updatedEvents))
    console.log(`${ruModal.consoleLogLabel}`, event)
  }

  return (
    <div style={{ padding: "20px", background: "#050507", minHeight: "100vh" }}>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: "14px 32px",
          borderRadius: "999px",
          background: "linear-gradient(120deg, #ff6f91, #4fd1c5)",
          color: "#050507",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          border: "none",
          cursor: "pointer",
          fontSize: "0.9rem"
        }}
      >
        {ruEvents.addButton}
      </button>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {events.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#ffffff", marginBottom: "15px" }}>{ruModal.addedListTitle}</h3>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff"
              }}
            >
              <strong style={{ color: "#4fd1c5", display: "block", marginBottom: "8px" }}>{event.title}</strong>
              <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                {event.country}, {event.city}
              </div>
              <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                {event.category} • {new Date(`${event.date}T${event.time}`).toLocaleString("ru-RU")}
              </div>
              {event.instagram && (
                <div style={{ fontSize: "0.8rem", marginTop: "6px", color: "#ff6f91" }}>
                  @{event.instagram}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


