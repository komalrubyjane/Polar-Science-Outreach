import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (token) {
    await prisma.newsletterSubscriber.updateMany({
      where: { token, confirmedAt: null },
      data: { confirmedAt: new Date() },
    });
  }
  return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/newsletter/confirmed`);
}
