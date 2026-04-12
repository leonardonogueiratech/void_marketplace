import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/");

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/seja-artesao");

  return (
    <Providers>
      <div className="flex min-h-screen bg-neutral-50">
        <DashboardSidebar artisan={artisan} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </Providers>
  );
}
