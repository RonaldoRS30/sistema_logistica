import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Database, Package, Truck, Calendar, LayoutGrid, Map, Code, Users, Barcode, Warehouse, CircleDollarSign, Loader2, ArrowRight
} from "lucide-react";
import logo from "@/assets/logo.png";
import api from "@/services/api";
import { toast } from "sonner";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { this.setState({ error, errorInfo }); console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: 'white' }}>
          <h2>Algo falló en el dashboard:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Modales a importar
import ModalReporteAlmacen from "./ModalReporteAlmacen";
import ModalReporteProveedor from "./ModalReporteProveedor";
import ModalReporteGrupoAnalitico from "./ModalReporteGrupoAnalitico";
import ModalReporteProducto from "./ModalReporteProducto";
import ModalReporteCcosto from "./ModalReporteCcosto";
import ModalReporteUmed from "./ModalReporteUmed";
import ModalReporteDocAlmacen from "./ModalReporteDocAlmacen";
import ModalFiltroCodigoBarras from "./ModalFiltroCodigoBarras";

function ReportesTablasDashboardInner() {
  const [loadingModal, setLoadingModal] = useState(null);

  // Estados de Modales y Datos
  const [modalStates, setModalStates] = useState({
    almacenes: false,
    proveedores: false,
    grupos: false,
    productos: false,
    ccosto: false,
    umed: false,
    docAlmacen: false,
    codigoBarras: false,
  });

  const [datosRegistros, setDatosRegistros] = useState({});

  const openModal = async (key, endpoint) => {
    if (key === "codigoBarras") {
      setModalStates(prev => ({ ...prev, [key]: true }));
      return;
    }

    if (key === "clientes" || key === "tipoCambio") {
      toast.info("En construcción: Estos módulos aún no tienen un modal de reporte unificado.");
      return;
    }

    setLoadingModal(key);
    try {
      const { data } = await api.get(endpoint);
      setDatosRegistros(prev => ({ ...prev, [key]: Array.isArray(data) ? data : data.results || [] }));
      setModalStates(prev => ({ ...prev, [key]: true }));
    } catch (e) {
      console.error(e);
      toast.error(`Error al cargar datos para ${key}`);
    } finally {
      setLoadingModal(null);
    }
  };

  const closeModal = (key) => {
    setModalStates(prev => ({ ...prev, [key]: false }));
  };

  const REPORT_BUTTONS = [
    { key: "almacenes", label: "Almacenes", icon: Warehouse, color: "text-teal-600", bg: "bg-teal-50", hover: "hover:border-teal-500 hover:shadow-teal-500/20", endpoint: "/cotizaciones/almacenes/" },
    { key: "docAlmacen", label: "Documentos Almacen", icon: FileText, color: "text-amber-600", bg: "bg-amber-50", hover: "hover:border-amber-500 hover:shadow-amber-500/20", endpoint: "/cotizaciones/doc-almacen/" },
    { key: "grupos", label: "Grupos", icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50", hover: "hover:border-indigo-500 hover:shadow-indigo-500/20", endpoint: "/cotizaciones/grupos-analiticos/" },
    { key: "proveedores", label: "Proveedores", icon: Truck, color: "text-orange-600", bg: "bg-orange-50", hover: "hover:border-orange-500 hover:shadow-orange-500/20", endpoint: "/cotizaciones/clientes/" },
    { key: "productos", label: "Artículos", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:border-emerald-500 hover:shadow-emerald-500/20", endpoint: "/cotizaciones/productos/" },
    { key: "clientes", label: "Clientes", icon: Users, color: "text-blue-600", bg: "bg-blue-50", hover: "hover:border-blue-500 hover:shadow-blue-500/20", endpoint: "" },
    { key: "ccosto", label: "Centros de Costo", icon: Map, color: "text-rose-600", bg: "bg-rose-50", hover: "hover:border-rose-500 hover:shadow-rose-500/20", endpoint: "/cotizaciones/centros-costo/" },
    { key: "tipoCambio", label: "Tipo de Cambio", icon: CircleDollarSign, color: "text-cyan-600", bg: "bg-cyan-50", hover: "hover:border-cyan-500 hover:shadow-cyan-500/20", endpoint: "" },
    { key: "umed", label: "Unidad de Medida", icon: Code, color: "text-slate-600", bg: "bg-slate-100", hover: "hover:border-slate-500 hover:shadow-slate-500/20", endpoint: "/cotizaciones/unidades-medida/" },
    { key: "codigoBarras", label: "Código de Barras Productos", icon: Barcode, color: "text-purple-600", bg: "bg-purple-50", hover: "hover:border-purple-500 hover:shadow-purple-500/20", endpoint: "" },
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
                    TABLAS
                  </h3>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.2em] bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">
                    Catálogo Analítico
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Botones de Reporte */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
              <FileText className="text-slate-400 w-5 h-5" />
              <h3 className="text-slate-800 font-black uppercase tracking-wider text-sm">Catálogos y Reportes Estándar</h3>
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REPORT_BUTTONS.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => openModal(btn.key, btn.endpoint)}
                  disabled={loadingModal === btn.key}
                  className={`group relative flex items-center h-[52px] bg-white border border-slate-200/80 rounded-lg shadow-sm hover:-translate-y-[2px] transition-all duration-200 overflow-hidden ${btn.hover}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${btn.bg.replace("bg-", "bg-").replace("100", "500").replace("50", "500")} transition-all group-hover:w-1.5`}></div>
                  
                  <div className={`flex items-center justify-center w-12 h-full ${btn.bg} border-r border-slate-100`}>
                    {loadingModal === btn.key ? (
                      <Loader2 size={18} className={`animate-spin ${btn.color}`} />
                    ) : (
                      <btn.icon size={18} className={`${btn.color} transition-transform group-hover:scale-110`} strokeWidth={2} />
                    )}
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

      {/* Renderizado Condicional de Modales Reusados */}
      <ModalReporteAlmacen      isOpen={modalStates.almacenes}   onClose={() => closeModal("almacenes")}   registros={datosRegistros.almacenes} filtros={{}} />
      <ModalReporteProveedor    isOpen={modalStates.proveedores} onClose={() => closeModal("proveedores")} registros={datosRegistros.proveedores} filtros={{}} />
      <ModalReporteGrupoAnalitico isOpen={modalStates.grupos}    onClose={() => closeModal("grupos")}      registros={datosRegistros.grupos} filtros={{}} />
      <ModalReporteProducto     isOpen={modalStates.productos}   onClose={() => closeModal("productos")}   registros={datosRegistros.productos} filtros={{}} />
      <ModalReporteCcosto       isOpen={modalStates.ccosto}      onClose={() => closeModal("ccosto")}      registros={datosRegistros.ccosto} filtros={{}} />
      <ModalReporteUmed         isOpen={modalStates.umed}        onClose={() => closeModal("umed")}        registros={datosRegistros.umed} filtros={{}} />
      <ModalReporteDocAlmacen   isOpen={modalStates.docAlmacen}  onClose={() => closeModal("docAlmacen")}  registros={datosRegistros.docAlmacen} filtros={{}} />

      {/* Modal Específico de Filtros de Código de Barras */}
      <ModalFiltroCodigoBarras  isOpen={modalStates.codigoBarras} onClose={() => closeModal("codigoBarras")} />
    </div>
  );
}

export default function ReportesTablasDashboard() {
  return (
    <ErrorBoundary>
      <ReportesTablasDashboardInner />
    </ErrorBoundary>
  );
}
