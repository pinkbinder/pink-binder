import { cleanup } from '@solidjs/testing-library'
import { afterEach } from 'bun:test'

afterEach(() => {
  cleanup()
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: ResizeObserverStub,
})

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }),
})

// happy-dom starts at about:blank; give the suite a real base URL so
// history.pushState/replaceState updates window.location for URL-state tests.
if (
  typeof (window as { happyDOM?: { setURL?: (url: string) => void } }).happyDOM?.setURL ===
  'function'
) {
  ;(window as { happyDOM: { setURL: (url: string) => void } }).happyDOM.setURL('http://localhost/')
}
