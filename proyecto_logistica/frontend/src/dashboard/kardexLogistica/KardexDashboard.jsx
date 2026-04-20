// frontend/src/dashboard/aprobacion_cotizacion/AprobacionCotizacion.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { BriefcaseBusiness, Loader } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { useScroll, useTransform, motion } from "framer-motion";
import Table from "@/components/ui/table";
import FilterCardKardex from "@/components/ui/FilterCardKardex";
import { ESTADO_STATE_COLORS } from "@/components/ui/colors";
import NuevaLogisticaModalSal from "../modal/nuevaLogisticaModalSal";
import Swal from "sweetalert2";
export default function KardexDashboard() {
  const { authUser: user, logout } = useAuth();

  const [filtro, setFiltro] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [logisticaSeleccionada, setLogisticaSeleccionada] = useState(null);
  const [openNueva, setOpenNueva] = useState(false);
  const [annoActual, setAnnoActual] = useState(new Date().getFullYear());

  // filtros actuales
  const [filters, setFilters] = useState({
    anno: new Date().getFullYear(),
    mes: "%",
    cliente: "%",
    estado: "%",
    area: "%",
    envio: "%",
    num_reg: "",
    moneda: "S",
    cod: "%", 
    campo: "",
    valor: "",
    generalCampo: "",
    generalValor: "",
    index: 1,
    num_regs: 10,
  });

  const [kardexRows, setKardexRows] = useState([]);
  const [kardexSeleccionado, setKardexSeleccionado] = useState(null);
  const [kardexDetalleOpen, setKardexDetalleOpen] = useState(false);
  const [logisticaEntrada, setLogisticaEntrada] = useState([]);

  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.25]);
  const blurValue = useTransform(scrollY, [0, 100], [4, 8]);

  useEffect(() => {
    const onScroll = () => {
      shadowOpacity.set(Math.min(window.scrollY / 150, 0.2));
      blurValue.set(Math.min(window.scrollY / 100, 8));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [shadowOpacity, blurValue]);

  const calcularKardexDesdeMovimientos = (movs, tmo) => {
    let tcan = 0, tval = 0, ttot = 0;
    const rows = [];

    movs.forEach((row) => {
      const esEntrada = row.ope === "E";
      let ecan = 0, evalp = 0, etot = 0;
      let scan = 0, sval = 0, stot = 0;

      if (esEntrada) {
        ecan = Number(row.can || 0);
        if (tmo === "S") {
          evalp = row.tmo === "S" ? Number(row.val || 0) : Number(row.val || 0) * Number(row.tc || 0);
        } else {
          evalp = row.tmo === "D" ? Number(row.val || 0) : Number(row.val || 0) / Number(row.tc || 1);
        }
        etot = ecan * evalp;
        tcan += ecan;
        ttot += etot;
        tval = tcan > 0 ? ttot / tcan : 0;
      } else {
        scan = Number(row.can || 0);
        sval = tval;
        stot = scan * sval;
        tcan -= scan;
        ttot -= stot;
      }

      rows.push({
        fecha: row.fec,
        tipo: row.ope,
        referencia: row.dor,
        ingreso_cant: esEntrada ? ecan : 0,
        ingreso_precio: esEntrada ? evalp : 0,
        ingreso_total: esEntrada ? etot : 0,
        salida_cant: esEntrada ? 0 : scan,
        salida_precio: esEntrada ? 0 : sval,
        salida_total: esEntrada ? 0 : stot,
        saldo_cant: tcan,
        saldo_precio: tval,
        saldo_total: ttot,
      });
    });
    return rows;
  };

  const fetchKardex = async (filtersObj) => {
    const token = localStorage.getItem("access_token");
    const params = {
      anno: filtersObj.anno,
      mes: filtersObj.mes,
      cod: filtersObj.cod,
      tmo: filtersObj.moneda,
    };

    const { data } = await api.get("logistica/kardex_base/", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const rows = calcularKardexDesdeMovimientos(data || [], params.tmo);
    setKardexRows(rows);
  };

  const windowsOpen = (url, alto = 980, ancho = 600) => {
    const left = (screen.width - alto) / 2;
    const top = (screen.height - ancho) / 2;
    const specs = `resizable=yes,location=1,status=1,scrollbars=yes,width=${alto},height=${ancho},top=${top},left=${left}`;
    const popup = window.open(url, "reporte", specs);
    if (popup) popup.focus();
  };

// Dentro de KardexDashboard.jsx

const handleProcess = async () => {
  setProcessingFilters(true);

  try {
    const response = await api.get("/logistica/kardex-base/", { params: filters });
    setKardexRows(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error(error);
    setKardexRows([]);
  } finally {
    setProcessingFilters(false);
  }
};



const handleReport = async (filtros) => {
  const producto = filtros?.producto || "";
  if (!producto || producto === "%") {
    Swal.fire({
      icon: "warning",
      title: "Producto requerido",
      text: "Debe seleccionar un producto antes de generar el reporte.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  const nuevaVentana = window.open("", "_blank");
  if (!nuevaVentana) {
    Swal.fire({
      icon: "error",
      title: "Popup bloqueado",
      text: "Permita ventanas emergentes para abrir el reporte.",
      confirmButtonText: "OK",
    });
    return;
  }

  nuevaVentana.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Generando reporte...</title>
        <style>
          body { margin:0; font-family: Arial, sans-serif; background:#f8fafc; }
          .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; }
          .card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:24px 28px; text-align:center; box-shadow:0 8px 30px rgba(2,6,23,.08); }
          .spin { width:36px; height:36px; border:4px solid #cbd5e1; border-top-color:#2563eb; border-radius:50%; margin:0 auto 12px; animation:spin 1s linear infinite; }
          .txt { color:#334155; font-size:14px; font-weight:600; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="card">
            <div class="spin"></div>
            <div class="txt">Generando reporte Kardex...</div>
          </div>
        </div>
      </body>
    </html>
  `);
  nuevaVentana.document.close();

  try {
    setReportLoading(true);

    const params = {
      anno: filtros.anio || '%',
      mes: filtros.mes || '%',
      cod: filtros.producto,
      moneda: filtros.moneda || 'S'
    };

    const response = await api.get('/cotizaciones/reportes/reporte_kardex_pdf/', {
      params,
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    nuevaVentana.location.href = url;

  } catch (error) {
    console.error(error);
    nuevaVentana.close();
    Swal.fire({
      icon: "error",
      title: "No se pudo generar el reporte",
      text: "Intente nuevamente en unos segundos.",
      confirmButtonText: "OK",
    });
  } finally {
    setReportLoading(false);
  }
};

const handleClearTable = () => {
  setKardexRows([]);
};


const [processingFilters, setProcessingFilters] = useState(false);
const [reportLoading, setReportLoading] = useState(false);
  
  const inventarioFinal = kardexRows.length ? kardexRows[kardexRows.length - 1] : null;

  // GRID DEFINITION: 12 columnas balanceadas para que los spans funcionen
  const baseRowClasses = "grid grid-cols-[110px_50px_1fr_repeat(9,minmax(85px,1fr))]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col bg-gray-50 font-sans"
    >
      <div className="flex-1 flex flex-col py-4 px-4">
        {/* HEADER */}
        <motion.div
          style={{
            boxShadow: shadowOpacity.get() > 0 ? `0 2px 8px rgba(0,0,0,${shadowOpacity.get()})` : "none",
            backdropFilter: `blur(${blurValue.get()}px)`,
          }}
          className="sticky top-0 z-30 bg-white/90 border-b border-gray-200 rounded-2xl shadow-md px-5 py-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <motion.h1 className="font-bold flex items-center gap-3 truncate text-2xl text-slate-900">
              <BriefcaseBusiness className="w-8 h-8 text-blue-600" />
              Kardex
            </motion.h1>
            <motion.p className="mt-1 text-gray-600 italic text-sm">
              Gestión de <span className="font-semibold text-blue-600">kardex de inventario</span>.
            </motion.p>
          </div>
        </motion.div>

        {/* FILTROS */}
        <div className="w-full mb-4">
          <FilterCardKardex
            dashboard="cotizaciones"
            className="w-full"
            compact
            processing={processingFilters}
            reportLoading={reportLoading}
            onReport={handleReport}
            onClear={handleClearTable}
        onProcess={async (filtersFromCard, event) => {
              if (event) event.preventDefault();

              // 🚨 Validar que haya producto seleccionado
              if (!filtersFromCard.producto || filtersFromCard.producto === "%") {
                toast.warning("Debe seleccionar un producto para consultar el Kardex.", {
                  description: "Use el selector de producto antes de procesar.",
                  duration: 4000,
                });
                return;
              }

              setProcessingFilters(true);

              try {
                const params = {
                  anno: filtersFromCard.anio || annoActual,
                  mes: filtersFromCard.mes || "%",
                  moneda: filtersFromCard.moneda || "S",
                  cod: filtersFromCard.producto,
                };

                setFilters((prev) => ({ ...prev, ...params }));

                await fetchKardex(params);
              } finally {
                setProcessingFilters(false);
              }
            }}
          />
        </div>

        {/* TABLA KARDEX (DESKTOP) */}
        <div className="hidden md:block w-full flex-1 overflow-auto relative rounded-xl border border-slate-300 bg-white shadow-sm">
          {processingFilters && (
            <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader className="w-10 h-10 animate-spin text-blue-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Procesando...</span>
              </div>
            </div>
          )}

          <div className="min-w-[1100px] flex flex-col">
            {/* ENCABEZADO NIVEL 1: GRUPOS */}
            <div className={`${baseRowClasses} bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-700`}>
              <div className="col-span-3 px-3 py-2 border-r border-slate-200">Datos del Movimiento</div>
              <div className="col-span-3 px-3 py-2 text-center border-r border-slate-200 bg-blue-50/50">Ingreso</div>
              <div className="col-span-3 px-3 py-2 text-center border-r border-slate-200 bg-orange-50/50">Salida</div>
              <div className="col-span-3 px-3 py-2 text-center bg-green-50/50">Saldo Final</div>
            </div>

            {/* ENCABEZADO NIVEL 2: COLUMNAS */}
            <div className={`${baseRowClasses} bg-slate-50 border-b border-slate-300 text-[10px] font-semibold text-slate-600`}>
              <div className="px-3 py-2 border-r border-slate-200">Fecha</div>
              <div className="px-3 py-2 border-r border-slate-200">Tipo</div>
              <div className="px-3 py-2 border-r border-slate-200">Referencia</div>
              
              <div className="px-2 py-2 text-center border-r border-slate-200 bg-blue-50/30">Cant.</div>
              <div className="px-2 py-2 text-right border-r border-slate-200 bg-blue-50/30">Precio</div>
              <div className="px-2 py-2 text-right border-r border-slate-200 bg-blue-50/30">Total</div>

              <div className="px-2 py-2 text-center border-r border-slate-200 bg-orange-50/30">Cant.</div>
              <div className="px-2 py-2 text-right border-r border-slate-200 bg-orange-50/30">Precio</div>
              <div className="px-2 py-2 text-right border-r border-slate-200 bg-orange-50/30">Total</div>

              <div className="px-2 py-2 text-center border-r border-slate-200 bg-green-50/30">Cant.</div>
              <div className="px-2 py-2 text-right border-r border-slate-200 bg-green-50/30">Precio</div>
              <div className="px-2 py-2 text-right bg-green-50/30">Total</div>
            </div>

            {/* CUERPO DE DATOS */}
            <div className="overflow-y-auto">
                          {kardexRows.length === 0 && !processingFilters && (
              <div className="p-10 text-center text-slate-400 text-sm font-semibold">
                No hay datos para mostrar
              </div>
            )}
              {kardexRows.map((row, idx) => (
                <div 
                  key={idx} 
                  className={`${baseRowClasses} hover:bg-blue-50/40 border-b border-slate-200 transition-colors cursor-pointer group`}
                  onClick={() => { setKardexSeleccionado(row); setKardexDetalleOpen(true); }}
                >
                  <div className="px-3 py-2 text-[11px] tabular-nums text-slate-700 border-r border-slate-100">{row.fecha}</div>
                  <div className="px-3 py-2 text-[11px] font-bold text-center border-r border-slate-100">
                    <span className={row.tipo === 'E' ? 'text-blue-600' : 'text-orange-600'}>{row.tipo}</span>
                  </div>
                  <div className="px-3 py-2 text-[11px] text-slate-600 truncate border-r border-slate-100" title={row.referencia}>
                    {row.referencia}
                  </div>

                  {/* Ingreso */}
                  <div className="px-2 py-2 text-center text-[11px] tabular-nums font-medium border-r border-slate-100">{row.ingreso_cant || "-"}</div>
                  <div className="px-2 py-2 text-right text-[11px] tabular-nums text-slate-500 border-r border-slate-100">{row.ingreso_precio > 0 ? row.ingreso_precio.toFixed(4) : "-"}</div>
                  <div className="px-2 py-2 text-right text-[11px] tabular-nums font-semibold text-slate-700 border-r border-slate-100">{row.ingreso_total > 0 ? row.ingreso_total.toFixed(2) : "-"}</div>

                  {/* Salida */}
                  <div className="px-2 py-2 text-center text-[11px] tabular-nums font-medium border-r border-slate-100">{row.salida_cant || "-"}</div>
                  <div className="px-2 py-2 text-right text-[11px] tabular-nums text-slate-500 border-r border-slate-100">{row.salida_precio > 0 ? row.salida_precio.toFixed(4) : "-"}</div>
                  <div className="px-2 py-2 text-right text-[11px] tabular-nums font-semibold text-slate-700 border-r border-slate-100">{row.salida_total > 0 ? row.salida_total.toFixed(2) : "-"}</div>

                  {/* Saldo */}
                  <div className="px-2 py-2 text-center text-[11px] tabular-nums font-bold text-slate-800 border-r border-slate-100 bg-slate-50/30">{row.saldo_cant}</div>
                  <div className="px-2 py-2 text-right text-[11px] tabular-nums text-slate-600 border-r border-slate-100 bg-slate-50/30">{row.saldo_precio.toFixed(4)}</div>
                  <div className="px-2 py-2 text-right text-[11px] tabular-nums font-black text-amber-600 bg-slate-50/30">{row.saldo_total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* PIE: INVENTARIO FINAL */}
            {inventarioFinal && (
              <div className={`${baseRowClasses} bg-slate-800 text-white font-bold border-t-2 border-slate-900 sticky bottom-0`}>
                <div className="col-span-3 px-4 py-3 text-xs uppercase tracking-widest">Inventario Final:</div>
                <div className="col-span-3 border-r border-slate-700" /> {/* Espacio Ingreso */}
                <div className="col-span-3 border-r border-slate-700" /> {/* Espacio Salida */}
                
                {/* Saldo Final en el pie */}
                <div className="px-2 py-3 text-center text-xs tabular-nums">{inventarioFinal.saldo_cant}</div>
                <div className="px-2 py-3 text-right text-xs tabular-nums text-slate-300">{inventarioFinal.saldo_precio.toFixed(4)}</div>
                <div className="px-2 py-3 text-right text-xs tabular-nums text-amber-400">{inventarioFinal.saldo_total.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE < md: CARDS */}
        <div className="md:hidden flex flex-col gap-3">
          {kardexRows.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.tipo === 'E' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {row.tipo === 'E' ? 'INGRESO' : 'SALIDA'}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1">{row.fecha}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Saldo Total</p>
                  <p className="text-sm font-black text-amber-500">{(row.saldo_total ?? 0).toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2 italic">"{row.referencia}"</p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Cant.</p>
                  <p className="text-xs font-bold text-slate-700">{row.tipo === 'E' ? row.ingreso_cant : row.salida_cant}</p>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Precio</p>
                  <p className="text-xs font-bold text-slate-700">{(row.tipo === 'E' ? row.ingreso_precio : row.salida_precio).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Stock</p>
                  <p className="text-xs font-bold text-blue-600">{row.saldo_cant}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LEYENDA */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 p-4 mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 w-full">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600 text-xs font-medium">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-600 text-xs font-medium">Salidas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-slate-600 text-xs font-medium">Saldo Valorizado</span>
          </div>
        </div>

        {/* MODALES */}
        <NuevaLogisticaModalSal
          open={openNueva}
          onClose={() => setOpenNueva(false)}
          modo="C"
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