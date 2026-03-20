import { BRAND } from '@/lib/brand';
import ContactForm from '@/components/ContactForm';
import { getAppName } from '@/lib/app-name';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return getPageMetadata('contact');
}

export default async function ContactPage() {
  const appName = await getAppName();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Lodge an issue or ask a question. We&apos;ll get back to you soon.
      </p>
      <div className="mt-12 rounded-xl border bg-card p-6">
        <ContactForm />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {appName} — {BRAND.slogan}
      </p>
    </div>
  );
}
