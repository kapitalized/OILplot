import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'Pricing',
  description: `Plans and pricing for ${BRAND.name}. Starter and Pro tiers for teams.`,
};

const plans = [
  { name: 'Starter', price: '$50', period: '/mo', description: 'For small teams getting started.' },
  { name: 'Pro', price: '$200', period: '/mo', description: 'For growing teams and heavy usage.' },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-2 text-muted-foreground">
        Simple plans. Stripe billing. Upgrade or manage from the dashboard.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-2 text-2xl font-bold">
              {plan.price}
              <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: BRAND.colors.primary }}
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
