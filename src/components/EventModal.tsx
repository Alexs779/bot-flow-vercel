import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent } from "react"

import "./EventModal.css"
import { RU } from "../i18n/ru"

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

type EventModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddEvent: (event: Event) => void
}

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
  "Casting",
]

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North", "Korea South", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
]

const MAX_COUNTRY_SUGGESTIONS = 12

const EMPTY_EVENT = {
  title: "",
  category: EVENT_CATEGORIES[0],
  country: "",
  city: "",
  date: "",
  time: "",
  instagram: "",
  priceRange: "",
  imageData: "",
}

type EventDraft = typeof EMPTY_EVENT

export default function EventModal({ isOpen, onClose, onAddEvent }: EventModalProps) {
  const ru = RU.modal
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<EventDraft>(EMPTY_EVENT)
  const [imageName, setImageName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isCountryListOpen, setIsCountryListOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_EVENT)
      setImageName("")
      setError(null)
      setIsCountryListOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [isOpen])

  const filteredCountries = useMemo(() => {
    const query = form.country.trim().toLowerCase()
    if (!query) {
      return COUNTRIES.slice(0, MAX_COUNTRY_SUGGESTIONS)
    }

    return COUNTRIES.filter((country) => country.toLowerCase().includes(query)).slice(
      0,
      MAX_COUNTRY_SUGGESTIONS,
    )
  }, [form.country])

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError(ru.errors.image)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, imageData: reader.result as string }))
        setImageName(file.name)
        setError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageData: "" }))
    setImageName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSelectCountry = (country: string) => {
    setForm((prev) => ({ ...prev, country }))
    setIsCountryListOpen(false)
  }

  const handleAddEvent = () => {
    if (!form.title.trim() || !form.country.trim() || !form.city.trim() || !form.date || !form.time) {
      setError(ru.errors.fields)
      return
    }

    const instagramHandle = form.instagram.trim().replace(/^@+/, "")
    const priceInfo = form.priceRange.trim()

    const event: Event = {
      id: Date.now().toString(),
      title: form.title.trim(),
      description: "",
      category: form.category,
      country: form.country.trim(),
      city: form.city.trim(),
      date: form.date,
      time: form.time,
      imageData: form.imageData,
      instagram: instagramHandle ? instagramHandle : undefined,
      priceRange: priceInfo ? priceInfo : undefined,
      createdBy: ru.createdBy,
      createdAt: new Date().toISOString(),
    }

    onAddEvent(event)
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const isSubmitDisabled =
    !form.imageData ||
    !form.title.trim() ||
    !form.country.trim() ||
    !form.city.trim() ||
    !form.date ||
    !form.time

  return (
    <>
      <div className="event-modal__scrim" onClick={onClose} />
      <div className="event-modal">
        <div className="event-modal__inner">
          <div className="event-modal__header">
            <h2 className="event-modal__title">{ru.title}</h2>
            <button
              type="button"
              className="event-modal__close"
              onClick={onClose}
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          {error && <div className="event-modal__error">{error}</div>}

          <div className="event-modal__content">
            <div className="event-modal__field">
              <span className="event-modal__label">{ru.imageLabel}</span>
              <label className={`event-modal__upload${form.imageData ? " event-modal__upload--filled" : ""}`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="event-modal__file-input"
                  onChange={handleImageChange}
                />
                {form.imageData ? (
                  <div className="event-modal__image-preview">
                    <img src={form.imageData} alt={ru.imagePreviewAlt} />
                    <div className="event-modal__image-meta">
                      <span className="event-modal__image-name">{imageName || "Выбранное изображение"}</span>
                      <button type="button" className="event-modal__clear-image" onClick={handleRemoveImage}>
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="event-modal__upload-placeholder">
                    <span>{ru.imagePlaceholder}</span>
                    <span className="event-modal__upload-hint">{ru.imageHint}</span>
                  </div>
                )}
              </label>
            </div>

            <div className="event-modal__field">
              <label className="event-modal__label" htmlFor="event-title">{ru.titleLabel}</label>
              <input
                id="event-title"
                name="title"
                className="event-modal__input"
                placeholder={ru.titlePlaceholder}
                value={form.title}
                onChange={handleInputChange}
                maxLength={80}
                autoComplete="off"
              />
            </div>


            <div className="event-modal__grid">
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="event-country">{ru.countryLabel}</label>
                <input
                  id="event-country"
                  name="country"
                  className="event-modal__input"
                  placeholder={ru.countryPlaceholder}
                  value={form.country}
                  onChange={(event) => {
                    handleInputChange(event)
                    setIsCountryListOpen(true)
                  }}
                  onFocus={() => setIsCountryListOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsCountryListOpen(false), 120)}
                  autoComplete="off"
                />
                {isCountryListOpen && filteredCountries.length > 0 && (
                  <div className="event-modal__dropdown">
                    {filteredCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        className="event-modal__dropdown-item"
                        onMouseDown={() => handleSelectCountry(country)}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="event-city">{ru.cityLabel}</label>
                <input
                  id="event-city"
                  name="city"
                  className="event-modal__input"
                  placeholder={ru.cityPlaceholder}
                  value={form.city}
                  onChange={handleInputChange}
                  maxLength={60}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="event-modal__grid">
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="event-date">{ru.dateLabel}</label>
                <input
                  id="event-date"
                  name="date"
                  type="date"
                  className="event-modal__input"
                  value={form.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="event-time">{ru.timeLabel}</label>
                <input
                  id="event-time"
                  name="time"
                  type="time"
                  className="event-modal__input"
                  value={form.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="event-modal__grid">
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="event-category">{ru.categoryLabel}</label>
                <select
                  id="event-category"
                  name="category"
                  className="event-modal__input event-modal__input--select"
                  value={form.category}
                  onChange={handleInputChange}
                >
                  {EVENT_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="event-modal__field">
                <label className="event-modal__label" htmlFor="event-instagram">{ru.instagramLabel}</label>
                <input
                  id="event-instagram"
                  name="instagram"
                  className="event-modal__input"
                  placeholder={ru.instagramPlaceholder}
                  value={form.instagram}
                  onChange={handleInputChange}
                  maxLength={60}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="event-modal__field">
              <label className="event-modal__label" htmlFor="event-price">{ru.priceLabel}</label>
              <input
                id="event-price"
                name="priceRange"
                className="event-modal__input"
                placeholder={ru.pricePlaceholder}
                value={form.priceRange}
                onChange={handleInputChange}
                maxLength={60}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="event-modal__actions">
            <button type="button" className="event-modal__button event-modal__button--ghost" onClick={onClose}>
              Отмена
            </button>
            <button
              type="button"
              className="event-modal__button event-modal__button--primary"
              onClick={handleAddEvent}
              disabled={isSubmitDisabled}
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </>
  )
}








