import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: session.user.id },
      conversation: { participants: { some: { userId: session.user.id } } },
    },
  });

  return NextResponse.json({ count });
}
