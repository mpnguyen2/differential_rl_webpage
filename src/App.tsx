import { useEffect, useState } from 'react'

// ----- Types for MathJax on window -----
declare global {
  interface Window {
    MathJax?: { typesetPromise?: () => Promise<void> }
  }
}

// ----- Routes (content/*.html filenames) -----
const ROUTES = [
  'hero', 'motivation', 'formulation', 'algorithm',
  'experiments', 'theory'
] as const
type Route = typeof ROUTES[number]

// ----- Helpers -----
function getRouteFromHash(): Route {
  const raw = (location.hash || '#hero').slice(1)
  return (ROUTES.includes(raw as Route) ? raw : 'hero') as Route
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash())
  const [html, setHtml] = useState<string>('Loading…')

  // keep nav active state in sync with hash
  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // load the HTML snippet for current route
  useEffect(() => {
    let cancelled = false
    const base = (import.meta as any).env?.BASE_URL ?? '/'
    // Use cache-busting during dev if you like: `?v=${Date.now()}`
    fetch(`${base}content/${route}.html`)
      .then(r => r.ok ? r.text() : Promise.reject(new Error(r.statusText)))
      .then(txt => {
        if (!cancelled) setHtml(txt)
      })
      .catch(() => {
        if (!cancelled) setHtml('<p>Failed to load content.</p>')
      })
    return () => { cancelled = true }
  }, [route])

  // re-typeset math after content changes
  useEffect(() => {
    window.MathJax?.typesetPromise?.()
  }, [html])

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');

    const setHeaderHeight = () => {
      const h = header?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty('--header-h', `${Math.ceil(h)}px`);
    };

    setHeaderHeight();                 // on mount
    window.addEventListener('resize', setHeaderHeight);

    return () => window.removeEventListener('resize', setHeaderHeight);
  }, []);

  // (optional) also recalc after route changes, in case nav wraps differently
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');
    const h = header?.getBoundingClientRect().height ?? 0;
    document.documentElement.style.setProperty('--header-h', `${Math.ceil(h)}px`);
  }, [route]);

  return (
    <div className="site">
      <header className="header">
        <h2 className="title">
          A Differential and Pointwise Control Approach to Reinforcement Learning
        </h2>
        <div className="authors">Minh Nguyen<sup>★</sup>, Chandrajit Bajaj</div>

        <nav className="nav">
          {ROUTES.map((r) => (
            <a
              key={r}
              href={`#${r}`}
              className={route === r ? 'active' : undefined}
              data-route={r}
            >
              {label(r)}
            </a>
          ))}
        </nav>
      </header>

      <main id="content" className="section" dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="footer">
        <hr />
        <div>© 2025 — Minh Nguyen</div>
      </footer>
    </div>
  )
}

// Pretty labels for nav pills
function label(r: Route) {
  switch (r) {
    case 'hero': return 'Overview'
    default:
      return r
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
  }
}
