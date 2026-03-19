'use client';

/**
 * Shown after successful Stripe checkout. Stripe redirects here via success_url.
 */
import Link from 'next/link';

export default function BillingConfirmationPage() {
  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-6">
      <div className="rounded-full bg-green-100 dark:bg-green-900/30 w-16 h-16 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">Subscription confirmed</h1>
      <p className="text-muted-foreground">
        Thank you for subscribing. Your plan is now active. You can manage billing and view invoices from the billing page.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard/billing"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Go to Billing
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
