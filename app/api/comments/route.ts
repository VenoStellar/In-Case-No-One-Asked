import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient} from '@/lib/sanity/client';
import {mutationConfigErrorResponse} from '../_sanity';

export async function POST(request: NextRequest) {
  try {
    requireSanityWriteToken();
    const body = await request.json();
    const authorName = String(body.authorName || '').trim();
    const content = String(body.content || '').trim();
    const postId = body.postId ? String(body.postId).trim() : null;
    const parentCommentId = body.parentCommentId ? String(body.parentCommentId).trim() : null;

    if (!authorName || !content) {
      return NextResponse.json({error: 'authorName and content are required.'}, {status: 400});
    }

    // Create the comment
    const commentData: any = {
      _type: 'comment',
      authorName,
      content,
      createdAt: new Date().toISOString(),
    };

    // Add post reference if this is a post comment (not reader mail)
    if (postId) {
      commentData.post = {
        _type: 'reference',
        _ref: postId,
      };
    }

    // If this is a reply, add the parent comment reference
    if (parentCommentId) {
      commentData.parentComment = {
        _type: 'reference',
        _ref: parentCommentId,
      };
    }

    const comment = await sanityWriteClient.create(commentData);

    // If this is a reply, add it to the parent comment's replies array
    if (parentCommentId) {
      await sanityWriteClient
        .patch(parentCommentId)
        .append('replies', [
          {
            _type: 'reference',
            _ref: comment._id,
          },
        ])
        .commit();
    }

    // Add the comment to the post's comments array (only for top-level comments on posts)
    if (!parentCommentId && postId) {
      await sanityWriteClient
        .patch(postId)
        .append('comments', [
          {
            _type: 'reference',
            _ref: comment._id,
          },
        ])
        .commit();
    }

    return NextResponse.json({comment}, {status: 201});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
