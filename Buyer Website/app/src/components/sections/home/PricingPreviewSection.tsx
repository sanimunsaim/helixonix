import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free', price: 0, period: '/mo',
    description: 'Perfect for getting started',
    features: [
      { text: '10 downloads/month', included: true },
      { text: '50 AI credits', included: true },
      { text: 'Standard license', included: true },
      { text: 'Community support', included: true },
      { text: 'Extended license', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started', highlighted: false,
  },
  {
    name: 'Pro', price: 19, period: '/mo',
    description: 'Most Popular',
    features: [
      { text: 'Unlimited downloads', included: true },
      { text: '500 AI credits/mo', included: true },
      { text: 'Standard + Extended', included: true },
      { text: 'Priority support', included: true },
      { text: 'AI generation HD', included: true },
      { text: 'Team collaboration', included: false },
    ],
    cta: 'Upgrade Now', highlighted: true,
  },
  {
    name: 'Team', price: 49, period: '/mo',
    description: 'For creative teams',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '2000 AI credits/mo', included: true },
      { text: '5 team seats', included: true },
      { text: 'Admin dashboard', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated support', included: true },
    ],
    cta: 'Contact Sales', highlighted: false,
  },
];

export default function PricingPreviewSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal py-20 bg-[#0A0F2E]">
      <div className="page-gutter">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">Choose Your Plan</h2>
          <p className="text-[#8892B0]">Start free, upgrade when you need more power</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'glass-surface rounded-card-lg p-6 flex flex-col relative',
                plan.highlighted && 'border-[rgba(0,212,255,0.4)] shadow-cyan-glow animate-neon-pulse'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] text-[#050815] text-xs font-heading font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="font-heading font-bold text-lg text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-[#8892B0] mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="font-display font-black text-4xl text-white">${plan.price}</span>
                <span className="text-[#8892B0] text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check size={16} className="text-[#00E676] flex-shrink-0" />
                    ) : (
                      <X size={16} className="text-[#8892B0] flex-shrink-0" />
                    )}
                    <span className={f.included ? 'text-white' : 'text-[#8892B0]'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className={cn(
                  'block text-center py-3 rounded-button font-heading font-semibold transition-all',
                  plan.highlighted
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] btn-glow hover:brightness-110'
                    : 'border border-white/20 text-white hover:border-[#00D4FF] hover:text-[#00D4FF]'
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
