# Loading Components Documentation

This document describes how to use the loading components implemented in the Flow Force application.

## Components Overview

### 1. Spinner (`Spinner.tsx`)
A reusable loading spinner component.

**Props:**
- `size?: "small" | "medium" | "large"` - Size of the spinner (default: "medium")
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import Spinner from "./components/Spinner"

<Spinner size="small" />
<Spinner size="large" className="custom-spinner" />
```

**Features:**
- 60fps CSS animation
- Uses accent color (#00ff9f)
- Accessible with `aria-label="Loading..."`
- Three predefined sizes

### 2. Skeleton (`Skeleton.tsx`)
Placeholder component for content that is loading.

**Props:**
- `variant?: "text" | "rect" | "circle"` - Shape of skeleton (default: "text")
- `width?: string | number` - Custom width
- `height?: string | number` - Custom height
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import Skeleton from "./components/Skeleton"

<Skeleton variant="text" width="120px" />
<Skeleton variant="rect" width="100%" height="80px" />
<Skeleton variant="circle" width="40px" height="40px" />
```

**Features:**
- Shimmer gradient animation
- Matches real content dimensions
- Accessible with `aria-label="Loading content..."`
- Three shape variants

### 3. ProgressBar (`ProgressBar.tsx`)
Linear progress indicator for file uploads and operations.

**Props:**
- `value: number` - Current progress value
- `max?: number` - Maximum value (default: 100)
- `showPercentage?: boolean` - Show percentage text (default: false)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import ProgressBar from "./components/ProgressBar"

<ProgressBar value={45} />
<ProgressBar value={uploadProgress} showPercentage />
<ProgressBar value={progress} max={200} />
```

**Features:**
- Smooth width transitions
- Optional percentage display
- Gradient fill effect
- Accessible with ARIA attributes

### 4. LoadingButton (`LoadingButton.tsx`)
Button component with built-in loading state.

**Props:**
- `loading?: boolean` - Show loading state
- `disabled?: boolean` - Disable button
- `children: React.ReactNode` - Button content
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler
- `type?: "button" | "submit" | "reset"` - Button type (default: "button")

**Usage:**
```tsx
import LoadingButton from "./components/LoadingButton"

<LoadingButton loading={isLoading} onClick={handleSubmit}>
  Submit
</LoadingButton>

<LoadingButton loading={isSubmitting} disabled={!isValid}>
  {isSubmitting ? "Submitting..." : "Submit"}
</LoadingButton>
```

**Features:**
- Integrated spinner on the left
- Prevents width jumping with min-width
- Disabled state during loading
- Hover and active states
- Accessible with `aria-busy`

### 5. Toast (`Toast.tsx` & `ToastProvider.tsx`)
Notification system for success/error/info messages.

**ToastProvider Setup:**
Wrap your app with ToastProvider to enable toast functionality.

```tsx
import { ToastProvider } from "./components/ToastProvider"

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}
```

**Using Toast:**
```tsx
import { useToast } from "./components/ToastProvider"

function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast("Operation successful!", "success")
  }

  const handleError = () => {
    showToast("Something went wrong", "error")
  }

  const handleInfo = () => {
    showToast("Loading...", "info", 5000) // 5 seconds duration
  }

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  )
}
```

**Features:**
- Auto-dismiss after 3 seconds (configurable)
- Three types: success, error, info
- Slide-in animation
- Stack multiple toasts
- Accessible with `aria-live="polite"`

### 6. LoadingSplash (`LoadingSplash.tsx`)
Full-screen loading splash for authentication and initial loading.

**Props:**
- `message?: string` - Loading message (default: "Проверяем данные...")

**Usage:**
```tsx
import LoadingSplash from "./components/LoadingSplash"

<LoadingSplash message="Загрузка профиля..." />
```

**Features:**
- Fullscreen overlay
- Logo and spinner
- Customizable message
- Used for authentication flows

## Implementation Examples

### Authentication Loading
```tsx
if (authStatus === "loading") {
  return <LoadingSplash message="Проверяем данные..." />
}
```

### Data Loading with Skeletons
```tsx
<div className="user-profile">
  {isLoadingProfile ? (
    <Skeleton variant="circle" width="80px" height="80px" />
  ) : (
    <img src={user.avatar} alt="User avatar" />
  )}
  
  {isLoadingProfile ? (
    <Skeleton variant="text" width="150px" />
  ) : (
    <h2>{user.name}</h2>
  )}
</div>
```

### Form Submission Loading
```tsx
<LoadingButton
  loading={isSubmitting}
  disabled={!isValid || isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? "Создание..." : "Создать"}
</LoadingButton>
```

### File Upload Progress
```tsx
<div className="upload-area">
  {isUploading ? (
    <div>
      <Spinner size="medium" />
      <ProgressBar value={uploadProgress} showPercentage />
      <span>Загрузка изображения...</span>
    </div>
  ) : (
    <input type="file" onChange={handleFileUpload} />
  )}
</div>
```

### Payment Processing
```tsx
<LoadingButton
  loading={isInvoicePending}
  onClick={handlePayment}
  className="payment-button"
>
  {isInvoicePending ? "Обработка..." : "Оплатить"}
</LoadingButton>
```

## Best Practices

1. **Always show loading states for async operations**
2. **Use skeleton loaders for initial data loading**
3. **Prevent user interaction during loading**
4. **Provide clear feedback for completion**
5. **Use consistent loading patterns across the app**
6. **Consider accessibility with ARIA attributes**
7. **Test on slow connections (3G)**
8. **Don't block UI where not necessary**

## Performance Considerations

- Skeleton loaders prevent layout shift
- Debounce auto-save operations (2+ seconds)
- Use optimistic updates where possible
- Cancel pending requests on unmount
- Keep loading animations at 60fps

## Accessibility

All loading components include:
- `aria-busy="true"` for loading elements
- `aria-live="polite"` for status updates
- Screen reader announcements
- Keyboard navigation support
- High contrast colors