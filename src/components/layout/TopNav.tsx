'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Calendar } from 'lucide-react';

export default function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Accueil', icon: Home },
    { href: '/dashboard#historique', label: 'Tableau de bord', icon: LayoutDashboard },
  ];

  return (
    <nav className="h-16 bg-[#0a1520]/80 backdrop-blur-xl border-b border-white/10 fixed top-0 left-64 right-0 z-40">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400 hover:text-white border border-white/10">
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
