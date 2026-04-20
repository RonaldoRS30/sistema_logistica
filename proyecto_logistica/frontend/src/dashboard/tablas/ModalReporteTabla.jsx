/**
 * ModalReporteTabla — Componente reutilizable de reporte corporativo
 *
 * Props:
 *   isOpen        : boolean
 *   onClose       : () => void
 *   titulo        : string  - Ej: "REPORTE DE ALMACENES"
 *   registros     : array   - Datos a mostrar
 *   columnas      : [{ label, render }]  - Definición de columnas
 *   onDescargar   : async () => void     - Función que descarga el Excel
 *   downloading   : boolean
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, FileSpreadsheet } from "lucide-react";
import logo from "@/assets/logo.png";

export default function ModalReporteTabla({
  isOpen,
  onClose,
  titulo = "REPORTE",
  registros = [],
  columnas = [],
  onDescargar,
  downloading = false,
}) {
  if (!isOpen) return null;

  const vacio = registros.length === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22 }}
          className="bg-white shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg border border-slate-200"
        >
          {/* ═══════════════════════════════════════
              CABECERA del MODAL (toolbar)
          ═══════════════════════════════════════ */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#1a2a3a] border-b border-[#122030]">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-black text-sm uppercase tracking-widest">
                Vista Previa — {titulo}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Botón Descargar XLS */}
              <button
                onClick={onDescargar}
                disabled={vacio || downloading}
                title="Descargar Excel"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {downloading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />
                }
                {downloading ? "Descargando..." : "Descargar Excel"}
              </button>
              {/* Cerrar */}
              <button
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              CONTENIDO (cabecera estilo SIGeCom + tabla)
          ═══════════════════════════════════════ */}
          <div className="overflow-y-auto flex-1 bg-white">
            {/* Encabezado del reporte (igual al de la imagen) */}
            <div className="px-8 pt-6 pb-4 flex items-start justify-between border-b border-slate-200">
              {/* Logo VC Corporation */}
              <div className="flex-shrink-0">
                <img src={logo} alt="VC Corporation" className="h-14 w-auto" />
              </div>

              {/* Título centrado */}
              <div className="flex-1 flex justify-center items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 text-center">
                  {titulo}
                </h2>
              </div>

              {/* Botón XLS estilo SIGeCom */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <button
                  onClick={onDescargar}
                  disabled={vacio || downloading}
                  title="Exportar a Excel"
                  className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="relative w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-emerald-700 transition-colors">
                    {downloading
                      ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                      : <span className="text-white font-black text-[13px] tracking-wider">XLS</span>
                    }
                    <Download className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-300 bg-emerald-800 rounded-full p-0.5" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Excel
                  </span>
                </button>
              </div>
            </div>

            {/* Tabla de datos */}
            {vacio ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                <FileSpreadsheet className="w-12 h-12 opacity-30" />
                <p className="text-sm font-bold uppercase tracking-widest">Sin registros para mostrar</p>
                <p className="text-xs text-slate-300">Aplique los filtros y procese la búsqueda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr>
                      {columnas.map((col, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 bg-[#2a9d8f] text-white font-black uppercase tracking-widest text-center border border-[#21867a] text-[10px]"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r, ri) => (
                      <tr
                        key={ri}
                        className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                      >
                        {columnas.map((col, ci) => (
                          <td
                            key={ci}
                            className="px-4 py-2 border border-slate-200 text-slate-700 align-top"
                          >
                            {col.render ? col.render(r) : (r[col.field] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer de registros */}
                <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/50 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Total: {registros.length} registro(s)
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
