import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient} from '@/lib/sanity/client';
import {mutationConfigErrorResponse} from '../_sanity';

const countFields = ['fireCount', 'deadCount', 'preachCount', 'perfectCount', 'teaCount'] as const;

export async function POST(request: NextRequest) {
  try {
    requireSanityWriteToken();
    const body = await request.json();
    const postId = String(body.postId || '').trim();

    if (!postId) {
      return NextResponse.json({error: 'postId is required.'}, {status: 400});
    }

    const counts = Object.fromEntries(
      countFields.map((field) => [field, Math.max(0, Number(body[field] || 0))]),
    );

    const reaction = await sanityWriteClient.createOrReplace({
      _id: `reaction-${postId}`,
      _type: 'reaction',
      postId,
      ...counts,
    });

    return NextResponse.json({reaction});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
