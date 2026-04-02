import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Terminal, Mail, Github, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/timeline', label: 'Timeline' },
    { to: '/weekly', label: 'Weekly Updates' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-s">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <NavLink to="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 bg-ink rounded flex items-center justify-center">
                  <Terminal className="text-neon w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-lg tracking-tight">Build Log</span>
              </NavLink>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "relative px-3 py-1.5 text-sm font-medium transition-colors",
                        isActive ? "text-ink" : "text-muted hover:text-ink"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && (
                          <motion.div
                            layoutId="nav-underline"
                            className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-neon rounded-full"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-muted border border-border-s rounded-md hover:border-neon hover:text-neon transition-colors">
                <Mail className="w-3 h-3" /> Newsletter
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium bg-ink text-neon rounded-md hover:bg-ink/90 transition-colors"
              >
                <Github className="w-3 h-3" /> GitHub
              </a>
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center text-muted hover:text-ink"
              >
                {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border-s bg-surface overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive ? "bg-card text-neon" : "text-muted hover:text-ink hover:bg-card"
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-border-s mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted text-xs font-mono">
            <div className="w-5 h-5 bg-ink rounded flex items-center justify-center">
              <Terminal className="text-neon w-3 h-3" />
            </div>
            <span>Build Log &copy; 2024 &mdash; MIT License</span>
          </div>
          <div className="flex items-center gap-4 text-muted text-xs">
            <button className="hover:text-neon transition-colors">Contact</button>
            <button className="hover:text-neon transition-colors">Source</button>
            <button className="hover:text-neon transition-colors">RSS</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
