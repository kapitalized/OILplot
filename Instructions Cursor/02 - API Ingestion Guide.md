# **02 \- API Ingestion Guide: Receiving & Securing B2B Data**

In niche finance, construction, or manufacturing, your app acts as a central hub. You must handle data from **Client Data Sources** (Incoming) and connect to **External Service Integrations** (Outgoing) securely.

## **1\. Security Protocols: Hashing vs. Encryption**

| Scenario | Terminology | Method | Purpose |
| :---- | :---- | :---- | :---- |
| **Incoming Connection** | **Client Data Source API** | **Hashing** (SHA-256) | Verify external system identity (e.g., Client ERP) without storing the secret. |
| **Outgoing Request** | **External Service Integration** | **Encryption** (AES-256) | Store and retrieve 3rd-party keys (e.g., Stripe, Xero) to pull data on the client's behalf. |

## **2\. Client Data Source API (Incoming)**

This is managed by the Super Admin in the APIKeys collection. These keys allow external systems to push data into your platform.

### **Step 1: The Collection Setup (Payload CMS)**

The Super Admin creates a new "API Key" for a specific Organization.

* **Field:** keyName (e.g., "Client-X-ERP-Link")  
* **Field:** apiKey (Hidden/Write-only)  
* **Hook:** beforeChange hashes the value using crypto.createHash('sha256').

### **Step 2: Cursor Prompt for Ingestion Logic**

"Create a Next.js Route Handler for POST requests at /api/ingest.

1. This is the **Client Data Source API** endpoint.  
2. Extract the 'x-api-key' from the header, hash it, and compare it against the APIKeys collection in Payload.  
3. If valid, map the payload to the associated 'org\_id' and insert into the 'raw\_ingestion' table in Supabase.  
4. Return a 201 Created on success or 401 Unauthorized on failure."

## **3\. External Service Integrations (Outgoing)**

These are credentials for 3rd-party services your app calls. Use the **Secret Vault** pattern to store these encrypted so the server can retrieve them.

import crypto from 'crypto';

const ENCRYPTION\_KEY \= process.env.ENCRYPTION\_KEY; // 32 chars  
const IV\_LENGTH \= 16;

export const encryptKey \= (text: string) \=\> {  
  const iv \= crypto.randomBytes(IV\_LENGTH);  
  const cipher \= crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION\_KEY\!), iv);  
  const encrypted \= Buffer.concat(\[cipher.update(text, 'utf8'), cipher.final()\]);  
  const tag \= cipher.getAuthTag();  
  return \`${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}\`;  
}

## **4\. Instructions for Cursor (Advanced Setup)**

### **Item 1: The Decryption Utility**

**Goal:** Allow your server-side logic to "unlock" stored integration keys for outgoing calls.

**Cursor Prompt:** "Create a utility file lib/crypto-utils.ts.

1. Implement a decryptKey(encryptedText: string) function using aes-256-gcm.  
2. It must parse the 'iv:tag:data' format and return the plain-text key for temporary use in the request."

### **Item 2: Testing & Verification**

**Goal:** Simulate a client system pushing data to your app.

**Cursor Prompt:** "Create a bash script scripts/test-client-api.sh.

1. Use curl to send a POST request to /api/ingest.  
2. Include a mock 'x-api-key' in the headers.  
3. Send a sample JSON payload representing a Finance or Manufacturing event."

## **5\. Data "Buffer" Architecture**

1. **The Landing Table:** Push raw data into raw\_ingestion (jsonb).  
2. **The Worker:** Use a Supabase Edge Function to move valid data into structured tables.  
3. **The Benefit:** Total resilience against malformed data from a **Client Data Source API**.