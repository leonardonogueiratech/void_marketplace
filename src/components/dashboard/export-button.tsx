"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Row {
  [key: string]: string | number | null | undefined;
}

interface Props {
  data: Row[];
  filename: string;
  label?: string;
}

function toCSV(data: Row[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]!);
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function ExportButton({ data, filename, label = "Exportar CSV" }: Props) {
  function handleExport() {
    const csv = toCSV(data);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data.length}
      className="border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
    >
      <Download className="mr-2 size-4" />
      {label}
    </Button>
  );
}
