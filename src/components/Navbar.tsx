import React, { useState } from 'react';
import { Terminal, Calendar, Award, Globe, Search, Moon, Sun, Menu, X, Clock } from 'lucide-react';
import { SUPPORTED_TIMEZONES } from '../utils/timezone';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedTimezone: string;
  setSelectedTimezone: (tz: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenDisclaimer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedTimezone,
  setSelectedTimezone,
  isDarkMode,
  toggleDarkMode,
  searchQuery,
  setSearchQuery,
  onOpenDisclaimer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);

  const activeTz = SUPPORTED_TIMEZONES.find(t => t.value === selectedTimezone) || SUPPORTED_TIMEZONES[0];

  const navLinks = [
    { id: 'contests', label: 'Contests', icon: Terminal },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'ladders', label: 'Ladders', icon: Award },
    { id: 'platforms', label: 'Platforms', icon: Globe },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="h-9 w-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              &gt;_
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ContestHub
              </span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block -mt-0.5">
                Programming Hub
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                currentTab === 'home'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </button>
            {navLinks.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/60 dark:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search */}
          <div className="relative hidden lg:block w-48 xl:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contests..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Timezone Selector */}
          <div className="relative">
            <button
              onClick={() => setTzDropdownOpen(!tzDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors"
              title="Change Timezone"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{activeTz.abbr}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden sm:inline">({activeTz.offset})</span>
            </button>

            {tzDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 py-1.5 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-800 z-50 text-xs">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 mb-1">
                  Select Timezone (Default: Asia/Kolkata)
                </div>
                {SUPPORTED_TIMEZONES.map(tz => (
                  <button
                    key={tz.value}
                    onClick={() => {
                      setSelectedTimezone(tz.value);
                      setTzDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors ${
                      selectedTimezone === tz.value
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{tz.label}</span>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">{tz.offset}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contests..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${currentTab === 'home' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-slate-700 dark:text-zinc-300'}`}
          >
            Home
          </button>
          {navLinks.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${currentTab === item.id ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-slate-700 dark:text-zinc-300'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { onOpenDisclaimer(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs text-slate-500 dark:text-zinc-400"
          >
            Legal Terms & Platform Attribution
          </button>
        </div>
      )}
    </header>
  );
};
