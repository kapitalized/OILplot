import { NextResponse } from 'next/server';
import { isNeonAuthConfigured } from '@/lib/auth/server';

/** Lets the browser know if Neon Auth is actually wired (matches /api/auth handler). */
export async function GET() {
  return NextResponse.json({ neonAuth: isNeonAuthConfigured() });
}
