'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LandingPagePreview() {
  const params = useParams();
  const [landingPage, setLandingPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingPage();
    
    // Poll for updates while generating
    const interval = setInterval(() => {
      if (landingPage?.status === 'draft') {
        fetchLandingPage();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [params.id]);

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/landing-pages/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setLandingPage(data);
      }
    } catch (error) {
      console.error('Error fetching landing page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Landing page not found</p>
      </div>
    );
  }

  const isGenerating = landingPage.sections.some(
    (s: any) => s.generationStatus === 'pending' || s.generationStatus === 'generating'
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with generation status */}
      {isGenerating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Génération en cours...</span>
          </div>
        </div>
      )}

      {/* Landing Page Content */}
      <div
        className="max-w-7xl mx-auto"
        style={{
          '--primary': landingPage.primaryColor,
          '--secondary': landingPage.secondaryColor,
          '--accent': landingPage.accentColor,
          '--bg': landingPage.backgroundColor,
        } as any}
      >
        {landingPage.sections.map((section: any) => (
          <Section key={section.id} section={section} landingPage={landingPage} />
        ))}
      </div>
    </div>
  );
}

function Section({ section, landingPage }: any) {
  const isGenerating =
    section.generationStatus === 'pending' || section.generationStatus === 'generating';

  if (isGenerating) {
    return (
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Génération de {section.title}...</p>
        </div>
      </div>
    );
  }

  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} landingPage={landingPage} />;
    case 'problem':
      return <ProblemSection section={section} />;
    case 'solution':
      return <SolutionSection section={section} />;
    case 'benefits':
      return <BenefitsSection landingPage={landingPage} />;
    case 'how-it-works':
      return <HowItWorksSection section={section} />;
    case 'before-after':
      return <BeforeAfterSection section={section} />;
    case 'social-proof':
      return <SocialProofSection section={section} />;
    case 'cta':
      return <CTASection landingPage={landingPage} />;
    default:
      return <GenericSection section={section} />;
  }
}

function HeroSection({ section, landingPage }: any) {
  const primaryImage = landingPage.product.images.find((img: any) => img.isPrimary) ||
    landingPage.product.images[0];

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            {landingPage.headline}
          </h1>
          {landingPage.description && (
            <p className="text-xl text-muted-foreground">{landingPage.description}</p>
          )}
          
          <div className="flex items-center gap-4">
            {landingPage.oldPrice && (
              <span className="text-2xl text-muted-foreground line-through">
                {landingPage.oldPrice} {landingPage.currency}
              </span>
            )}
            <span
              className="text-5xl font-bold"
              style={{ color: landingPage.primaryColor }}
            >
              {landingPage.price} {landingPage.currency}
            </span>
          </div>

          <button
            className="px-8 py-4 text-lg font-bold rounded-lg transition-transform hover:scale-105 text-white"
            style={{ backgroundColor: landingPage.primaryColor }}
          >
            {landingPage.ctaText}
          </button>
        </div>

        {primaryImage && (
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <Image
              src={primaryImage.url}
              alt={landingPage.product.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ProblemSection({ section }: any) {
  return (
    <section className="py-24 px-4 bg-card">
      <div className="max-w-4xl mx-auto">
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}

function SolutionSection({ section }: any) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}

function BenefitsSection({ landingPage }: any) {
  return (
    <section className="py-24 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">
          Pourquoi choisir {landingPage.product.name}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {landingPage.benefits.map((benefit: any) => (
            <div
              key={benefit.id}
              className="p-6 rounded-lg bg-background border border-border"
            >
              {benefit.icon && (
                <div className="text-4xl mb-4">{benefit.icon}</div>
              )}
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ section }: any) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Comment ça marche?</h2>
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}

function BeforeAfterSection({ section }: any) {
  return (
    <section className="py-24 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Avant / Après</h2>
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}

function SocialProofSection({ section }: any) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">
          Ce que disent nos clients
        </h2>
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}

function CTASection({ landingPage }: any) {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          Prêt à transformer votre vie?
        </h2>
        <p className="text-xl text-muted-foreground">
          Rejoignez des milliers de clients satisfaits
        </p>
        
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <button
            className="w-full px-8 py-4 text-lg font-bold rounded-lg transition-transform hover:scale-105 text-white"
            style={{ backgroundColor: landingPage.primaryColor }}
          >
            {landingPage.ctaText}
          </button>

          {landingPage.phone && (
            <a
              href={`tel:${landingPage.phone}`}
              className="w-full px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              📞 {landingPage.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function GenericSection({ section }: any) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    </section>
  );
}
