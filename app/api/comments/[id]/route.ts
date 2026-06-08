import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient, sanityReadClient} from '@/lib/sanity/client';
import {isAdminRequest, mutationConfigErrorResponse, unauthorizedResponse} from '../../_sanity';

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    requireSanityWriteToken();
    const {id} = await context.params;

    // Fetch the comment to find its post and parent references
    const comment = await sanityReadClient.fetch(
      `*[_type == "comment" && _id == $id][0] { _id, "postId": post._ref, "parentCommentId": parentComment._ref }`,
      {id}
    );

    if (!comment) {
      return NextResponse.json({error: 'Comment not found'}, {status: 404});
    }

    // Remove from post's comments array (if it's a top-level comment)
    if (comment.postId && !comment.parentCommentId) {
      await sanityWriteClient
        .patch(comment.postId)
        .unset(['comments[_ref == $id]'], {id})
        .commit();
    }

    // Remove from parent comment's replies array (if it's a reply)
    if (comment.parentCommentId) {
      await sanityWriteClient
        .patch(comment.parentCommentId)
        .unset(['replies[_ref == $id]'], {id})
        .commit();
    }

    // Delete the comment itself
    await sanityWriteClient.delete(id);
    return NextResponse.json({ok: true});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
