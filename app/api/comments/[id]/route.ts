import {NextRequest, NextResponse} from 'next/server';
import {requireSanityWriteToken, sanityWriteClient} from '@/lib/sanity/client';
import {isAdminRequest, mutationConfigErrorResponse, unauthorizedResponse} from '../../_sanity';

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  try {
    requireSanityWriteToken();
    const {id} = await context.params;
    await sanityWriteClient.delete(id);
    return NextResponse.json({ok: true});
  } catch (error) {
    return mutationConfigErrorResponse(error);
  }
}
