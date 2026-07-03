import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MetricSchema = z.object({
  type: z.enum(['ARTICLE_VIEW', 'HOMEPAGE_SLOT_CLICK', 'AD_IMPRESSION']),
  payload: z.record(z.string(), z.any()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = MetricSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid metric payload' }, { status: 400 });
    }

    const { type, payload } = result.data;

    // Fire and forget, no await to block response
    if (type === 'ARTICLE_VIEW') {
      const articleId = payload.articleId as string;
      if (articleId) {
        prisma.articleMetric.upsert({
          where: { articleId },
          update: { views: { increment: 1 } },
          create: { articleId, views: 1 },
        }).catch(console.error);
      }
    } else if (type === 'HOMEPAGE_SLOT_CLICK') {
      const slotName = payload.slotName as string;
      if (slotName) {
        prisma.homepageSlotMetric.upsert({
          where: { slotName },
          update: { clicks: { increment: 1 } },
          create: { slotName, clicks: 1, views: 1 },
        }).catch(console.error);
      }
    } else if (type === 'AD_IMPRESSION') {
      const campaignId = payload.campaignId as string;
      const actionType = payload.actionType as string; // 'VIEW' or 'CLICK'
      if (campaignId && actionType) {
        prisma.adImpression.create({
          data: {
            campaignId,
            type: actionType,
            userAgent: req.headers.get('user-agent') || undefined,
            // Simple IP extraction, varies by proxy/deployment
            ipAddress: req.headers.get('x-forwarded-for') || undefined,
          }
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Metrics API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
