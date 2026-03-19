# **11 \- Secure API Key Storage (The Vault Pattern)**

When you receive a key from an external service (e.g., a "Finance API Key" for Xero or a Stripe Secret), you need to store it so your server can use it, but keep it encrypted at rest.

## **1\. The Strategy: AES-256-GCM**

We use the native Node.js crypto module. This is preferred over "Hashing" because hashing is one-way (you can't get the key back out to use it). Encryption allows your server to "unlock" the key when it needs to make a request. **AES-256-GCM** is the industry standard because it provides both encryption and authenticity (tamper-proofing).

## **2\. Payload CMS Collection Implementation**

This is the logic you should prompt Cursor to write in your collections/Integrations.ts. It uses Payload CMS "Hooks" to ensure encryption happens automatically before the data hits the database.

import crypto from 'crypto';

const ENCRYPTION\_KEY \= process.env.ENCRYPTION\_KEY; // Must be 32 characters  
const IV\_LENGTH \= 16;   
const AUTH\_TAG\_LENGTH \= 16;

/\*\*  
 \* Encrypts plain text into iv:tag:ciphertext format  
 \*/  
export const encrypt \= (text: string) \=\> {  
  const iv \= crypto.randomBytes(IV\_LENGTH);  
  const cipher \= crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION\_KEY\!), iv);  
    
  const encrypted \= Buffer.concat(\[cipher.update(text, 'utf8'), cipher.final()\]);  
  const tag \= cipher.getAuthTag();

  return \`${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}\`;  
}

/\*\*  
 \* Decrypts the vault string back into plain text  
 \*/  
export const decrypt \= (vaultString: string) \=\> {  
  const \[ivHex, tagHex, encryptedHex\] \= vaultString.split(':');  
    
  const iv \= Buffer.from(ivHex, 'hex');  
  const tag \= Buffer.from(tagHex, 'hex');  
  const encryptedText \= Buffer.from(encryptedHex, 'hex');  
    
  const decipher \= crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION\_KEY\!), iv);  
  decipher.setAuthTag(tag);  
    
  return Buffer.concat(\[decipher.update(encryptedText), decipher.final()\]).toString('utf8');  
}

## **3\. The "Vault" User Experience**

1. **Admin Input:** You go to /admin, click "Add Integration," and paste your Stripe/ERP key into a plain text field.  
2. **Encryption Hook:** The moment you hit "Save," the Payload beforeChange hook runs the encrypt function.  
3. **Database Entry:** Supabase stores a string like 8f23...:a12c...:5e3f... (the IV, the Auth Tag, and the Ciphertext).  
4. **App Usage:** When your dashboard needs to fetch data, it calls the decrypt function. The plain-text key exists only in the server's RAM for a few milliseconds while the outgoing request is made.

## **4\. Safety Checks for Cursor**

* **No Client Access:** Never export the decryption function to the "client-side" (use client) of your Next.js app. This logic must stay in /lib/crypto-utils.ts and only be called by Server Actions or Route Handlers.  
* **Field Level Permissions:** In the Payload collection, set the access property of the apiKey field so that only users with the superadmin role can even see that the field exists in the API response.  
* **Environment Validation:** Prompt Cursor to add a check during app startup that ensures ENCRYPTION\_KEY is exactly 32 characters long.

## **5\. Cursor Prompt: Vault Setup**

"Using 11\_api\_key\_storage\_logic.md, implement the Secure Vault pattern.

1. Create a utility lib/crypto-utils.ts with the AES-256-GCM encrypt/decrypt functions.  
2. Create a Payload collection 'Integrations' that uses a beforeChange hook to encrypt the apiKey field.  
3. Ensure the apiKey is hidden from non-admin users via Payload access control."