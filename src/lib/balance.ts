import { prisma } from "@/lib/prisma";

const ESCROW_DAYS = 15;

export async function getArtisanBalance(artisanId: string) {
  const escrowCutoff = new Date(Date.now() - ESCROW_DAYS * 24 * 60 * 60 * 1000);

  const [commissions, withdrawals] = await Promise.all([
    prisma.commission.findMany({
      where: { artisanId },
      select: {
        createdAt: true,
        saleAmount: true,
        amount: true,
        orderItem: { select: { order: { select: { status: true } } } },
      },
    }),
    prisma.withdrawal.findMany({
      where: { artisanId },
      select: { amount: true, status: true },
    }),
  ]);

  let releasedBalance = 0;
  let heldBalance = 0;
  let totalSales = 0;
  let totalCommissions = 0;

  for (const c of commissions) {
    totalSales += c.saleAmount;
    totalCommissions += c.amount;
    const net = c.saleAmount - c.amount;
    const isDelivered = c.orderItem.order.status === "DELIVERED";
    const isPastEscrow = c.createdAt <= escrowCutoff;

    if (isDelivered || isPastEscrow) releasedBalance += net;
    else heldBalance += net;
  }

  const lockedAmount = withdrawals
    .filter((w) => w.status === "PENDING" || w.status === "PROCESSING")
    .reduce((a, w) => a + w.amount, 0);

  const paidOutAmount = withdrawals
    .filter((w) => w.status === "PAID")
    .reduce((a, w) => a + w.amount, 0);

  const freeBalance = releasedBalance - lockedAmount - paidOutAmount;

  return { releasedBalance, heldBalance, totalSales, totalCommissions, lockedAmount, paidOutAmount, freeBalance };
}
