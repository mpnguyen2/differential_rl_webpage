import { useEffect, useState } from 'react'

// ----- Types for MathJax on window -----
declare global {
  interface Window { MathJax?: { typesetPromise?: () => Promise<void> } }
}

// ----- Routes (content/*.html filenames) -----
const ROUTES = [
  'hero', 'motivation', 'formulation', 'algorithm',
  'experiments', 'theory'
] as const

type Route = typeof ROUTES[number]

// Pretty labels for nav
function label(r: Route) {
  switch (r) {
    case 'hero': return 'Overview'
    default: return r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
}

function getRouteFromHash(): Route {
  const raw = (location.hash || '#hero').slice(1)
  return (ROUTES.includes(raw as Route) ? raw : 'hero') as Route
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash())
  const [html, setHtml] = useState<string>('')

  // hash routing
  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // load HTML snippet for current route
  useEffect(() => {
    let cancelled = false
    const base = (import.meta as any).env?.BASE_URL ?? '/'
    fetch(`${base}content/${route}.html`)
      .then(r => r.ok ? r.text() : Promise.reject(new Error(r.statusText)))
      .then(txt => { if (!cancelled) setHtml(txt) })
      .catch(() => { if (!cancelled) setHtml('<p>Failed to load content.</p>') })
    return () => { cancelled = true }
  }, [route])

  // MathJax after content changes
  useEffect(() => { window.MathJax?.typesetPromise?.() }, [html])

  // set CSS var for header height
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header')
    const setHeaderHeight = () => {
      const h = header?.getBoundingClientRect().height ?? 0
      document.documentElement.style.setProperty('--header-h', `${Math.ceil(h)}px`)
    }
    setHeaderHeight()
    window.addEventListener('resize', setHeaderHeight)
    return () => window.removeEventListener('resize', setHeaderHeight)
  }, [])

  // also recalc when nav wraps (route change)
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header')
    const h = header?.getBoundingClientRect().height ?? 0
    document.documentElement.style.setProperty('--header-h', `${Math.ceil(h)}px`)
  }, [route])

  // put this inside the App component (replacing your current onShare)
  const onShare = async () => {
    type ShareData = { title?: string; text?: string; url?: string };
    type Nav = Navigator & { share?: (data: ShareData) => Promise<void>; clipboard?: Clipboard };

    const nav = window.navigator as Nav;
    const data: ShareData = {
      title: "A Differential and Pointwise Control Approach to Reinforcement Learning",
      url: location.href,
    };

    try {
      if (typeof nav.share === "function") {
        await nav.share(data);
        return;
      }
      if (nav.clipboard && window.isSecureContext) {
        await nav.clipboard.writeText(data.url || location.href);
        alert("Link copied to clipboard");
        return;
      }
      // final fallback (non-secure context)
      const el = document.createElement("input");
      el.value = data.url || location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      alert("Link copied to clipboard");
    } catch {
      /* user canceled or unsupported */
    }
  };


  return (
    <div className="site">
      {/* ---------- Fixed top nav ---------- */}
      <header className="header">
        <div className="topbar">
          <a className="brand" href="#hero">
            <span className="dot" />
            <span>Differential RL</span>
          </a>

          <nav className="primary-nav" aria-label="Primary">
            {ROUTES.filter(r => r !== 'hero').map((r) => (
              <a
                key={r}
                href={`#${r}`}
                className={route === r ? 'active' : undefined}
                aria-current={route === r ? 'page' : undefined}
              >
                {label(r)}
              </a>
            ))}
          </nav>

          <div />
        </div>
      </header>

      {/* ---------- Hero (black band like GR) ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="crumbs">Home</div>
            <h1 className="title">
              <span className="title-line">A Differential and Pointwise</span>
              <span className="title-line">Control Approach to</span>
              <span className="title-line">Reinforcement Learning</span>
            </h1>
            <p className="meta">
              <time>2025</time>&nbsp;●&nbsp;Minh Nguyen, Chandrajit Bajaj
            </p>
          </div>
          <img className="hero-art" src="hero-art.png" alt="" />
        </div>
      </section>

      {/* ---------- Article body (centered, no side panel) ---------- */}
      {/* <main className="article" id="content" dangerouslySetInnerHTML={{ __html: html }} /> */}
      <div className="article-grid">
        <main className="article" id="content" dangerouslySetInnerHTML={{ __html: html }} />

        <aside className="quicklinks" aria-label="Quick links">
          <h3>QUICK LINKS</h3>
          <a className="qlink" href="https://openreview.net/pdf?id=xpVkYQofw9" target="_blank" rel="noopener">
            <span>Paper</span>
            <span aria-hidden>↗</span>
          </a>
          <button className="qlink" type="button" onClick={onShare}>
            <span>Share</span>
            <span aria-hidden>⤴</span>
          </button>
        </aside>
      </div>



      {/* ---------- Footer ---------- */}
      <footer className="footer">
        <hr />
        <div>© 2025 — Minh Nguyen</div>
      </footer>
    </div>
  )
}
