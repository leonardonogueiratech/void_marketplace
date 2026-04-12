import { Providers } from "@/components/providers";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
        <Link href="/" className="mb-8">
          <img src="/logo.svg" alt="Feito de Gente" className="h-16 w-auto" />
        </Link>
        {children}
      </div>
    </Providers>
  );
}
