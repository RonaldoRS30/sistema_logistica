import React, { useState } from "react";
import {
  Package, Database, CheckCircle, ArrowDown, ArrowUp, BarChart, PieChart as PieChartIcon, BarChart2,
  FileText, List, ArrowRight
} from "lucide-react";
import logo from "@/assets/logo.png";
import ModalFiltroControlVisible from "./ModalFiltroControlVisible";

export default function ReportesAlmacenDashboard() {
  const [modalControlVisible, setModalControlVisible] = useState(false);

  const REPORTES_BOTONES = [
    { label: "Control Visible de Almacen por Producto", icon: Package, color: "text-teal-600", bg: "bg-teal-50", hover: "hover:border-teal-500 hover:shadow-teal-500/20", action: () => setModalControlVisible(true) },
    { label: "Existencias Valoradas x Producto", icon: Database, color: "text-teal-600", bg: "bg-teal-50", hover: "hover:border-teal-500 hover:shadow-teal-500/20" },
    { label: "Existencias Valoradas x Producto F SUNAT", icon: Database, color: "text-teal-600", bg: "bg-teal-50", hover: "hover:border-teal-500 hover:shadow-teal-500/20" },
    { label: "Resumen de Entradas", icon: ArrowDown, color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:border-emerald-500 hover:shadow-emerald-500/20" },
    { label: "Resumen de Salidas", icon: ArrowUp, color: "text-amber-600", bg: "bg-amber-50", hover: "hover:border-amber-500 hover:shadow-amber-500/20" },
    { label: "Saldos Generales", icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50", hover: "hover:border-indigo-500 hover:shadow-indigo-500/20" },
    { label: "Entradas y Salidas por Grupo Analítico", icon: List, color: "text-slate-600", bg: "bg-slate-100", hover: "hover:border-slate-500 hover:shadow-slate-500/20" },
    { label: "Entradas y Salidas", icon: List, color: "text-slate-600", bg: "bg-slate-100", hover: "hover:border-slate-500 hover:shadow-slate-500/20" },
  ];

  const ESTADISTICAS_BOTONES = [
    { label: "Diagrama de Sectores", icon: PieChartIcon, color: "text-blue-600", bg: "bg-blue-50", hover: "hover:border-blue-500 hover:shadow-blue-500/20" },
    { label: "Diagrama de Barras", icon: BarChart, color: "text-cyan-600", bg: "bg-cyan-50", hover: "hover:border-cyan-500 hover:shadow-cyan-500/20" },
    { label: "Diagrama de Sectores x Mes", icon: PieChartIcon, color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:border-emerald-500 hover:shadow-emerald-500/20" },
    { label: "Diagrama de Barras x Mes", icon: BarChart, color: "text-amber-600", bg: "bg-amber-50", hover: "hover:border-amber-500 hover:shadow-amber-500/20" },
    { label: "Diagrama de Barras Horizontales", icon: BarChart2, color: "text-purple-600", bg: "bg-purple-50", hover: "hover:border-purple-500 hover:shadow-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-5 font-sans">
      {/* Contenedor Principal con estilo ERP Premium */}
      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 min-h-[calc(100vh-100px)] flex flex-col overflow-hidden border border-slate-200/60">
        
        {/* Cabecera Principal */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="VC Corporation" className="h-8 object-contain" />
            <div className="h-6 w-px bg-slate-200"></div>
            <h1 className="text-slate-700 uppercase font-black tracking-widest text-sm">
              SISTEMA DE ALMACÉN
            </h1>
          </div>
        </div>

        {/* Cabecera Secundaria (Barra Corporativa Oscura) */}
        <div className="bg-[#1a2a3a] px-6 py-3 flex items-center justify-between border-b border-[#122030] shadow-inner">
          <div className="flex items-center gap-3">
            <FileText className="text-teal-400 w-5 h-5" />
            <h2 className="text-white font-black uppercase tracking-widest text-xs">
              MÓDULO DE REPORTES Y CONSULTAS
            </h2>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-10 bg-slate-50/50">
          
          {/* Columna Izquierda - Composición Gráfica */}
          <div className="hidden lg:flex lg:col-span-4 lg:flex-col lg:items-center lg:justify-center">
            <div className="relative w-full max-w-sm rounded-[2rem] p-1 bg-gradient-to-br from-teal-500/20 to-slate-300/20 shadow-2xl">
              <div className="w-full flex items-center justify-center flex-col h-80 bg-white rounded-[1.8rem] overflow-hidden relative shadow-inner">
                {/* Patrón de fondo corporativo */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#1a2a3a 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                
                {/* Logo Flotante y Título */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
                  <div className="p-5 bg-white rounded-2xl shadow-xl shadow-teal-900/5">
                    <img src={logo} alt="Logo" className="w-40 object-contain" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mt-4" style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.05))" }}>
                    ALMACÉN
                  </h3>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.2em] bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">
                    Módulo Analítico
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Central - Reportes */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
              <FileText className="text-slate-400 w-5 h-5" />
              <h3 className="text-slate-800 font-black uppercase tracking-wider text-sm">Reportes Estándar</h3>
            </div>
            <div className="flex flex-col gap-3">
              {REPORTES_BOTONES.map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action ? btn.action : undefined}
                  className={`group relative flex items-center h-[52px] bg-white border border-slate-200/80 rounded-lg shadow-sm hover:-translate-y-[2px] transition-all duration-200 overflow-hidden ${btn.hover}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${btn.bg.replace("bg-", "bg-").replace("50", "500")} transition-all group-hover:w-1.5`}></div>
                  <div className={`flex items-center justify-center w-12 h-full ${btn.bg} border-r border-slate-100`}>
                    <btn.icon size={18} className={`${btn.color} transition-transform group-hover:scale-110`} strokeWidth={2} />
                  </div>
                  <span className="text-slate-600 text-[12px] font-bold px-4 tracking-wide group-hover:text-slate-900">
                    {btn.label}
                  </span>
                  <div className="ml-auto pr-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight size={14} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Estadísticas */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
              <PieChartIcon className="text-slate-400 w-5 h-5" />
              <h3 className="text-slate-800 font-black uppercase tracking-wider text-sm">Gráficos y Estadísticas</h3>
            </div>
            <div className="flex flex-col gap-3">
              {ESTADISTICAS_BOTONES.map((btn, i) => (
                <button
                  key={i}
                  className={`group relative flex items-center h-[52px] bg-white border border-slate-200/80 rounded-lg shadow-sm hover:-translate-y-[2px] transition-all duration-200 overflow-hidden ${btn.hover}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${btn.bg.replace("bg-", "bg-").replace("50", "500")} transition-all group-hover:w-1.5`}></div>
                  <div className={`flex items-center justify-center w-12 h-full ${btn.bg} border-r border-slate-100`}>
                    <btn.icon size={18} className={`${btn.color} transition-transform group-hover:scale-110`} strokeWidth={2} />
                  </div>
                  <span className="text-slate-600 text-[12px] font-bold px-4 tracking-wide group-hover:text-slate-900">
                    {btn.label}
                  </span>
                  <div className="ml-auto pr-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight size={14} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      <ModalFiltroControlVisible 
        isOpen={modalControlVisible} 
        onClose={() => setModalControlVisible(false)} 
      />
    </div>
  );
}
