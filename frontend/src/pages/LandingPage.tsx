import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  Brain,
  ArrowRight,
  CheckCircle2,
  Box,
  Compass,
  Users,
  Home,
  Building,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Footer } from '../components/common/Footer';

export const LandingPage: React.FC = () => {
  const featurePillars = [
    {
      icon: <Camera className="w-6 h-6 text-terracotta-600" />,
      title: 'Live Room Understanding',
      badge: 'Computer Vision',
      badgeVariant: 'terracotta' as const,
      description:
        'Captures real-time room video to estimate spatial boundaries, depth planes, wall-floor junctions, and obstacle clearances.',
      bullets: [
        'Monocular depth estimation pipeline',
        'Wall, floor, and ceiling plane segmentation',
        'Doorway and window boundary tracking',
      ],
    },
    {
      icon: <Sparkles className="w-6 h-6 text-sage-600" />,
      title: 'Personalized Recommendations',
      badge: 'Machine Learning',
      badgeVariant: 'sage' as const,
      description:
        'Multi-criteria recommendation system balancing aesthetic styles, functional priorities, ergonomics, and spatial footprints.',
      bullets: [
        'Curated design style alignment',
        'Lifestyle & ergonomic compatibility',
        'Multi-alternative layout ranking',
      ],
    },
    {
      icon: <IndianRupee className="w-6 h-6 text-sand-600" />,
      title: 'Budget-Aware Design',
      badge: 'Cost Optimizer',
      badgeVariant: 'sand' as const,
      description:
        'Strictly optimizes furniture packages, finishes, and accent materials within user-defined financial allocations and flexibility margins.',
      bullets: [
        'Target budget ceiling validation',
        'Transparent cost breakdown per item',
        'Value-oriented material trade-offs',
      ],
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-terracotta-600" />,
      title: 'Smart Space Validation',
      badge: 'Constraint Solver',
      badgeVariant: 'terracotta' as const,
      description:
        'Mathematically checks circulation pathways, door-swing envelopes, daylight sightlines, and physical clearances before suggesting layouts.',
      bullets: [
        'Pathway circulation clearance (≥0.9m)',
        'Door swing arc collision protection',
        'Natural window light obstruction checks',
      ],
    },
    {
      icon: <Box className="w-6 h-6 text-sage-600" />,
      title: 'Interactive Visualization',
      badge: '3D Elevation',
      badgeVariant: 'sage' as const,
      description:
        'Explores spaces through multi-angle views: 3D perspective orbit, top-down 2D floor plans, and architectural elevation slices.',
      bullets: [
        'Perspective 3D orbit viewport',
        'Top-down 2D floor clearance view',
        'Front and side architectural elevations',
      ],
    },
    {
      icon: <Brain className="w-6 h-6 text-sand-600" />,
      title: 'Explainable AI',
      badge: 'XAI Framework',
      badgeVariant: 'sand' as const,
      description:
        'Provides step-by-step reasoning for why specific layouts, furniture modules, and color palettes were chosen for your unique space.',
      bullets: [
        'Spatial reasoning and clearance evidence',
        'Color and material harmony scores',
        'Transparent constraint resolution trade-offs',
      ],
    },
  ];

  const problemSolutions = [
    {
      problem: 'Difficult to visualize a redesigned room',
      solution: 'Live camera capture with multi-angle 3D elevation and 2D floor plan visualization.',
    },
    {
      problem: 'Generic recommendations that ignore personal taste',
      solution: 'Context-aware preference engine tailoring color, design style, and ergonomics.',
    },
    {
      problem: 'Furniture ordered online does not physically fit',
      solution: 'Mathematical collision and circulation validation (minimum 0.9m pathway standards).',
    },
    {
      problem: 'Budget uncertainty and unexpected finish costs',
      solution: 'Itemized cost optimization strictly bounded by your defined budget ceiling.',
    },
    {
      problem: 'Existing treasured furniture is overlooked',
      solution: 'Dedicated preservation list locking existing heirlooms into the spatial layout solver.',
    },
    {
      problem: 'Divergent family, child, and pet priorities',
      solution: 'Specialized lifestyle modes for families, pets, kids, elders, and accessibility.',
    },
  ];

  const targetUsersPrimary = [
    { title: 'Homeowners', desc: 'Transform lived-in spaces with personalized layout optimization and ergonomic upgrades.' },
    { title: 'New-Home Buyers', desc: 'Plan unfurnished rooms accurately from move-in day with verified clearances.' },
  ];

  const targetUsersSecondary = [
    { title: 'Interior Designers', desc: 'Generate rapid spatial candidate plans and client explainability reports.' },
    { title: 'Architects', desc: 'Inspect dimensional boundary clearances and 3D elevation slices.' },
    { title: 'Renters', desc: 'Reconfigure modular furniture without invasive wall or floor alterations.' },
    { title: 'Furniture Buyers', desc: 'Validate dimensions and clearance envelopes before committing to purchases.' },
    { title: 'Real-Estate Pros', desc: 'Demonstrate potential spatial layouts and staging options to prospective clients.' },
  ];

  const lifestyleModes = [
    { name: 'Family Mode', desc: 'Spacious gathering areas with high-durability fabrics' },
    { name: 'Elderly-Friendly', desc: 'Wide non-slip corridors and zero trip hazards' },
    { name: 'Accessibility-Focused', desc: 'ADA-compliant wheelchair turning radius & reach' },
    { name: 'Child-Friendly', desc: 'Soft rounded edges and secure storage anchoring' },
    { name: 'Pet-Friendly', desc: 'Stain-resistant bouclé & scratch-proof hardwoods' },
    { name: 'Rental-Friendly', desc: 'Freestanding non-destructive modular layouts' },
  ];

  return (
    <div className="flex flex-col min-h-screen -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 sm:px-12 bg-gradient-to-b from-[#F4EFEA] via-[#FAF8F5] to-[#FAF8F5] border-b border-softBorder">
        {/* Warm Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-gradient-to-tr from-terracotta-200/40 via-sand-200/30 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-softBorder text-xs text-charcoal-700 shadow-warm-sm">
            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
            <span className="font-semibold text-terracotta-700">Academic CV + ML Platform</span>
            <span className="text-charcoal-300">|</span>
            <span className="text-charcoal-500 font-medium">Context-Aware Interior Design</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-charcoal-900 tracking-tight leading-[1.15]">
            Design Your Space{' '}
            <span className="italic text-terracotta-600">
              Intelligently.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Understand your space. Personalize your design. Visualize your possibilities.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link to="/camera">
              <Button size="lg" variant="primary" className="shadow-terracotta font-semibold px-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Designing
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary" className="px-8 font-semibold" leftIcon={<Compass className="w-4 h-4" />}>
                Explore Features
              </Button>
            </a>
          </div>

          {/* 5-Step Roadmap Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-10 text-left">
            {[
              { step: '01', title: 'Capture Room', desc: 'Scan boundaries via live camera feed' },
              { step: '02', title: 'Analyze Space', desc: 'Extract wall planes & depth geometry' },
              { step: '03', title: 'Set Preferences', desc: 'Style, budget & lifestyle priorities' },
              { step: '04', title: 'Generate Recommendations', desc: 'Rank validated layout options' },
              { step: '05', title: 'Visualize Design', desc: 'Interactive 3D elevation studio' },
            ].map((st) => (
              <div key={st.step} className="p-3.5 rounded-2xl bg-white border border-softBorder shadow-warm-sm">
                <span className="text-xs font-mono font-bold text-terracotta-600 block mb-1">{st.step}</span>
                <h4 className="text-xs font-bold text-charcoal-900 mb-0.5">{st.title}</h4>
                <p className="text-[11px] text-charcoal-500 leading-normal font-medium">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="terracotta" size="md">Core Pillars</Badge>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-charcoal-900 tracking-tight">
            Six Intelligent Capabilities for Every Room
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-normal">
            Built on principled spatial geometry, constraint satisfaction, and Explainable AI rather than ungrounded generative imagery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md flex flex-col justify-between warm-card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-softBorder">
                    {p.icon}
                  </div>
                  <Badge variant={p.badgeVariant} size="sm">{p.badge}</Badge>
                </div>
                <h3 className="text-base font-bold text-charcoal-900 mb-2">{p.title}</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed mb-4">{p.description}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-softBorder text-[11px] text-charcoal-700 font-medium">
                {p.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problems Solved Section */}
      <section className="py-20 px-6 sm:px-12 bg-[#F4EFEA] border-y border-softBorder">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="sage" size="md">Problems Solved</Badge>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-charcoal-900 tracking-tight">
              Bridging the Gap Between Conception and Reality
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Traditional interior design tools either produce generic ideas or ignore physical space constraints. SmartSpace AI solves common spatial design hurdles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problemSolutions.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-softBorder shadow-warm-sm space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                    ✕
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-900">Common Issue:</h4>
                    <p className="text-xs text-charcoal-600 mt-0.5 font-medium">{item.problem}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-3 border-t border-softBorder">
                  <div className="w-6 h-6 rounded-lg bg-sage-100 text-sage-700 border border-sage-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-terracotta-700">SmartSpace AI Solution:</h4>
                    <p className="text-xs text-charcoal-700 mt-0.5 font-medium leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users & Modes Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="sand" size="md">Target Audience</Badge>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-charcoal-900 tracking-tight">
            Designed for Real People & Everyday Spaces
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            Tailored specifically for homeowners and new-home buyers, while empowering professionals and specialized living requirements.
          </p>
        </div>

        {/* Primary & Secondary Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Primary Users */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta-700">
              <Home className="w-4 h-4" />
              <span>Primary Users</span>
            </div>
            <div className="space-y-4">
              {targetUsersPrimary.map((u, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-terracotta-300 shadow-warm-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-terracotta-50 rounded-bl-full pointer-events-none" />
                  <Badge variant="terracotta" size="sm" className="mb-2">Core Audience</Badge>
                  <h3 className="text-base font-bold text-charcoal-900 mb-1">{u.title}</h3>
                  <p className="text-xs text-charcoal-600 leading-relaxed font-medium">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Users */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-800">
              <Building className="w-4 h-4" />
              <span>Secondary & Professional Users</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {targetUsersSecondary.map((u, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-softBorder shadow-warm-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-900 mb-1">{u.title}</h4>
                    <p className="text-[11px] text-charcoal-600 leading-relaxed font-medium">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specialized Living Modes */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-softBorder shadow-warm-md space-y-6">
          <div className="flex items-center gap-2.5 border-b border-softBorder pb-4">
            <Users className="w-5 h-5 text-terracotta-600" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal-900">Specialized Living & Accessibility Modes</h3>
              <p className="text-xs text-charcoal-500">Fine-tuned spatial clearances, material durability, and ergonomics.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {lifestyleModes.map((m, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-softBorder text-left space-y-1">
                <span className="text-xs font-bold text-charcoal-900 block">{m.name}</span>
                <p className="text-[10px] text-charcoal-500 leading-normal font-medium">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exterior Building Elevation Conceptual Notice */}
      <section className="py-14 px-6 sm:px-12 bg-white border-y border-softBorder">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2">
              <Building className="w-4 h-4 text-terracotta-600" />
              <Badge variant="sand" size="sm">Future Module</Badge>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-charcoal-900">
              Exterior Building Elevation Support
            </h3>
            <p className="text-xs text-charcoal-600 max-w-xl leading-relaxed">
              SmartSpace AI will also support exterior elevation modeling with inputs for building type, floor count, style preferences, and material finishes.
            </p>
          </div>
          <Link to="/studio" className="shrink-0">
            <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Preview in Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 sm:px-12 bg-[#F4EFEA] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="terracotta" size="md">Get Started</Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-900">
            Start Designing Your Space Today
          </h2>
          <p className="text-sm text-charcoal-600 max-w-xl mx-auto leading-relaxed">
            Experience spatial room scanning, configure your personalized style and budget profile, and explore validated layout recommendations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/camera">
              <Button size="lg" variant="primary" className="shadow-terracotta font-semibold" leftIcon={<Camera className="w-4 h-4" />}>
                Launch Camera Workspace
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="font-semibold" leftIcon={<Layers className="w-4 h-4" />}>
                Open Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
