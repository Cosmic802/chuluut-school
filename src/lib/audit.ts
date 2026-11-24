import { prisma } from "./db";

export async function audit(user: { id: string; email: string }, action: string, entity: string, entityId: string) {
  await prisma.auditLog.create({
    data: { userId: user.id, userEmail: user.email, action, entity, entityId },
  });
}
