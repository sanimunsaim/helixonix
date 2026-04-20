import { useState } from 'react';
import { Check, X, Shield, RefreshCw, Headphones } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const plans = [
  { name: 'Free', price: { monthly: 0, yearly: 0 }, description: 'Perfect for getting started',
    features: [
      { text: '10 downloads/month', included: true },
      { text: '50 AI credits/mo', included: true },
      { text: 'Standard license only', included: true },
      { text: 'Community support', included: true },
      { text: 'Extended license', included: false },
      { text: 'Priority support', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'Custom integrations', included: false },
    ],
    cta: 'Get Started', highlighted: false,
  },
  { name: 'Pro', price: { monthly: 19, yearly: 15 }, description: 'Best for professionals',
    features: [
      { text: 'Unlimited downloads', included: true },
      { text: '500 AI credits/mo', included: true },
      { text: 'All license types', included: true },
      { text: 'Priority support', included: true },
      { text: 'HD/4K AI generation', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'Custom integrations', included: false },
    ],
    cta: 'Start Pro Trial', highlighted: true,
  },
  { name: 'Team', price: { monthly: 49, yearly: 39 }, description: 'For creative teams',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '2000 AI credits/mo', included: true },
      { text: '5 team seats', included: true },
      { text: 'Admin dashboard', included: true },
      { text: 'Shared libraries', included: true },
      { text: 'SSO authentication', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales', highlighted: false,
  },
];

const faqs = [
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel at any time. Your subscription will remain active until the end of your current billing period.' },
  { q: 'What happens when I run out of AI credits?', a: 'You can purchase additional credit packs or upgrade to a higher plan. Credits reset monthly with your subscription.' },
  { q: 'Can I switch between monthly and annual billing?', a: 'Yes, you can switch at any time. When switching to annual, you\'ll save 20% compared to monthly billing.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes, Pro plans come with a 7-day free trial. You can cancel anytime during the trial period.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Google Pay.' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-3">Choose Your Plan</h1>
          <p className="text-[#8892B0] max-w-lg mx-auto mb-6">Start free and upgrade as you grow. No hidden fees.</p>
          <div className="inline-flex items-center gap-3 p-1 glass-surface rounded-full">
            <button onClick={() => setAnnual(false)} className={cn('px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all', !annual ? 'bg-[#00D4FF] text-[#050815]' : 'text-[#8892B0]')}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={cn('px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all', annual ? 'bg-[#00D4FF] text-[#050815]' : 'text-[#8892B0]')}>Annual <span className="text-[10px] text-[#00E676]">-20%</span></button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {plans.map((plan) => (
            <div key={plan.name} className={cn('glass-surface rounded-card-lg p-6 flex flex-col relative', plan.highlighted && 'border-[rgba(0,212,255,0.4)] shadow-cyan-glow')}>
              {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] text-[#050815] text-xs font-heading font-bold rounded-full">Best Value</div>}
              <h3 className="font-heading font-bold text-lg text-white">{plan.name}</h3>
              <p className="text-xs text-[#8892B0] mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="font-display font-black text-4xl text-white">${annual ? plan.price.yearly : plan.price.monthly}</span>
                <span className="text-[#8892B0]">/mo</span>
                {annual && plan.price.monthly > 0 && <p className="text-xs text-[#00E676]">Save ${(plan.price.monthly - plan.price.yearly) * 12}/year</p>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? <Check size={16} className="text-[#00E676] flex-shrink-0" /> : <X size={16} className="text-[#8892B0] flex-shrink-0" />}
                    <span className={f.included ? 'text-white' : 'text-[#8892B0]'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button className={cn('w-full py-3 rounded-button font-heading font-bold transition-all', plan.highlighted ? 'bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] btn-glow hover:brightness-110' : 'border border-white/20 text-white hover:border-[#00D4FF] hover:text-[#00D4FF]')}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-xl text-white text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <details key={i} className="glass-surface rounded-card overflow-hidden group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="text-sm text-white font-medium">{faq.q}</span>
                  <span className="text-[#8892B0] group-open:rotate-180 transition-transform text-lg">+</span>
                </summary>
                <div className="px-4 pb-4"><p className="text-sm text-[#8892B0]">{faq.a}</p></div>
              </details>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8">
          {[{ icon: Shield, text: 'Secure Checkout' }, { icon: RefreshCw, text: 'Cancel Anytime' }, { icon: Headphones, text: '24/7 Support' }].map((badge) => (
            <div key={badge.text} className="flex items-center gap-2 text-[#8892B0]">
              <badge.icon size={18} className="text-[#00D4FF]" />
              <span className="text-sm">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
