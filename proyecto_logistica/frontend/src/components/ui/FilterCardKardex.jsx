import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  Network,
  Info,
  Repeat2,
  Binoculars,
  Search,
  AlertTriangle,
  Filter,
  Loader2,
  ChevronDown,
  Building2,
  Send,
  FileSliders,
  FunnelX,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";

/* ==========================================================
   📌 FilterCard — Filtros corporativos PMInsight (COTIZACIONES)
   ========================================================== */
const FilterCard = ({ onProcess, onReport, initialFilters = {} }) => {
  const currentYear = new Date().getFullYear();

const [filters, setFilters] = useState({
  anio: initialFilters.anno || "%",   // "%" = todos
  mes: initialFilters.mes || "%",
  cliente: initialFilters.cliente || "%",
  estado: initialFilters.estado || "%",
  area: initialFilters.area || "%",
  envio: initialFilters.envio || "%",
  moneda: initialFilters.moneda || "S",
  producto: "",
  generalCampo: "",
  generalValor: "",
});


  const [clientes, setClientes] = useState([]);
  const [areas, setAreas] = useState([]);
  const estados = [
    { value: "%", label: "-- Todos --" },
    { value: "1", label: "Adjudicado" },
    { value: "2", label: "Pendiente" },
    { value: "3", label: "Perdida" },
    { value: "4", label: "Anulado" },
    { value: "5", label: "Postergada" },
    { value: "7", label: "En Seguimiento" },
    { value: "2_7", label: "Pendiente y Seguimiento" },
  ];
  const envios = [
    { value: "%", label: "-- Todos --" },
    { value: "0", label: "Pendiente de Envio" },
    { value: "1", label: "Pendiente de Revision" },
    { value: "2", label: "Pendiente de Aprobacion" },
    { value: "3", label: "Enviado" },
  ];

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const DEFAULT_FILTERS = {
    anio: "%",                 // vuelve a "-- Todos --"
    mes: "%",                 // vuelve a "-- Todos --"
    cliente: "%",
    estado: "%",
    area: "%",
    envio: "%",
    moneda: "S",              // default Soles (S)
    producto: "",
    generalCampo: "",
    generalValor: "",
  };

  // Producto seleccionado para mostrar en el SelectBox
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  // ================================
  // 🔍 BUSCADOR DE PRODUCTOS
  // ================================
  const [openBuscador, setOpenBuscador] = useState(false);
  const [busquedaQuery, setBusquedaQuery] = useState("");
  const [productosLista, setProductosLista] = useState([]);
  const [loadingBuscador, setLoadingBuscador] = useState(false);

  const fetchProductos = async (query) => {
    setLoadingBuscador(true);
    try {
      const res = await api.get(`logistica/dashboard/productos/?q=${query}`);
      setProductosLista(res.data || []);
    } catch {
      setProductosLista([]);
    } finally {
      setLoadingBuscador(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos(busquedaQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaQuery]);

  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(
      `${producto.codigo || ""} - ${producto.nombre || ""}`
    );
    // guardar código de producto en filtros para backend
    setFilters((prev) => ({
      ...prev,
      producto: producto.codigo || "",
    }));

    setOpenBuscador(false);
    setBusquedaQuery("");
    setProductosLista([]);
  };

  const handleClearFilters = async () => {
    setFilters(DEFAULT_FILTERS);
    setProductoSeleccionado("");
    setBusquedaQuery("");
    setProductosLista([]);

    if (onProcess) {
      await onProcess(DEFAULT_FILTERS);
    }
  };

  /* ==========================================================
     🚀 Carga inicial de combos (Clientes / Áreas / Estados / Envios)
     ========================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clientesRes, areasRes] = await Promise.all([
          api.get("cotizaciones/clientes/"),
          api.get("cotizaciones/areas/"),
          api.get("cotizaciones/estados/"),
        ]);

        setClientes(clientesRes.data || []);
        setAreas(areasRes.data || []);
      } catch (err) {
        console.error("❌ Error cargando filtros:", err);
        setError("No se pudieron cargar las opciones de filtro.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const anios = Array.from(
    { length: currentYear - 2010 + 1 },
    (_, i) => 2010 + i
  );

  const meses = [
    { value: "%", label: "-- Todos --" },
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  /* ==========================================================
     🎯 Campos del Filtro General — DashboardCotizacion
     ========================================================== */
  const camposGenerales = [
    { value: "", label: "-- Todos --" },
    { value: "num_reg", label: "N° Registro" },
    { value: "cotin", label: "Código" },
    { value: "cotif", label: "Fecha Emisión" },
    { value: "cliente_nombre", label: "Nombre Cliente" },
    { value: "refef", label: "Referencia" },
    { value: "nombr", label: "Representante" },
    { value: "nombc", label: "Resp. Comercial" },
    { value: "nombt", label: "Resp. Técnico" },
    { value: "tot_c", label: "Cotizado" },
    { value: "tot_d", label: "Total" },
    { value: "prob", label: "Probabilidad" },
    { value: "regus", label: "Hecho por" },
  ];

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // aquí moneda ya usa "S" / "D"
  const monedas = [
    { value: "S", label: "Soles" },
    { value: "D", label: "Dólares" },
  ];

  /* ==========================================================
     🔥 Aplicar filtros
     ========================================================== */
const handleProcess = async (e) => {
  try {
    if (e) e.preventDefault();
    if (!onProcess) return;

    setProcessing(true);

    const filtros = getNormalizedFilters();
    await onProcess(filtros);
  } catch (err) {
    setError("Error al aplicar filtros.");
  } finally {
    setProcessing(false);
  }
};


const getNormalizedFilters = () => {
  const filtros = { ...filters };

  if (filtros.generalCampo && filtros.generalValor) {
    filtros.campo = filtros.generalCampo;
    filtros.valor = filtros.generalValor.trim();
  }

  delete filtros.generalCampo;
  delete filtros.generalValor;

  return filtros;
};

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length) {
      setFilters((prev) => ({
        ...prev,
        ...initialFilters,
      }));
    }
  }, [initialFilters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative w-full"
    >
      {/* HEADER */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full flex items-center justify-between px-1 py-2 md:py-0 cursor-pointer md:cursor-default"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
          <Filter className="w-4 h-4 text-blue-600" /> Filtros
        </h2>

        <div className="md:hidden">
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isMobileOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {(isMobileOpen || window.innerWidth >= 768) && (
          <motion.div
            key="filters-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            className="pt-3 pb-4 flex flex-col gap-5"
          >
            {/* ERROR MESSAGE */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-2 text-xs">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Botón Limpiar flotante */}
            <button
              onClick={handleClearFilters}
              className="absolute top-2 right-2 px-2 py-1 text-xs rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 shadow-sm flex items-center gap-1"
            >
              <FunnelX className="w-4 h-4" />
            </button>

            {/* SELECTORES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Año + Mes */}
              <div className="grid grid-cols-2 gap-2">
                {/* Año */}
                          <SelectBox
                    label="Año"
                    icon={<Calendar className="w-4 h-4" />}
                    options={[
                      { value: "%", label: "Todos" },          // <- opción para todos
                      ...anios
                        .slice()
                        .reverse()
                        .map((a) => ({ value: String(a), label: String(a) })),
                    ]}
                    value={filters.anio}
                    onChange={(e) => handleChange("anio", e.target.value)}
                  />
                {/* Mes */}
                <SelectBox
                  label="Mes"
                  icon={<CalendarDays className="w-4 h-4" />}
                  options={meses}
                  value={filters.mes}
                  onChange={(e) => handleChange("mes", e.target.value)}
                />
              </div>

              {/* Selector de Producto (abre modal) */}
              <SelectBox
                label="Seleccione Producto"
                icon={<Building2 className="w-4 h-4" />}
                options={[]} // no se usan en modo onOpen
                value={productoSeleccionado}
                onChange={() => {}}
                onOpen={() => {
                  setBusquedaQuery("");
                  fetchProductos("");
                  setOpenBuscador(true);
                }}
              />

              {/* Moneda */}
              <div className="grid grid-cols-2 gap-2">
                <SelectBox
                  label="Moneda"
                  icon={<Binoculars className="w-4 h-4" />}
                  options={monedas}
                  value={filters.moneda}
                  onChange={(e) => handleChange("moneda", e.target.value)}
                />
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={handleProcess}
                disabled={processing}
                size="lg"
                variant="ghost"
                className="text-sm font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100 border border-transparent hover:border-blue-200 rounded-xl h-9 px-8 transition-all"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <Repeat2 className="w-4 h-4" /> Procesar
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleClearFilters}
                size="lg"
                variant="ghost"
                className="text-sm font-black uppercase tracking-widest text-green-700 hover:bg-green-100 border border-transparent hover:border-green-200 rounded-xl h-9 px-8 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Limpiar
              </Button>

                <Button
                  type="button"
                  onClick={() => {
                    if (!onReport) return;
                    const filtros = getNormalizedFilters();
                    onReport(filtros); // ← Pasa los mismos filtros que "Procesar"
                  }}
                  size="lg"
                  variant="ghost"
                  className="text-sm font-black uppercase tracking-widest text-orange-700 hover:bg-orange-100 border border-transparent hover:border-orange-200 rounded-xl h-9 px-8 transition-all"
                >
                  <FileSliders className="w-4 h-4" /> Reporte PDF
                </Button>


            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL BUSCADOR DE PRODUCTOS */}
      {openBuscador && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenBuscador(false)}
          />
          {/* Contenido */}
          <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[520px] max-h-[480px] flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-600 rounded">
                  <Building2 size={14} className="text-white" />
                </div>
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  Seleccionar Producto
                </span>
              </div>
              <button
                onClick={() => setOpenBuscador(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors rounded"
              >
                ✕
              </button>
            </div>

            {/* Buscador */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar por código o nombre..."
                  value={busquedaQuery}
                  onChange={(e) => setBusquedaQuery(e.target.value)}
                  className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
                />
              </div>
            </div>

            {/* Tabla resultados */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-36">
                      Código
                    </th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">
                      Nombre
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productosLista.length === 0 && !loadingBuscador && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold"
                      >
                        {busquedaQuery.length < 1
                          ? "Escriba para buscar productos"
                          : "No se encontraron productos"}
                      </td>
                    </tr>
                  )}

                  {loadingBuscador && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-8 text-center text-[11px] text-teal-500 font-black"
                      >
                        Buscando...
                      </td>
                    </tr>
                  )}

                  {!loadingBuscador &&
                    productosLista.map((producto, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handleSeleccionarProducto(producto)}
                        className="hover:bg-teal-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                          {producto.codigo}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                          {producto.nombre}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold">
                {productosLista.length > 0
                  ? `${productosLista.length} resultado(s) encontrado(s)`
                  : "Sin resultados"}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/* ==========================================================
   🧩 SelectBox — Componente corporativo PMInsight
   ========================================================== */
const SelectBox = ({ label, icon, options, value, onChange, onOpen }) => {
  const isFakeSelect = typeof onOpen === "function";

  if (isFakeSelect) {
    // Modo botón para abrir modal
    return (
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
          {icon} {label}
        </label>

        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-xl border bg-white px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-teal-50 hover:border-teal-400 transition-all"
        >
          <span className="truncate text-gray-700">
            {value || "Seleccione producto"}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    );
  }

  // Modo select normal
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
        {icon} {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 transition-all"
      >
        {options.map((opt) => (
          <option key={`${label}-${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterCard;
