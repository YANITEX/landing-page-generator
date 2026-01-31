'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wand2, Image, Video, Sparkles, Layers, Zap, Megaphone, 
  Mic, ShoppingBag, Shirt, Package, BarChart, CreditCard, 
  DollarSign, Settings, User, ChevronDown 
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: any;
  href: string;
  badge?: string;
  active?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', icon: Sparkles, href: '/dashboard' },
    { name: 'Custom Prompt', icon: Wand2, href: '/custom-prompt' },
    { name: 'UGC Photo', icon: Image, href: '/ugc-photo' },
    { name: 'UGC Video', icon: Video, href: '/ugc-video', badge: 'Bientôt' },
    { name: 'Premium UGC', icon: Sparkles, href: '/premium-ugc' },
    { name: 'Landing Page', icon: Layers, href: '/landing-page' },
    { name: 'Ad Creative', icon: Megaphone, href: '/ad-creative' },
    { name: 'Voice Generation', icon: Mic, href: '/voice', badge: 'Bientôt' },
    { name: 'Product Showcase', icon: ShoppingBag, href: '/product-showcase' },
    { name: 'Virtual Try-On', icon: Shirt, href: '/virtual-tryon' },
    { name: 'POD', icon: Package, href: '/pod' },
    { name: 'Ads Creator', icon: BarChart, href: '/ads-creator' },
    { name: 'Prompt Generator', icon: Wand2, href: '/prompt-generator' },
  ];

  const bottomNavItems = [
    { name: 'Mes Produits', icon: Package, href: '/products' },
    { name: 'Historique', icon: BarChart, href: '/history' },
    { name: 'Crédits', icon: CreditCard, href: '/credits' },
    { name: 'Tarifs', icon: DollarSign, href: '/pricing' },
    { name: 'Paramètres Admin', icon: Settings, href: '/admin' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#0a1520] border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">AI Studio</h1>
            <p className="text-gray-400 text-[10px]">Creative Suite</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 min-h-0 py-2">
        <nav className="space-y-0.5 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || item.active;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-white/10">
        <nav className="space-y-0.5 px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-2 border-t border-white/10">
        <button className="flex items-center gap-2 w-full hover:bg-white/5 rounded-lg p-1.5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-xs font-medium">Utilisateur</p>
            <p className="text-gray-400 text-[10px]">Mon compte</p>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
