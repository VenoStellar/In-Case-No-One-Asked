import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient} from '@/lib/sanity/client';
import {isAdminRequest, mutationConfigErrorResponse, unauthorizedResponse} from '../../_sanity';

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    requireSanityWriteToken();
    const {id} = await context.params;
    const body = await request.json();
    const title = String(body.title || '').trim();
    const bodyHtml = String(body.bodyHtml || '').trim();

    if (!title || !bodyHtml) {
      return NextResponse.json({error: 'title and bodyHtml are required.'}, {status: 400});
    }

    const post = await sanityWriteClient
      .patch(id)
      .set({
        title,
        category: String(body.category || 'Dispatch').trim(),
        byline: String(body.byline || '').trim(),
        bodyHtml,
        tag: String(body.tag || '').trim(),
        imageUrl: String(body.imageUrl || '').trim(),
      })
      .commit();

    return NextResponse.json({post});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    requireSanityWriteToken();
    const {id} = await context.params;
    await sanityWriteClient.delete(id);
    await sanityWriteClient.delete(`reaction-${id}`).catch(() => undefined);
    return NextResponse.json({ok: true});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
