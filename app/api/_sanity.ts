import {NextRequest, NextResponse} from 'next/server';
import {sanityAdminPassword} from '@/lib/sanity/env';

export function isAdminRequest(request: NextRequest) {
  return request.headers.get('x-admin-password') === sanityAdminPassword;
}

export function unauthorizedResponse() {
  return NextResponse.json({error: 'Admin password is required.'}, {status: 401});
}

export function mutationConfigErrorResponse(error: unknown) {
  return NextResponse.json(
    {error: error instanceof Error ? error.message : 'Sanity mutation failed.'},
    {status: 500},
  );
}
