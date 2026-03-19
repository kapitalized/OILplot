# **21 \- Stripe Billing Setup: B2B SaaS Monetization**

This guide covers the implementation of the Stripe-to-Supabase billing bridge, ensuring your B2B app can handle subscriptions, seat-based billing, and the Customer Portal.

## **1\. Manual Steps (Stripe Dashboard)**

1. **Products:** Create 'Starter' ($50/mo) and 'Pro' ($200/mo) products. Use **Recurring** pricing.  
2. **Customer Portal:** Enable under Settings \-\> Billing \-\> Customer Portal. Ensure "Subscription Cancelation" and "Plan Switching" are enabled.  
3. **API Keys:** Obtain your STRIPE\_SECRET\_KEY and NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY.  
4. **Webhooks:** \* Add a local listener using Stripe CLI: stripe listen \--forward-to localhost:3000/api/webhooks/stripe.  
   * Register your production URL: https://your-app.vercel.app/api/webhooks/stripe.  
   * Enable event: checkout.session.completed.

## **2\. The Stripe Utility (lib/stripe.ts)**

This file handles session creation for checkouts and the billing portal.

import Stripe from 'stripe';

export const stripe \= new Stripe(process.env.STRIPE\_SECRET\_KEY\!, {  
  apiVersion: '2025-01-27.acacia', // Use the latest stable version  
});

/\*\*  
 \* createCheckoutSession  
 \* Redirects the User (Owner) to the Stripe-hosted checkout page.  
 \*/  
export async function createCheckoutSession(orgId: string, priceId: string, customerEmail: string) {  
  return await stripe.checkout.sessions.create({  
    line\_items: \[{ price: priceId, quantity: 1 }\],  
    mode: 'subscription',  
    success\_url: \`${process.env.NEXT\_PUBLIC\_APP\_URL}/dashboard/billing?success=true\`,  
    cancel\_url: \`${process.env.NEXT\_PUBLIC\_APP\_URL}/dashboard/billing?canceled=true\`,  
    customer\_email: customerEmail,  
    metadata: { orgId }, // Critical for identifying the tenant in the webhook  
    subscription\_data: {  
      metadata: { orgId },  
    },  
  });  
}

## **3\. The Webhook Handler (app/api/webhooks/stripe/route.ts)**

This route receives the checkout.session.completed event and updates the organizations table in Supabase.

import { stripe } from '@/lib/stripe';  
import { createClient } from '@/lib/supabase/admin'; // Use Service Role client  
import { headers } from 'next/headers';

export async function POST(req: Request) {  
  const body \= await req.text();  
  const signature \= headers().get('Stripe-Signature')\!;  
    
  let event;  
  try {  
    event \= stripe.webhooks.constructEvent(body, signature, process.env.STRIPE\_WEBHOOK\_SECRET\!);  
  } catch (err: any) {  
    return new Response(\`Webhook Error: ${err.message}\`, { status: 400 });  
  }

  if (event.type \=== 'checkout.session.completed') {  
    const session \= event.data.object as any;  
    const orgId \= session.metadata.orgId;  
    const stripeCustomerId \= session.customer;  
    const stripeSubscriptionId \= session.subscription;

    const supabase \= createClient();  
    await supabase  
      .from('organizations')  
      .update({  
        stripe\_customer\_id: stripeCustomerId,  
        stripe\_subscription\_id: stripeSubscriptionId,  
        plan\_status: 'active',  
        plan\_tier: 'pro', // Map this from the Price ID if multiple tiers  
      })  
      .eq('id', orgId);  
  }

  return new Response(null, { status: 200 });  
}

## **4\. Cursor Prompt: Billing Dashboard**

"Using 21\_stripe\_billing\_setup.md, build the /dashboard/billing page.

1. Show the current plan status (from the organizations table).  
2. Create two plan cards: 'Starter' and 'Pro'.  
3. If the user is on a free/inactive plan, show a 'Upgrade' button that calls a Server Action to create a Stripe Checkout Session.  
4. If the user is already active, show a 'Manage Billing' button that opens the Stripe Customer Portal."

## **5\. Security & Multi-Tenancy**

* **Org Guard:** Ensure only users with the owner role can access the billing page.  
* **Metadata Integrity:** Always include the org\_id in Stripe metadata to prevent cross-tenant billing errors.