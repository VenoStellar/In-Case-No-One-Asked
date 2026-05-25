import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient} from '@/lib/sanity/client';
import {isAdminRequest, mutationConfigErrorResponse, unauthorizedResponse} from '../_sanity';

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    requireSanityWriteToken();
    const body = await request.json();
    const title = String(body.title || '').trim();
    const bodyHtml = String(body.bodyHtml || '').trim();

    if (!title || !bodyHtml) {
      return NextResponse.json({error: 'title and bodyHtml are required.'}, {status: 400});
    }

    const post = await sanityWriteClient.create({
      _type: 'post',
      title,
      category: String(body.category || 'Dispatch').trim(),
      byline: String(body.byline || '').trim(),
      bodyHtml,
      tag: String(body.tag || '').trim(),
      imageUrl: String(body.imageUrl || '').trim(),
      isPublished: true,
      publishedAt: new Date().toISOString(),
      sortOrder: Number(body.sortOrder || Date.now()),
    });

    return NextResponse.json({post}, {status: 201});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
