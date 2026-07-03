import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pushService } from '@/lib/services/PushService';
import { newsletterService } from '@/lib/services/NewsletterService';

const SubscribeSchema = z.object({
  type: z.enum(['PUSH', 'NEWSLETTER']),
  payload: z.record(z.string(), z.any()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = SubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { type, payload } = result.data;

    if (type === 'PUSH') {
      const { endpoint, keys, topics } = payload;
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return NextResponse.json({ error: 'Missing push subscription keys' }, { status: 400 });
      }
      await pushService.subscribe(endpoint, keys.p256dh, keys.auth, topics);
    } else if (type === 'NEWSLETTER') {
      const { email, topics } = payload;
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
      }
      await newsletterService.subscribe(email, topics);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Subscribe Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
