// frontend/src/dashboard/aprobacion_cotizacion/AprobacionCotizacion.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  BriefcaseBusiness,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScroll, useTransform, motion } from "framer-motion";
import Table from "@/components/ui/table";
import FilterCardKardex from "@/components/ui/FilterCardKardex";
import { ESTADO_STATE_COLORS } from "@/components/ui/colors";
import NuevaLogisticaModalSal from "../modal/nuevaLogisticaModalSal";

export default function KardexDashboard() {
  const { authUser: user, logout } = useAuth();

  const [filtro, setFiltro] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [logisticaSeleccionada, setLogisticaSeleccionada] = useState(null);
  const [openNueva, setOpenNueva] = useState(false);
  const [annoActual, setAnnoActual] = useState(new Date().getFullYear());
  const [processingFilters, setProcessingFilters] = useState(false);

  // filtros actuales (para reporte, etc.)
  const [filters, setFilters] = useState({
    anno: new Date().getFullYear(),
    mes: "%",
    cliente: "%",
    estado: "%",
    area: "%",
    envio: "%",
    num_reg: "",
    moneda: "S",
    cod: "%", // producto
    campo: "",
    valor: "",
    generalCampo: "",
    generalValor: "",
    index: 1,
    num_regs: 10,
  });

  // datos de kardex
  const [kardexRows, setKardexRows] = useState([]);
  const [kardexSeleccionado, setKardexSeleccionado] = useState(null);
  const [kardexDetalleOpen, setKardexDetalleOpen] = useState(false);

  // si todavía quieres usar logisticaEntrada / cards móviles de cotizaciones,
  // tendrás que traerlos con otro useEffect/useQuery.
  const [logisticaEntrada, setLogisticaEntrada] = useState([]);

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

  // ============================
  // 1) LÓGICA DE KARDEX (JS)
  // ============================
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
          evalp = row.tmo === "S"
            ? Number(row.val || 0)
            : Number(row.val || 0) * Number(row.tc || 0);
        } else {
          evalp = row.tmo === "D"
            ? Number(row.val || 0)
            : Number(row.val || 0) / Number(row.tc || 1);
        }

        etot = ecan * evalp;

        tcan += ecan;
        ttot += etot;
        tval = tcan > 0 ? Math.round((ttot / tcan) * 100) / 100 : 0;
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

  const fetchKardex = async (filters) => {
    const token = localStorage.getItem("access_token");

    const params = {
      anno: filters.anno,      // año
      mes: filters.mes,       // mes o "%"
      cod: filters.cod,       // código del producto
      tmo: filters.moneda,    // "S" o "D"
    };

    const { data } = await api.get("logistica/kardex_base/", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const rows = calcularKardexDesdeMovimientos(data || [], params.tmo);
    setKardexRows(rows);       // 👈 esto alimenta tu Table
  };



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

  const handleReport = (filters) => {
    if (!filters) return;

    const params = {
      anno: filters.anio || annoActual,
      mes: filters.mes || "%",
      estado: filters.estado || "%",
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const query = new URLSearchParams(params).toString();

    windowsOpen(
      `${API_URL}/cotizaciones/reportes/reporte_cotizaciones_dashboard_html/?${query}`,
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
            boxShadow:
              shadowOpacity.get() > 0
                ? `0 2px 8px rgba(0,0,0,${shadowOpacity.get()})`
                : "none",
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
              Kardex
            </motion.h1>
            <motion.p
              className="mt-1 text-gray-600 italic truncate"
              style={{ fontSize: "clamp(0.7rem,0.9vw,1rem)" }}
            >
              Gestión de <span className="font-semibold text-blue-600">kardex</span>.
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
            onReport={handleReport}
            onProcess={async (filters, event) => {
              if (event) event.preventDefault();
              setProcessingFilters(true);
              try {
                const params = {
                  anno: filters.anio || annoActual,
                  mes: filters.mes || "%",
                  moneda: filters.moneda || "S",     // "S" o "D"
                  cod: filters.producto || "%",   // código de producto del modal
                };

                setCurrentFilters(params);
                await fetchKardex(params);          // 👉 llama al endpoint nuevo
              } finally {
                setProcessingFilters(false);
              }
            }}
          />
        </div>

        {/* TABLA KARDEX */}
        <div className="hidden md:block w-full flex-1 overflow-auto relative rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          {processingFilters && (
            <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  <div className="absolute inset-0 rounded-full border-4 border-teal-100 opacity-20"></div>
                </div>
                <span className="text-[10px] font-[900] text-slate-500 uppercase tracking-[0.25em] animate-pulse">
                  Procesando Kardex
                </span>
              </div>
            </div>
          )}

          {/* WRAPPER RESPONSIVE */}
          <div className="w-full flex-1 flex flex-col gap-4">
            {/* DESKTOP / TABLET ≥ md */}
            <div className="hidden md:block w-full h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
              <div className="w-full h-full flex flex-col">
                {/* HEADERS AGRUPADOS */}
                <div className="border-b border-slate-200 bg-slate-50 px-4 lg:px-6 py-2 shrink-0 overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* Fila Ingreso / Salida / Saldo */}
                    <div className="grid grid-cols-[130px,80px,1.6fr,repeat(9,minmax(80px,1fr))] text-[10px] font-[950] uppercase tracking-[0.18em] text-slate-700">
                      <div className="col-span-3" />
                      <div className="col-span-3 text-center">Ingreso</div>
                      <div className="col-span-3 text-center">Salida</div>
                      <div className="col-span-3 text-center">Saldo Final</div>
                    </div>

                    {/* Sub‑encabezados */}
                    <div className="grid grid-cols-[130px,80px,1.6fr,repeat(9,minmax(80px,1fr))] text-[10px] font-semibold text-slate-600 mt-1">
                      <div className="px-2 py-1">Fecha</div>
                      <div className="px-2 py-1">Tipo</div>
                      <div className="px-2 py-1">Referencia</div>

                      <div className="px-2 py-1 text-center">Cant.</div>
                      <div className="px-2 py-1 text-right">Precio</div>
                      <div className="px-2 py-1 text-right">Total</div>

                      <div className="px-2 py-1 text-center">Cant.</div>
                      <div className="px-2 py-1 text-right">Precio</div>
                      <div className="px-2 py-1 text-right">Total</div>

                      <div className="px-2 py-1 text-center">Cant.</div>
                      <div className="px-2 py-1 text-right">Precio</div>
                      <div className="px-2 py-1 text-right">Total</div>
                    </div>
                  </div>
                </div>

                {/* CUERPO: SCROLL VERTICAL + HORIZONTAL */}
                <div className="flex-1 overflow-auto">
                  <div className="min-w-[900px]">
                    <Table
                      headers={[]}
                      data={kardexRows}
                      onRowClick={(row) => {
                        setKardexSeleccionado(row);
                        setKardexDetalleOpen(true);
                      }}
                      renderRow={(row) => {
                        const ingCant = row.ingreso_cant ?? 0;
                        const ingPrec = row.ingreso_precio ?? 0;
                        const ingTot = row.ingreso_total ?? 0;
                        const salCant = row.salida_cant ?? 0;
                        const salPrec = row.salida_precio ?? 0;
                        const salTot = row.salida_total ?? 0;
                        const saldCant = row.saldo_cant ?? 0;
                        const saldPrec = row.saldo_precio ?? 0;
                        const saldTot = row.saldo_total ?? 0;

                        return [
                          <span className="text-[11px] font-semibold text-slate-800 tabular-nums text-left leading-none">
                            {row.fecha}
                          </span>,

                          <span className="text-[11px] font-semibold text-slate-800 text-left tracking-tight uppercase leading-none">
                            {row.tipo}
                          </span>,

                          <span className="text-[11px] font-medium text-slate-700 text-left tracking-tight leading-none">
                            {row.referencia}
                          </span>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                              {ingCant}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                              {ingPrec.toFixed(4)}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                              {ingTot.toFixed(2)}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                              {salCant}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                              {salPrec.toFixed(4)}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                              {salTot.toFixed(2)}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-bold text-slate-800 tabular-nums">
                              {saldCant}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                              {saldPrec.toFixed(4)}
                            </span>
                          </div>,

                          <div className="text-right py-1">
                            <span className="text-[11px] font-black text-amber-500 tabular-nums">
                              {saldTot.toFixed(2)}
                            </span>
                          </div>,
                        ];
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE < md: CARDS */}
            <div className="md:hidden flex flex-col gap-3">
              {kardexRows.map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {row.fecha} · {row.tipo}
                    </span>
                    <span className="text-[11px] font-black text-amber-500 tabular-nums">
                      {(row.saldo_total ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2">
                    {row.referencia}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600">
                    <div>
                      <p className="font-semibold uppercase text-slate-500">
                        Ingreso
                      </p>
                      <p>
                        Cant:{" "}
                        <span className="font-bold">
                          {row.ingreso_cant ?? 0}
                        </span>
                      </p>
                      <p>
                        Tot:{" "}
                        <span className="font-bold tabular-nums">
                          {(row.ingreso_total ?? 0).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase text-slate-500">
                        Salida
                      </p>
                      <p>
                        Cant:{" "}
                        <span className="font-bold">
                          {row.salida_cant ?? 0}
                        </span>
                      </p>
                      <p>
                        Tot:{" "}
                        <span className="font-bold tabular-nums">
                          {(row.salida_total ?? 0).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase text-slate-500">
                        Saldo
                      </p>
                      <p>
                        Cant:{" "}
                        <span className="font-bold">
                          {row.saldo_cant ?? 0}
                        </span>
                      </p>
                      <p>
                        Tot:{" "}
                        <span className="font-bold tabular-nums text-amber-500">
                          {(row.saldo_total ?? 0).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* LEYENDA DE ESTADOS (si la sigues usando) */}
        <div
          className="
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
        "
        >
          {[
            { label: "Abierto", color: ESTADO_STATE_COLORS["0"] },
            { label: "Cerrado", color: ESTADO_STATE_COLORS["1"] },
          ].map(({ label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 min-w-[120px] md:min-w-[140px]"
            >
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              ></span>
              <span className="text-gray-600 truncate text-xs md:text-[clamp(0.65rem, 1vw, 1rem)]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* MODAL NUEVA LOGÍSTICA (si lo sigues usando) */}
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
