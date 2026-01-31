'use client';

import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { 
  Wand2, Image, Video, Sparkles, Layers, Zap, Megaphone, 
  Mic, ShoppingBag, Shirt, Package, BarChart, ArrowRight, TrendingUp 
} from 'lucide-react';

export default function DashboardPage() {
  const tools = [
    {
      name: 'Custom Prompt',
      icon: Wand2,
      description: 'Génération de contenu personnalisé avec IA',
      color: 'from-purple-500 to-pink-600',
      href: '/custom-prompt',
      available: true,
    },
    {
      name: 'UGC Photo',
      icon: Image,
      description: 'Création de contenu photo UGC professionnel',
      color: 'from-blue-500 to-cyan-600',
      href: '/ugc-photo',
      available: true,
    },
    {
      name: 'UGC Video',
      icon: Video,
      description: 'Génération de vidéos UGC engageantes',
      color: 'from-indigo-500 to-purple-600',
      href: '/ugc-video',
      available: false,
      badge: 'Bientôt',
    },
    {
      name: 'Premium UGC',
      icon: Sparkles,
      description: 'Contenu UGC premium de haute qualité',
      color: 'from-yellow-500 to-orange-600',
      href: '/premium-ugc',
      available: true,
    },
    {
      name: 'Landing Page',
      icon: Layers,
      description: 'Création rapide de landing pages simples',
      color: 'from-green-500 to-emerald-600',
      href: '/landing-page',
      available: true,
    },
    {
      name: 'Ad Creative',
      icon: Megaphone,
      description: 'Création de visuels publicitaires optimisés',
      color: 'from-red-500 to-pink-600',
      href: '/ad-creative',
      available: true,
    },
    {
      name: 'Voice Generation',
      icon: Mic,
      description: 'Génération de voix off professionnelles',
      color: 'from-purple-500 to-indigo-600',
      href: '/voice',
      available: false,
      badge: 'Bientôt',
    },
    {
      name: 'Product Showcase',
      icon: ShoppingBag,
      description: 'Mise en valeur de produits e-commerce',
      color: 'from-orange-500 to-red-600',
      href: '/product-showcase',
      available: true,
    },
    {
      name: 'Virtual Try-On',
      icon: Shirt,
      description: 'Essayage virtuel pour vos produits',
      color: 'from-pink-500 to-rose-600',
      href: '/virtual-tryon',
      available: true,
    },
    {
      name: 'POD',
      icon: Package,
      description: 'Print On Demand - Designs personnalisés',
      color: 'from-cyan-500 to-blue-600',
      href: '/pod',
      available: true,
    },
    {
      name: 'Ads Creator',
      icon: BarChart,
      description: 'Gestionnaire de campagnes publicitaires',
      color: 'from-teal-500 to-green-600',
      href: '/ads-creator',
      available: true,
    },
    {
      name: 'Prompt Generator',
      icon: Wand2,
      description: 'Générateur de prompts IA optimisés',
      color: 'from-violet-500 to-purple-600',
      href: '/prompt-generator',
      available: true,
    },
  ];

  const stats = [
    { label: 'Outils Disponibles', value: tools.filter(t => t.available).length, total: tools.length },
    { label: 'Projets Créés', value: 24 },
    { label: 'Ce Mois-ci', value: 12 },
  ];

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <Sidebar />
      <TopNav />
      
      <main className="ml-64 pt-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Bienvenue sur <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">AI Studio</span>
            </h1>
            <p className="text-gray-400 text-lg">Votre suite créative tout-en-un propulsée par l'IA</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {stat.value}
                  {stat.total && <span className="text-gray-500 text-xl">/{stat.total}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Tous les Outils</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Link key={tool.name} href={tool.available ? tool.href : '#'}>
                  <div
                    className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 ${
                      tool.available
                        ? 'hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/20 cursor-pointer group'
                        : 'opacity-60 cursor-not-allowed'
                    } ${tool.featured ? 'ring-2 ring-emerald-500/30' : ''}`}
                  >
                    {tool.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          PRO
                        </span>
                      </div>
                    )}

                    {tool.badge && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                          {tool.badge}
                        </span>
                      </div>
                    )}

                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 ${tool.available ? 'group-hover:scale-110' : ''} transition-transform`}>
                      <tool.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className={`text-white text-lg font-semibold mb-2 ${tool.available ? 'group-hover:text-emerald-400' : ''} transition-colors`}>
                      {tool.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{tool.description}</p>

                    {tool.available && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <span>Ouvrir</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Prêt à créer quelque chose d'incroyable ?</h2>
                <p className="text-white/90">Explorez nos outils et laissez l'IA booster votre créativité</p>
              </div>
              <button className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 group">
                Commencer
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
