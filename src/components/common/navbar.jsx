// filepath: frontend/src/components/common/navbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, ROUTES } from '../../config/constants';
import { useAuth } from '../../hooks/use-auth';

const navItems = [
  { to: ROUTES.agents, label: 'Agents', emoji: '🧩' },
  { to: ROUTES.chains, label: 'Chains', emoji: '⛓️' },
  { to: ROUTES.runs, label: 'Runs', emoji: '▶' },
  { to: ROUTES.settings, label: 'Settings', emoji: '⚙' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <aside className="app-sidebar relative z-30 border-r border-card-border bg-bg-deep/95 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-card-border pb-4 md:block">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.png" alt={APP_NAME} className="h-14 w-auto max-w-[190px] object-contain" />
        </div>

        <button
          type="button"
          className="rounded-md border border-card-border bg-white/5 px-2 py-1 text-sm text-text-dim md:hidden"
          onClick={() => setOpenMobile((prev) => !prev)}
        >
          ☰
        </button>
      </div>

      <nav className={`${openMobile ? 'flex' : 'hidden'} flex-col gap-1 md:flex`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpenMobile(false)}
            className={({ isActive }) =>
              `group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                isActive
                  ? 'border-yellow/35 bg-yellow/12 text-yellow'
                  : 'border-transparent text-text-dim hover:border-card-border hover:bg-white/[0.04] hover:text-white'
              }`
            }
          >
            <span className="text-xs opacity-80 group-hover:opacity-100">{item.emoji}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-card-border pt-3">
        <p className="truncate text-sm text-white">{user?.email || 'Not signed in'}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-2 w-full rounded-lg border border-card-border bg-white/5 px-3 py-2 text-sm text-text-dim transition hover:bg-white/10 hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
