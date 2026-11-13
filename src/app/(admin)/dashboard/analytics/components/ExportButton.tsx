"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  data: { month: string; revenue: number; expenses: number }[];
}

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    // 1. Create CSV Headers
    const headers = ["Month", "Revenue (INR)", "Expenses (INR)", "Net Profit (INR)"];
    const csvRows = [headers.join(",")];

    // 2. Add Data Rows
    data.forEach(row => {
      const profit = row.revenue - row.expenses;
      csvRows.push(`${row.month},${row.revenue},${row.expenses},${profit}`);
    });

    // 3. Convert to CSV and Download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fitcore_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleExport}
      className="bg-[#09090b] border border-white/10 text-white hover:bg-white/5 font-medium h-11 px-6 rounded-xl transition-colors"
    >
      <Download className="mr-2 h-4 w-4" /> Export Report (CSV)
    </Button>
  );
}