export type AuthSessionEvent =
  | {
      type: "SESSION_EXPIRED"
      message?: string
    }

type Listener = (event: AuthSessionEvent) => void

const listeners = new Set<Listener>()

export const subscribeToAuthEvents = (listener: Listener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const emitAuthEvent = (event: AuthSessionEvent) => {
  listeners.forEach((listener) => listener(event))
}
