import {NextRequest, NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'icnoa2026';

    if (secret !== expectedSecret) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    revalidatePath('/', 'layout');

    return NextResponse.json({revalidated: true});
  } catch (error) {
    return NextResponse.json({error: 'Revalidation failed'}, {status: 500});
  }
}
