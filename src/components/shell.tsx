'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  LayoutGrid,
  Search,
  ChartNoAxesColumnIncreasing,
  BriefcaseBusiness,
  Settings,
  Sparkles,
  X,
  Menu,
} from 'lucide-react';
import { useStore } from './store';
import { ResearchAssistant } from './research-assistant';
const nav = [
  { href: '/', label: 'Overview', Icon: LayoutGrid },
  { href: '/discover', label: 'Discover', Icon: Search },
  { href: '/watchlist', label: 'Watchlist', Icon: ChartNoAxesColumnIncreasing },
  { href: '/portfolio', label: 'Portfolio', Icon: BriefcaseBusiness },
  { href: '/settings', label: 'Settings', Icon: Settings },
];
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const { state, warning } = useStore();
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dialog.current?.showModal();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  useEffect(() => {
    dialog.current?.close();
    setMenu(false);
  }, [path]);
  return (
    <div className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside id="primary-sidebar" className={`sidebar ${menu ? 'open' : ''}`}>
        <Link href="/" className="brand">
          Property OS<span>AUSTRALIA · INVESTMENT</span>
        </Link>
        <nav aria-label="Primary">
          {nav.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenu(false)}
              className={(href === '/' ? path === '/' : path.startsWith(href)) ? 'active' : ''}
              aria-current={
                (href === '/' ? path === '/' : path.startsWith(href)) ? 'page' : undefined
              }
            >
              <Icon size={18} />
              {label}
              {label === 'Discover' && <span className="nav-arrow">↗</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sample-dot">Research workspace</div>
          <p>
            ABS public data · Beta
            <br />
            Property listings remain demo
          </p>
          <div className="profile">
            <span>{state.preferences.name.slice(0, 1) || 'Z'}</span>
            {state.preferences.name}
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            aria-controls="primary-sidebar"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </button>
          <span className="breadcrumb">
            {path === '/'
              ? 'Overview'
              : path
                  .split('/')
                  .filter(Boolean)
                  .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
                  .join(' / ')}
          </span>
          <Link className="button" href="/discover">
            <Search size={17} />
            Property search & Buy Box
          </Link>
          <button className="ai-button" onClick={() => dialog.current?.showModal()}>
            <Sparkles size={16} />
            Ask AI <kbd>⌘K</kbd>
          </button>
        </header>
        <main id="main">
          {warning && (
            <p className="notice" role="status">
              {warning}
            </p>
          )}
          <div className="notice source-banner">
            <strong>Live property listings are not connected.</strong> All in-app property
            addresses, prices, sale statuses and timelines are fictional demo data. ABS supplies
            regional statistics only. <Link href="/discover">Property search status →</Link>
          </div>
          {children}
          <footer>
            Property OS <span>ABS regional data + demo listings · AUD</span>
          </footer>
        </main>
      </div>
      <dialog ref={dialog} className="assistant">
        <div className="section-head">
          <h2>Research assistant</h2>
          <button
            className="icon"
            aria-label="Close assistant"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <ResearchAssistant key={path} />
      </dialog>
    </div>
  );
}
