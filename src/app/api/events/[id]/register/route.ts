import { prisma } from '@/lib/db';
import { handle, created, ok, fail, readJson, badRequest } from '@/lib/api';
import { requireUser } from '@/lib/auth/session';
import { eventRegistrationSchema } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';
import { track } from '@/lib/analytics';
import { notify } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const input = eventRegistrationSchema.parse(await readJson(req));

  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event || event.status !== 'PUBLISHED') return fail(404, 'Event not found');
  if (event.registrationStatus === 'CLOSED') badRequest('Registration is closed for this event');
  if (
    event.capacity != null &&
    event._count.registrations >= event.capacity &&
    event.registrationStatus !== 'WAITLIST'
  ) {
    badRequest('This event is at capacity');
  }

  const registration = await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: id, userId: user.id } },
    create: { eventId: id, userId: user.id, name: input.name, email: input.email, note: input.note || null },
    update: { name: input.name, email: input.email, note: input.note || null },
  });

  await recordAudit({ actorId: user.id, action: 'event.register', entityType: 'Event', entityId: id, req });
  void track({ type: 'event_registration', entityType: 'Event', entityId: id });
  await notify({
    userId: user.id,
    type: 'EVENT_REMINDER',
    title: `You are registered for ${event.title}`,
    body: `We will remind you before it starts.`,
    linkUrl: `/events/${event.slug}`,
  });

  return created({ id: registration.id });
});

export const DELETE = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  await prisma.eventRegistration.deleteMany({ where: { eventId: id, userId: user.id } });
  return ok({ cancelled: true });
});
