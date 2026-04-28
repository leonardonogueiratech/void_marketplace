import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const roleColors: Record<string, string> = {
    CUSTOMER: "bg-[#1e3a5f]/8 text-[#1e3a5f] border-[#1e3a5f]/15",
    ARTISAN:  "bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20",
    ADMIN:    "bg-[#e07b2a]/10 text-[#e07b2a] border-[#e07b2a]/20",
  };
  const roleLabels: Record<string, string> = {
    CUSTOMER: "Comprador", ARTISAN: "Artesão", ADMIN: "Admin",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Usuários</h1>
        <p className="text-sm text-neutral-500 mt-1">{users.length} usuário(s) cadastrado(s).</p>
      </div>

      <Card className="border-[#1e3a5f]/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e3a5f]/8">
                  {["Nome", "Email", "Perfil", "Pedidos", "Cadastro"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a5f]/6">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f7f3ed]/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-7 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center font-bold shrink-0">
                          {(u.name ?? u.email).slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#1e3a5f]">{u.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${roleColors[u.role] ?? roleColors.CUSTOMER}`}>
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-500">{u._count.orders}</td>
                    <td className="px-5 py-3 text-xs text-neutral-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
