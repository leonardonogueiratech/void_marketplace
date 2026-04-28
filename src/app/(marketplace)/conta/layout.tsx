import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ContaSidebar } from "@/components/conta/sidebar";

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <ContaSidebar user={session.user} role={session.user.role ?? "CUSTOMER"} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
