// frontend/src/dashboard/aprobacion_cotizacion/AprobacionCotizacion.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { BriefcaseBusiness, FilePlus, Eye, TrendingUp, DollarSign, BarChart3, Filter, Loader, PieChart, Calculator, FileSpreadsheet, Wallet2, Landmark, Scale, Coins, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Table from "@/components/ui/table";
import KpiCard from "@/components/ui/KpiCard";
import FilterCard from "@/components/ui/FilterCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { getEstadoColor, getEstadoNombre, ESTADO_STATE_COLORS } from "@/components/ui/colors";
import AprobacionCotizacionModal from "../aprobacion_cotizacion/AprobacionCotizacionModal";
import { useNavigate } from "react-router-dom";
import NuevaLogisticaModalSal from "../modal/nuevaLogisticaModalSal";

const fetchLogisticaDashboard = async ({ queryKey }) => {
  const [_key, params] = queryKey;

  const token = localStorage.getItem("access_token");

  // 1) Usuario logueado
  const usuarioRes = await api.get("usuario-actual/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const nombUsuario = usuarioRes.data?.usuario_usu;

  // 2) Llamada al endpoint
  const { data } = await api.get("logistica/dashboard/", {
    headers: { Authorization: `Bearer ${token}` },
    params: { ...params },
  });

  const tabla = Array.isArray(data?.tabla) ? data.tabla : [];



  return {
    movimientos: tabla,
    stats: data.dashboard || {},
    anno: data.anno,
    usuario: nombUsuario,
  };
};

export default function SalidaAlmacen() {
  const { authUser: user, logout } = useAuth();
  const [filtro, setFiltro] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [logisticaSeleccionada, setLogisticaSeleccionada] = useState(null);
  const navigate = useNavigate();
  const [openNueva, setOpenNueva] = useState(false);
  const currentYear = new Date().getFullYear().toString();
  const [annoActual, setAnnoActual] = useState(currentYear);
  const [processingFilters, setProcessingFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    anno: currentYear,               // año actual por defecto (igual que FilterCard)
    mes: "%",                        // todos los meses por defecto
    cliente: "%",                    // todos los clientes
    estado: "%",                     // todos los estados
    almacen: "%",                    // todas las áreas
    envio: "%",                      // todos los envíos
    referencia: "%",
    operacion: 'S',                  // 🔑 SALIDAS: siempre 'S'
    num_reg: "",
    campo: "",
    valor: "",
    generalCampo: "",
    generalValor: "",
    index: 1,
    num_regs: 10,
  });
  const [clientesMap, setClientesMap] = useState({});
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["logistica_salida", currentFilters],
    queryFn: fetchLogisticaDashboard,
    keepPreviousData: true,
  });
  const cotizaciones = data?.movimientos || [];
  
  const stats = data?.stats || {};

  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.25]);
  const blurValue = useTransform(scrollY, [0, 100], [4, 8]);

  // Efecto scroll flotante
  useEffect(() => {
    const onScroll = () => {
      shadowOpacity.set(Math.min(window.scrollY / 150, 0.2));
      blurValue.set(Math.min(window.scrollY / 100, 8));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [shadowOpacity, blurValue]);

const [filtersUI, setFiltersUI] = useState({});
const logisticaEntrada = useMemo(() => {
  return cotizaciones;
}, [cotizaciones]);
const totalRegistros = isFetching ? "..." : logisticaEntrada.length;

  // Mapeo  de Clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const res = await api.get("/cotizaciones/clientes/");
      const map = {};
      res.data.forEach(c => {
        map[c.codigo] = c.nombre;
      });
      setClientesMap(map);
    };

    fetchClientes();
  }, []);

  // =========
  // REPORTE
  // =========
  const windowsOpen = (url, alto = 980, ancho = 600) => {
    const left = (screen.width - alto) / 2;
    const top = (screen.height - ancho) / 2;

    const specs = `resizable=yes,location=1,status=1,scrollbars=yes,width=${alto},height=${ancho},top=${top},left=${left}`;

    const popup = window.open(url, "reporte", specs);
    if (popup) popup.focus();
  };

  // ----------------------------------------------------
  // 📊 Reporte SALIDA DE ALMACEN (Dashboard)
  // ----------------------------------------------------
  const handleReport = (filters) => {
    if (!filters) return;

    const params = {
      anno: filters.anio || annoActual,
        mes: filters.mes || "%",
        cliente: filters.cliente || "%",
        estado: filters.estado || "%",
      
       // 🔥 MAPEO REAL A TU MODELO
       referencia: filters.movimiento || "%",
       almacen: filters.area || "%",
       operacion: "S",
      
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const query = new URLSearchParams(params).toString();

    windowsOpen(
      `${API_URL}/cotizaciones/reportes/reporte_almacen_salidas_dashboard_html/?${query}`,
      980,
      600
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col bg-gray-50 font-sans"
    >
      <div className="flex-1 flex flex-col py-[clamp(8px,2vw,24px)] px-[clamp(8px,2vw,24px)]">

        {/* HEADER */}
        <motion.div
          style={{
            boxShadow: shadowOpacity.get() > 0 ? `0 2px 8px rgba(0,0,0,${shadowOpacity.get()})` : "none",
            backdropFilter: `blur(${blurValue.get()}px)`,
          }}
          className="sticky top-0 z-30 bg-white/90 border-b border-gray-200 rounded-2xl shadow-md px-[clamp(12px,2vw,20px)] py-[clamp(8px,1.2vw,12px)] mb-[clamp(10px,2vw,16px)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[clamp(8px,1.5vw,12px)]"
        >
          <div className="flex-1 min-w-0">
            <motion.h1
              className="font-bold flex items-center gap-3 truncate"
              style={{ fontSize: "clamp(1rem,2.2vw,2rem)" }}
            >
              <BriefcaseBusiness className="w-[clamp(20px,3vw,30px)] h-[clamp(20px,3vw,30px)] text-gray-900" />
              Salida de Almacén
            </motion.h1>
            <motion.p
              className="mt-1 text-gray-600 italic truncate flex items-center gap-2"
              style={{ fontSize: "clamp(0.7rem,0.9vw,1rem)" }}
            >
              Gestión de tus 
              <span className="font-semibold text-blue-600">Salida de almacén</span>.
              
              <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                {totalRegistros} registros
              </span>
            </motion.p>
          </div>

          {/* BOTÓN NUEVA inserción de salida */}
          <div className="flex flex-wrap gap-2 justify-end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setOpenNueva(true)}
                variant="ghost"
                className="text-[11px] font-black uppercase tracking-widest text-teal-700 hover:bg-teal-100 border border-transparent hover:border-teal-200 rounded-xl h-9 px-8 transition-all"
              > 
                <FilePlus className="w-4 h-4"/>Nuevo
              </Button>
            </motion.div>
          </div>
        </motion.div>

  
          {/* FILTROS */}
          <div className="w-full mb-4">
            <FilterCard
              dashboard="cotizaciones"
              className="w-full"
              compact
              processing={processingFilters}
              onReport={handleReport}
        onProcess={async (filters, event) => {
                console.log("🟡 FILTERS UI (Salida):", filters);

                setFiltersUI(filters);
                if (event) event.preventDefault();
                setProcessingFilters(true);

                try {
                  const params = {
                    anno: filters.anio || currentYear,
                    mes: filters.mes || "%",
                    cliente: filters.cliente || "%",
                    estado: filters.estado || "%",

                    // 🔥 MAPEO REAL AL MODELO
                    referencia: filters.movimiento || "%",
                    almacen: filters.area || "%",
                    operacion: "S",   // 🔑 SIEMPRE 'S' para SALIDAS

                    envio: filters.envio || "%",

                    ...(filters.campo && filters.valor
                      ? { campo: filters.campo, valor: filters.valor }
                      : {}),
                  };

                  console.log("🟢 PARAMS ENVIADOS (Salida):", params);

                  // 🔥 actualizar filtros → react-query re-fetches automáticamente
                  setCurrentFilters(params);

                  // 🔥 FORZAR REFRESH con clave correcta
                  queryClient.invalidateQueries(["logistica_salida"]);

                } finally {
                  setProcessingFilters(false);
                }
              }}
            />
          </div>

        {/* TABLA DE COTIZACIONES - V&C ENTERPRISE DEFINITIVE */}
        <div className="hidden md:block w-full flex-1 overflow-auto relative rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          {isFetching && (
            <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  <div className="absolute inset-0 rounded-full border-4 border-teal-100 opacity-20"></div>
                </div>
                <span className="text-[10px] font-[900] text-slate-500 uppercase tracking-[0.25em] animate-pulse">
                  Sincronizando Datos
                </span>
              </div>
            </div>
          )}

          <Table
            /* CABECERAS: Estilo "High-Contrast Enterprise" */
            headers={[
              "Registro",
              "Fecha",
              "OCompra",
              "Código",
              "Nombre",
              "Factura",
              "Guía",
              "Soles",
              "Dólares",
              "",
              ""
            ].map(h => (
              <span className="text-sm font-[950] uppercase tracking-[0.2em] text-slate-800 text-center block">
                {h}
              </span>
            ))}

            data={logisticaEntrada}

            /* 👉 CLICK EN TODA LA FILA */
            onRowClick={(c) => {
              setLogisticaSeleccionada(c);
              setDetalleOpen(true);
            }}

            renderRow={(c) => [
              // 1. REGISTRO
              <span className="text-xs font-semibold text-slate-800 tabular-nums text-left leading-none">
                {c.num_reg}
              </span>,

              // 2. FECHA
              <span className="text-xs font-semibold text-slate-800 text-left tracking-tight uppercase leading-none">
                {c.fec}
              </span>,

              // 3. OCOMPRA
              <span className="text-xs font-semibold text-slate-800 text-left tracking-tight uppercase leading-none">
                {c.oco}
              </span>,

              // 4. CODIGO
              <span className="text-xs font-semibold text-slate-800 text-left tracking-tight uppercase leading-none">
                {c.codigo}
              </span>,

              // 5. NOMBRE 
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-tight text-left bg-slate-50 px-2 py-[2px] rounded-md border border-slate-100">
                {c.dor}
              </span>,

              // 6. FACTURA
              <span className="text-xs font-semibold uppercase tracking-wide text-left text-slate-800 leading-none">
                {c.nfa}
              </span>,

              // 7. guía
              <div className="text-left py-1">
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {c.ngu}
                </span>
              </div>,

              // 8. SOLES
              <div className="text-left py-1">
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {c.sol}
                </span>
              </div>,
              
              // 9. DÓLARES
              <div className="text-left py-1">
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {c.dol}
                </span>
              </div>,              

              // 8. BOTÓN — evita doble trigger
              <div className="flex justify-start">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogisticaSeleccionada(c);
                      setDetalleOpen(true);
                    }}
                    className="h-7 w-7 p-0 rounded-2xl bg-white hover:bg-teal-50 text-slate-400 hover:text-teal-600 border border-transparent hover:border-teal-100 transition-all shadow-none hover:shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>,

              // 9. ENVÍO
              <div className="flex items-center justify-start">
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] border border-white ring-1 ring-slate-200"
                  style={{ backgroundColor: getEstadoColor(c.est) }}
                  title={getEstadoNombre(c.est)}
                />
              </div>,
            ]}
          />
        </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          Mostrando {totalRegistros} registros
        </span>
      </div>


        {/* CARDS MOBILE */}
        <div className="flex flex-col gap-3 md:hidden">
          {logisticaEntrada.map(c => (
            <motion.div
              key={c.numero}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
              onClick={() => { setLogisticaSeleccionada(c); setDetalleOpen(true); }}
            >
              <div className="font-semibold text-[clamp(0.9rem,2vw,1.1rem)]">{c.numero}</div>
              <div className="mt-2 flex flex-col gap-1 text-gray-600 text-[clamp(0.65rem,1.5vw,0.85rem)]">
                <div className="flex justify-between"><span>Fecha:</span><span>{c.fecha}</span></div>
                <div className="flex justify-between"><span>Referencia:</span><span>{c.referencia}</span></div>
                <div className="flex justify-between"><span>Cliente:</span><span>{c.cliente_nombre}</span></div>
                <div className="flex justify-between"><span>Área:</span><span>{c.area_nombre}</span></div>
                <div className="flex justify-between"><span>Estado:</span><span>{c.estado_nombre}</span></div>
                <div className="flex justify-between"><span>Importe:</span><span>{c.tot_c}</span></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LEYENDA DE ESTADOS */}
        <div className="
          flex flex-wrap 
          justify-center md:justify-start 
          items-center 
          gap-3 md:gap-4 
          p-3 
          mt-4 
          rounded-xl 
          border border-gray-200 
          bg-white 
          shadow-sm 
          w-full
        ">
          {[
            { label: "Abierto", color: ESTADO_STATE_COLORS["0"] },
            { label: "Cerrado", color: ESTADO_STATE_COLORS["1"] },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 min-w-[120px] md:min-w-[140px]">
              <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color }}></span>
              <span className="text-gray-600 truncate text-xs md:text-[clamp(0.65rem, 1vw, 1rem)]">{label}</span>
            </div>
          ))}
        </div>

        {/* MODAL */}
              <NuevaLogisticaModalSal
                open={openNueva}
                onClose={() => setOpenNueva(false)}
                modo="C"
                tipoOperacion="S"
                tipo="N"
                dashboard="C"
              />
      
              {logisticaSeleccionada && (
                <NuevaLogisticaModalSal
                  key={logisticaSeleccionada.num_reg}
                  open={detalleOpen}
                  onClose={() => setDetalleOpen(false)}
                  logistica={logisticaSeleccionada}
                  modo="C"
                  tipo="V"
                  dashboard="C"
                />
              )}
      </div>
    </motion.div>
  );
}
