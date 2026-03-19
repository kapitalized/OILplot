import crypto from 'crypto';
import type { CollectionConfig } from 'payload';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters for AES-256.');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * External Integrations — encrypted API keys (blueprint @19_payload_integrations).
 */
export const ExternalIntegrations: CollectionConfig = {
  slug: 'external-integrations',
  admin: {
    useAsTitle: 'serviceName',
    group: 'Admin',
    description: 'Manage 3rd-party API credentials (Xero, Stripe, ERP). Encrypted at rest.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    create: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    { name: 'serviceName', type: 'text', required: true, admin: { placeholder: 'e.g. Client Xero Integration' } },
    {
      name: 'environment',
      type: 'select',
      defaultValue: 'sandbox',
      options: [
        { label: 'Sandbox / Testing', value: 'sandbox' },
        { label: 'Production / Live', value: 'production' },
      ],
    },
    {
      name: 'apiKey',
      type: 'text',
      required: true,
      admin: { description: 'Paste plain-text secret; it will be encrypted on save.' },
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if ((operation === 'create' || operation === 'update') && value && typeof value === 'string' && !value.includes(':')) {
              return encrypt(value);
            }
            return value;
          },
        ],
      },
    },
  ],
};
