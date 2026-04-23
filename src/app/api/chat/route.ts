import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/chat — list conversations for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const userId = session.user.id;

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, image: true, role: true, artisanProfile: { select: { storeName: true, slug: true, logoImage: true } } } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const conversations = participations.map((p) => {
    const conv = p.conversation;
    const other = conv.participants.find((cp) => cp.userId !== userId)?.user;
    const lastMessage = conv.messages[0] ?? null;
    const unread = conv.messages.filter((m) => m.senderId !== userId && !m.readAt).length;
    return {
      id: conv.id,
      updatedAt: conv.updatedAt,
      other: other
        ? {
            id: other.id,
            name: other.artisanProfile?.storeName ?? other.name ?? "Usuário",
            image: other.artisanProfile?.logoImage ?? other.image,
            slug: other.artisanProfile?.slug ?? null,
          }
        : null,
      lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt } : null,
      unread,
    };
  });

  return NextResponse.json(conversations);
}

// POST /api/chat — create or find existing conversation with another user
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const userId = session.user.id;
  const { otherUserId } = await req.json();

  if (!otherUserId || otherUserId === userId) {
    return NextResponse.json({ error: "Usuário inválido." }, { status: 400 });
  }

  // Check if conversation already exists between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: { participants: true },
  });

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
  });

  return NextResponse.json({ id: conversation.id }, { status: 201 });
}
