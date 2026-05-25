import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient} from '@/lib/sanity/client';
import {mutationConfigErrorResponse} from '../_sanity';

export async function POST(request: NextRequest) {
  try {
    requireSanityWriteToken();
    const body = await request.json();
    const authorName = String(body.authorName || '').trim();
    const content = String(body.content || '').trim();

    if (!authorName || !content) {
      return NextResponse.json({error: 'authorName and content are required.'}, {status: 400});
    }

    const comment = await sanityWriteClient.create({
      _type: 'comment',
      authorName,
      content,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({comment}, {status: 201});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
