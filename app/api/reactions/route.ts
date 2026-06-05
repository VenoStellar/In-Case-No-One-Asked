import {NextRequest, NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {sanityWriteClient} from '@/lib/sanity/client';
import {mutationConfigErrorResponse} from '../_sanity';

const countFields = ['heartCount', 'likeCount', 'dislikeCount', 'laughCount', 'teaCount'] as const;
type CountField = (typeof countFields)[number];

function isCountField(value: string): value is CountField {
  return countFields.includes(value as CountField);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const postId = String(body.postId || '').trim();
    const field = String(body.field || '').trim();
    const delta = Number(body.delta || 0);

    if (!postId) {
      return NextResponse.json({error: 'postId is required.'}, {status: 400});
    }

    if (!isCountField(field)) {
      return NextResponse.json({error: 'A valid reaction field is required.'}, {status: 400});
    }

    if (delta !== 1 && delta !== -1) {
      return NextResponse.json({error: 'delta must be 1 or -1.'}, {status: 400});
    }

    const reactionId = `reaction-${postId}`;

    await sanityWriteClient.createIfNotExists({
      _id: reactionId,
      _type: 'reaction',
      postId,
      heartCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      laughCount: 0,
      teaCount: 0,
    });

    const currentCounts = await sanityWriteClient.fetch<Record<CountField, number> | null>(
      `*[_id == $reactionId][0]{heartCount, likeCount, dislikeCount, laughCount, teaCount}`,
      {reactionId},
    );
    const nextCount = Math.max(0, Number(currentCounts?.[field] || 0) + delta);

    const reaction = await sanityWriteClient.patch(reactionId).set({[field]: nextCount}).commit();

    // Revalidate the home page to reflect updated reactions
    revalidatePath('/', 'layout');

    return NextResponse.json({reaction});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
