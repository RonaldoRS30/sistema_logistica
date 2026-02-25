import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FileSpreadsheet, 
  Wallet2, 
  Landmark, 
  Scale, 
  Coins,
  FileText
} from "lucide-react";

export default function KpisCotizaciones({ data = [] }) {
  // 👉 Cálculos lógicos de negocio
  const stats = useMemo(() => {
    const total = data.length;

    // Supongamos que c.moneda es 'S/' o '$' o similar
    const soles = data.filter(c => c.moneda?.includes('S') || !c.moneda);
    const dolares = data.filter(c => c.moneda?.includes('$'));

    const montoTotalSoles = soles.reduce((acc, c) => acc + (parseFloat(c.tot_c) || 0), 0);
    const montoTotalDolares = dolares.reduce((acc, c) => acc + (parseFloat(c.tot_c) || 0), 0);

    return {
      total,
      montoTotalSoles,
      montoTotalDolares,
      promedioSoles: total > 0 ? montoTotalSoles / (soles.length || 1) : 0,
      promedioDolares: total > 0 ? montoTotalDolares / (dolares.length || 1) : 0,
    };
  }, [data]);

  // 👉 Configuración visual de las cards (V&C Design System)
  const cards = [
    {
      label: "Total Cotizaciones",
      value: stats.total,
      icon: FileSpreadsheet,
      category: "Cantidad",
      unit: "Docs",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100",
      iconBg: "bg-blue-100/60",
    },
    {
      label: "Monto Total S/.",
      value: stats.montoTotalSoles,
      icon: Wallet2,
      category: "Ingresos PEN",
      unit: "Soles",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100/60",
    },
    {
      label: "Monto Total $",
      value: stats.montoTotalDolares,
      icon: Landmark,
      category: "Ingresos USD",
      unit: "Dólares",
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-100",
      iconBg: "bg-violet-100/60",
    },
    {
      label: "Promedio S/.",
      value: stats.promedioSoles,
      icon: Scale,
      category: "Ratio PEN",
      unit: "Soles",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-100",
      iconBg: "bg-rose-100/60",
    },
    {
      label: "Promedio $",
      value: stats.promedioDolares,
      icon: Coins,
      category: "Ratio USD",
      unit: "Dólares",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
      iconBg: "bg-amber-100/60",
    },
  ];

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 w-full">
      {cards.map((kpi, idx) => {
        const Icon = kpi.icon;
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`
              relative overflow-hidden p-5
              rounded-[2.2rem] border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
              flex flex-col justify-between min-h-[145px]
              ${kpi.bg} ${kpi.border} transition-all duration-300
            `}
          >
            {/* HEADER DEL KPI: Icono y Categoría */}
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-2.5 rounded-2xl ${kpi.iconBg} shadow-sm`}>
                <Icon className={`w-5 h-5 ${kpi.text}`} strokeWidth={2.5} />
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${kpi.border} bg-white/60 ${kpi.text}`}>
                {kpi.category}
              </div>
            </div>

            {/* CUERPO DEL KPI: Valor y Etiqueta */}
            <div className="mt-4 relative z-10">
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 opacity-70 ${kpi.text}`}>
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <h3 className={`text-2xl font-[950] tracking-tighter leading-none ${kpi.text}`}>
                  {typeof kpi.value === 'number' 
                    ? kpi.value.toLocaleString('es-PE', { 
                        minimumFractionDigits: kpi.category.includes('Ingresos') || kpi.category.includes('Ratio') ? 2 : 0,
                        maximumFractionDigits: 2
                      }) 
                    : kpi.value}
                </h3>
                <span className={`text-[9px] font-black uppercase tracking-wider ${kpi.text} opacity-50`}>
                  {kpi.unit}
                </span>
              </div>
            </div>

            {/* DECORACIÓN FONDO: Icono de agua */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.1] ${kpi.text}`}>
              <Icon className="w-20 h-20 rotate-[15deg]" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}