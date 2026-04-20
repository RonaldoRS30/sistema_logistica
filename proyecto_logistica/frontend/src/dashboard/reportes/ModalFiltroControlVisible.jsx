import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Loader2 } from "lucide-react";
import api from "@/services/api";

export default function ModalFiltroControlVisible({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  
  const [almacenes, setAlmacenes] = useState([]);
  const [grupos, setGrupos] = useState([]);

  const [filtros, setFiltros] = useState({
    anio: new Date().getFullYear().toString(),
    mes: "ABRIL", // Podría ser dinámico al mes actual
    almacen: "",
    grupoAnalitico: "",
    filtrarPorCampo: "",
    filtrarPorValor: "",
    tipoMoneda: "Soles",
    detallado: false,
  });

  // Cargar catálogos al abrir
  useEffect(() => {
    if (isOpen) {
      cargarCatalogos();
    }
  }, [isOpen]);

  const cargarCatalogos = async () => {
    setLoadingCatalogos(true);
    try {
      const [resAlmacenes, resGrupos] = await Promise.all([
        api.get("/cotizaciones/almacenes/"),
        api.get("/cotizaciones/grupos-analiticos/")
      ]);
      setAlmacenes(Array.isArray(resAlmacenes.data) ? resAlmacenes.data : (resAlmacenes.data.results || []));
      setGrupos(Array.isArray(resGrupos.data) ? resGrupos.data : (resGrupos.data.results || []));
    } catch (e) {
      console.error("Error cargando catálogos", e);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleReporte = async () => {
    setLoading(true);
    // Simular tiempo de carga por ahora temporalmente
    setTimeout(() => {
      setLoading(false);
      // Aquí se conectará el reporte después
      console.log("Filtros enviados a backend:", filtros);
    }, 1000);
  };

  // Generadores de opciones
  const currentYear = new Date().getFullYear();
  const anios = Array.from({ length: 16 }, (_, i) => currentYear - 15 + i).reverse(); 
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  
  const opcionesFiltroGeneral = [
    { label: "N° Registro", value: "nro_registro" },
    { label: "Orden de Compra", value: "orden_compra" },
    { label: "Fecha Registro", value: "fecha_registro" },
    { label: "Código Origen", value: "codigo_origen" },
    { label: "Nombre Origen", value: "nombre_origen" },
    { label: "N° Factura", value: "nro_factura" },
    { label: "N° Guía", value: "nro_guia" },
    { label: "Total", value: "total" },
    { label: "Estado", value: "estado" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] overflow-hidden border border-white/20"
        >
          {/* Header Premium */}
          <div className="bg-[#1a2a3a] px-6 py-4 flex items-center justify-between border-b border-[#122030] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Package className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-white font-black text-sm uppercase tracking-widest">
                Parámetros de Reporte: Control Visible
              </h2>
            </div>
            <button onClick={onClose} className="relative z-10 text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="p-8 bg-slate-50/50">
            <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm relative">
              
              {loadingCatalogos && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-teal-600 w-8 h-8" />
                    <span className="text-teal-800 text-sm font-bold animate-pulse">Cargando catálogos...</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                
                {/* AÑO */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-bold text-slate-600 mb-1.5">Año Operativo</label>
                  <select
                    name="anio"
                    value={filtros.anio}
                    onChange={handleChange}
                    className="w-full h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-3 font-medium text-slate-700 transition-all cursor-pointer hover:border-slate-300"
                  >
                    {anios.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* ALMACEN (Dinamico de BD) */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-bold text-slate-600 mb-1.5">Almacén Origen</label>
                  <select
                    name="almacen"
                    value={filtros.almacen}
                    onChange={handleChange}
                    className="w-full h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-3 font-medium text-slate-700 transition-all cursor-pointer hover:border-slate-300"
                  >
                    <option value="">-- Todos los Almacenes --</option>
                    {almacenes.map(alm => (
                      <option key={alm.cod} value={alm.cod}>{alm.nom}</option>
                    ))}
                  </select>
                </div>

                {/* MES */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-bold text-slate-600 mb-1.5">Mes de Corte</label>
                  <select
                    name="mes"
                    value={filtros.mes}
                    onChange={handleChange}
                    className="w-full h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-3 font-medium text-slate-700 transition-all cursor-pointer hover:border-slate-300"
                  >
                    {meses.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* GRUPO ANALITICO (Dinamico de BD) */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-bold text-slate-600 mb-1.5">Grupo Analítico</label>
                  <select
                    name="grupoAnalitico"
                    value={filtros.grupoAnalitico}
                    onChange={handleChange}
                    className="w-full h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-3 font-medium text-slate-700 transition-all cursor-pointer hover:border-slate-300"
                  >
                    <option value="">--- Todos los Grupos ---</option>
                    {grupos.map(g => (
                      <option key={g.cod} value={g.cod}>{g.nom}</option>
                    ))}
                  </select>
                </div>

                {/* FILTRAR POR (General: Opciones dadas por usuario) */}
                <div className="flex flex-col md:col-span-1">
                  <label className="text-[13px] font-bold text-slate-600 mb-1.5">Criterio de Búsqueda</label>
                  <div className="flex gap-2">
                    <select
                      name="filtrarPorCampo"
                      value={filtros.filtrarPorCampo}
                      onChange={handleChange}
                      className="flex-[0.45] h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-2 font-medium text-slate-700 transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="">-- Sin Filtro --</option>
                      {opcionesFiltroGeneral.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="filtrarPorValor"
                        value={filtros.filtrarPorValor}
                        onChange={handleChange}
                        disabled={!filtros.filtrarPorCampo}
                        placeholder={filtros.filtrarPorCampo ? "Ingrese valor..." : ""}
                        className="w-full h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-3 font-medium text-slate-700 transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* TIPO DE MONEDA Y DETALLADO */}
                <div className="flex flex-col md:col-span-1">
                  <label className="text-[13px] font-bold text-slate-600 mb-1.5">Moneda y Nivel de Detalle</label>
                  <div className="flex items-center gap-4 h-10">
                    <select
                      name="tipoMoneda"
                      value={filtros.tipoMoneda}
                      onChange={handleChange}
                      className="flex-1 h-10 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none px-3 font-medium text-slate-700 transition-all cursor-pointer hover:border-slate-300"
                    >
                      <option value="Soles">S/ Soles (PEN)</option>
                      <option value="Dolares">$ Dólares (USD)</option>
                    </select>
                    
                    <label className="flex items-center gap-2 px-4 h-10 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors group">
                      <input
                        type="checkbox"
                        name="detallado"
                        checked={filtros.detallado}
                        onChange={handleChange}
                        className="w-4 h-4 text-teal-600 bg-white border-slate-300 rounded focus:ring-teal-500 focus:ring-2 accent-teal-600 cursor-pointer"
                      />
                      <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Detallado</span>
                    </label>
                  </div>
                </div>

              </div>
              
              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                <button
                  onClick={onClose}
                  className="px-6 h-10 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-[13px] font-bold text-slate-600 transition-all flex items-center justify-center min-w-[100px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReporte}
                  disabled={loading}
                  className="px-6 h-10 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg text-[13px] font-bold text-white shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      Generar Reporte
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
