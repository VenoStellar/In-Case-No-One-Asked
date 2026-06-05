import {NextResponse} from 'next/server';
import {sanityReadClient} from '@/lib/sanity/client';
import {contentQuery} from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Don't cache - always fetch fresh data

export async function GET() {
  const data = await sanityReadClient.fetch(contentQuery);

  return NextResponse.json(data);
}
