//MODAL PARA REALIZAR UN NUEVO REGISTRO DE SALIDA

import React, { useState, useRef, useEffect } from "react";
import logoImg from "@/assets/logo.png";
import api from "@/services/api";
import SelectField from "../../components/ui/SelectField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ClipboardList, 
  Truck, 
  MapPin, 
  Trash2, 
  Plus, 
  Save, 
  Printer, 
  Barcode,
  X 
} from "lucide-react";

export default function LogisticaModal({ open, onClose, dataInitial = null, logistica }) {

  const [data, setData] = useState(logistica || {});
  const cab = data?.cabecera || {};
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // NUEVO ITEM (fila de búsqueda)
  // ================================
  const [newItem, setNewItem] = useState({
    codigo: "",
    descripcion: "",
    um: "",
    cant: "",
    valor: "",
  });

  // Calcular Total General
  const totalGeneral = items.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewItem = () => {
    if (!newItem.codigo && !newItem.descripcion) return;
    const cant  = Number(newItem.cant  || 0);
    const valor = Number(newItem.valor || 0);
    setItems((prev) => [
      ...prev,
      {
        id:          Date.now(),
        codigo:      newItem.codigo,
        descripcion: newItem.descripcion,
        um:          newItem.um,
        cant:        cant,
        valor:       valor,
        total:       cant * valor,
      },
    ]);
    setNewItem({ codigo: "", descripcion: "", um: "", cant: "", valor: "" });
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };



const fetchNextNumReg = async () => {
  try {
    const { data } = await api.get('logistica/dashboard/next-num-reg/');
    console.log('✅ next-num-reg response:', data); // ← agrega esto
    setForm((prev) => ({
      ...prev,
      numero: data.num_reg_formatted,
      fecha: new Date().toISOString().split('T')[0],
      moneda: 'Soles',
    }));
  } catch (err) {
    console.error('❌ Error next-num-reg:', err); // ← y esto
    toast.error('No se pudo obtener el siguiente número de registro');
  }
};


useEffect(() => {
  if (!open) {
    setForm({});
    setItems([]);
    setData({});
    return;
  }

  if (logistica?.num_reg) {
    // ✅ MODO EDICIÓN — carga registro existente
    fetchLogisticaDetalle(logistica.num_reg);
  } else {
    // ✅ MODO NUEVO — trae el siguiente num_reg automáticamente
    fetchNextNumReg();
    setForm((prev) => ({
      ...prev,
      fecha: new Date().toISOString().split('T')[0],
      moneda: 'Soles',
    }));
  }
}, [open, logistica?.num_reg]);

  // =====================
  // OPCIONES LOGISTICA
  // =====================
  const almacenesOptions = [
    { id: "000", nombre: "Almacen Principal" },
    { id: "001", nombre: "Almacen Equipos de Proteccion" },
    { id: "003", nombre: "ALMACEN DE EQUIPOS PARA VENTA" },
    { id: "004", nombre: "Movimientos Quellaveco" },
    { id: "005", nombre: "Para Ventas" },
    { id: "006", nombre: "ALMACEN PATRIMONIO" },
    { id: "007", nombre: "TEMPORAL" },
  ];

  const ReferenciaOptions = [
    { id: "P", nombre: "Proveedor/Cliente" },
    { id: "D", nombre: "Dependencia" },
    { id: "C", nombre: "Centro de Costo" },
    { id: "A", nombre: "Apertura" },
    { id: "O", nombre: "Otro" },
    { id: "DON", nombre: "Donacion" },
    { id: "U", nombre: "Colaborador" },
  ];

  const movimientoOptions = [
    { id: "01", nombre: "Orden de Compra" },
    { id: "02", nombre: "Orden de Servicio" },
    { id: "03", nombre: "O.C. /G. Internamiento" },
    { id: "04", nombre: "Pecosa" },
    { id: "05", nombre: "Nota de Entrada" },
    { id: "06", nombre: "Ingreso x devolucion" },
    { id: "07", nombre: "Ingreso x Donacion" },
    { id: "08", nombre: "Ingreso x Transferencia" },
    { id: "09", nombre: "Salida de Ajuste de Inventario" },
    { id: "10", nombre: "Salida x Transferencia" },
    { id: "11", nombre: "Salida por Perdida" },
    { id: "12", nombre: "Ingreso por Ajuste de Inventario" },
    { id: "13", nombre: "Orden de Requerimiento" },
    { id: "99", nombre: "Saldo Inicial" },
    { id: "14", nombre: "Préstamo para Ejecución de Servicio" },
    { id: "15", nombre: "Nota de Credito" },
    { id: "16", nombre: "Nota de Debito" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("logistica/movimiento/", {
        ...form,
        items,
        ope: "S", // 🔥 CLAVE
      });

      toast.success("Entrada de almacén guardada correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al procesar el registro");
    } finally {
      setSaving(false);
    }
  };

// ================================
// BUSCADOR DE PRODUCTOS
// ================================
const [openBuscador, setOpenBuscador]       = useState(false);
const [busquedaQuery, setBusquedaQuery]     = useState("");
const [productosLista, setProductosLista]   = useState([]);
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
  if (!openBuscador) return;  // ✅ sin esto, el bug persiste
  const timer = setTimeout(() => {
    fetchProductos(busquedaQuery);
  }, 400);
  return () => clearTimeout(timer);
}, [busquedaQuery, openBuscador]);


const handleSeleccionarProducto = (producto) => {
  setNewItem({
    codigo:      producto.codigo || "",
    descripcion: producto.nombre || "",
    um:          producto.unidad || "",
    cant:        "",
    valor:       producto.precio || "",
  });
  setOpenBuscador(false);
  setBusquedaQuery("");
  setProductosLista([]);
};


// ================================
// BUSCADOR DE CLIENTES / RAZÓN SOCIAL
// ================================
const [openCliente, setOpenCliente]       = useState(false);
const [clienteQuery, setClienteQuery]     = useState("");
const [clienteLista, setClienteLista]     = useState([]);
const [loadingCliente, setLoadingCliente] = useState(false);    

const fetchClientes = async (q = "") => {
  setLoadingCliente(true);
  try {
    const { data } = await api.get("cotizaciones/clientes/", { params: { q } });
    setClienteLista(Array.isArray(data) ? data : []);
  } catch {
    setClienteLista([]);
  } finally {
    setLoadingCliente(false);
  }
};

const handleCloseCliente = () => {
  setOpenCliente(false);
  setClienteQuery("");
  setClienteLista([]);
};

const handleSeleccionarCliente = (cliente) => {
  setForm((prev) => ({
    ...prev,
    razon_social: cliente.nombre,
    ruc:          cliente.ruc || "",
    cliente_codigo: cliente.codigo,
  }));
  handleCloseCliente();
};



// ================================
// BUSCADOR DE ORDENES (OC)
// ================================
const [openOrden, setOpenOrden]       = useState(false);
const [ordenProveedor, setOrdenProveedor] = useState("");
const [ordenNumero, setOrdenNumero]       = useState("");
const [ordenLista, setOrdenLista]     = useState([]);
const [loadingOrden, setLoadingOrden] = useState(false);
const [openSeleccionOC, setOpenSeleccionOC] = useState(false);
const [itemsOCSeleccion, setItemsOCSeleccion] = useState([]); // para el modal de check
const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
const handleCloseOrden = () => {
  setOpenOrden(false);
  setOrdenProveedor("");
  setOrdenNumero("");
  setOrdenLista([]);
};

const fetchOrden = async () => {
  setLoadingOrden(true);
  try {
    const { data } = await api.get("logistica/dashboard/ordenes-oc/", {
      params: {
        proveedor: ordenProveedor,
        numero: ordenNumero,
      },
    });
    setOrdenLista(Array.isArray(data) ? data : []);
  } catch {
    setOrdenLista([]);
  } finally {
    setLoadingOrden(false);
  }
};

useEffect(() => {
  if (!openOrden) return;
  const timer = setTimeout(() => {
    fetchOrden();
  }, 400);
  return () => clearTimeout(timer);
}, [ordenProveedor, ordenNumero, openOrden]);


const handleSeleccionarOrden = async (oc) => {
  // 1) Cabecera
  setForm((prev) => ({
    ...prev,
    orden_compra: oc.codigo,
    razon_social: oc.cliente,
   moneda:
  oc.moneda === "Dolares" || oc.moneda === "Dolares"
    ? "Dolares"
    : "Soles",
    tc: Number(oc.tcambio || 0),
    monto_orden_soles: Number(oc.monto_soles || 0),
    monto_orden_dolares: Number(oc.monto_dolares || 0),
  }));
  setOrdenSeleccionada(oc);
  try {
    const { data } = await api.get(
      `logistica/dashboard/ordenes-oc/${oc.reg}/items/`
    );

    const mappedItems = (data || []).map((item, idx) => ({
      id: idx + 1,
      nro: item.num,
      codigo: item.codigo || "",
      descripcion: item.descripcion || "",
      um: "UNI",
      cant: Number(item.cant || 0),
      valor: Number(item.valor || 0),
      total: Number(item.total || 0),
      checked: true,             // <- marcado por defecto
    }));

    // No pisas items, los guardas para el modal de selección
    setItemsOCSeleccion(mappedItems);
    setOpenSeleccionOC(true);    // abre modal de check
  } catch (error) {
    console.error("❌ Error detalle_orden_compra:", error);
    toast.error("No se pudo cargar el detalle de la orden");
  }

  // 3) Cerrar modal anterior
  setOpenOrden(false);
  setOrdenProveedor("");
  setOrdenNumero("");
  setOrdenLista([]);
};




// ================================
// BUSCADOR DE USUARIOS / RESPONSABLE
// ================================
const [openUsuario, setOpenUsuario]       = useState(false);
const [usuarioQuery, setUsuarioQuery]     = useState("");
const [usuarioLista, setUsuarioLista]     = useState([]);
const [loadingUsuario, setLoadingUsuario] = useState(false);

const fetchUsuarios = async (q = "") => {
  setLoadingUsuario(true);
  try {
    const { data } = await api.get("usuarios-activos/", { params: { q } });
    setUsuarioLista(Array.isArray(data) ? data : []);
  } catch {
    setUsuarioLista([]);
  } finally {
    setLoadingUsuario(false);
  }
};

useEffect(() => {
  const timer = setTimeout(() => {
    if (openUsuario) fetchUsuarios(usuarioQuery);
  }, 400);
  return () => clearTimeout(timer);
}, [usuarioQuery]);

const handleCloseUsuario = () => {
  setOpenUsuario(false);
  setUsuarioQuery("");
  setUsuarioLista([]);
};

const handleSeleccionarUsuario = (usuario) => {
  setForm((prev) => ({
    ...prev,
    responsable: usuario.nomb_cort_usu || usuario.usuario_usu,
  }));
  handleCloseUsuario();
};



// ================================
// BUSCADOR DE UNIDADES DE MEDIDA
// ================================
const [openUmed, setOpenUmed]           = useState(false);
const [umedQuery, setUmedQuery]         = useState("");
const [umedLista, setUmedLista]         = useState([]);
const [loadingUmed, setLoadingUmed]     = useState(false);

const fetchUmed = async (query) => {
  setLoadingUmed(true);
  try {
    const res = await api.get(`logistica/dashboard/umed/?q=${query}`);
    setUmedLista(res.data || []);
  } catch {
    setUmedLista([]);
  } finally {
    setLoadingUmed(false);
  }
};

useEffect(() => {
  const timer = setTimeout(() => {
    if (openUmed) fetchUmed(umedQuery);
  }, 400);
  return () => clearTimeout(timer);
}, [umedQuery]);

const handleSeleccionarUmed = (umed) => {
  setNewItem((prev) => ({ ...prev, um: umed.abr || umed.codigo }));
  setOpenUmed(false);
  setUmedQuery("");
  setUmedLista([]);
};

// Función reutilizable para cerrar limpio
const handleCloseUmed = () => {
  setOpenUmed(false);
  setUmedQuery("");
  setUmedLista([]);
};



  // =======
  // NUMREG
  // ========
  const numReg = Number(logistica?.num_reg) || null;

  const fetchLogisticaDetalle = async (num_reg) => {
    if (!num_reg) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`logistica/dashboard/modal/${num_reg}/`);
      const backendData = res.data;

      setData(backendData);

      console.log("📦 MOVIMIENTO LOGÍSTICO RAW:", backendData);

      // ==============================
      // 🔥 HIDRATAR CABECERA
      // ==============================
      const cab = backendData.cabecera || {};
      const tc = Number(cab.tipo_cambio || 0);

      const formHidratado = {
        fecha:           cab.fecha           || "",
        almacen:         cab.almacen         || "",
        referencia:      cab.referencia      || "",
        numero:          cab.numero          || "",
        moneda:          cab.moneda === "Dolares" ? "Dolares" : "Soles",
        tc:              tc,
        responsable:     cab.responsable     || "",
        tipo_movimiento: cab.tipo_movimiento || "",
        orden_compra:    cab.orden_compra    || "",
        razon_social:    cab.razon_social    || "",
        numero_doc:      cab.numero_doc      || "",
        obsdoc:          cab.obsdoc          || "",
        documentos:      cab.numerodoc       || "",
        puntoPartida:    cab.observacion     || "",
        puntoLlegada:    "",
        nro_guia:        cab.nro_guia        || "",
        obs_doc:         cab.observacion         || "",
      };

      setForm(formHidratado);

      console.log("🧾 CABECERA HIDRATADA:", formHidratado);
      console.log("💱 TC:", tc);

      // ==============================
      // 🔥 HIDRATAR ITEMS
      // ==============================
      const mappedItems = (backendData.items || []).map((item, index) => ({
        id:          index + 1,
        codigo:      item.codigo         || "",
        descripcion: item.nombre         || "",
        um:          item.unidad         || "",
        cant:        Number(item.cantidad       || 0),
        valor:       Number(item.valor_unitario || 0),
        total:       Number(item.total          || 0),
      }));

      setItems(mappedItems);

      console.log("📦 ITEMS HIDRATADOS:", mappedItems);

    } catch (err) {
      console.error("Error cargando detalle logístico:", err);
      setError("No se pudo cargar la información del movimiento.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="
        w-[95vw] sm:w-auto
        max-w-5xl
        max-h-[90vh]
        p-0
        overflow-hidden
        bg-white
        rounded-2xl
        shadow-2xl
        border-none
        font-sans
        flex flex-col
      ">

        {/* HEADER */}
        <div className="shrink-0 bg-slate-900 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
<div className="p-2 bg-teal-600 text-white rounded-lg">
                <Package size={20} strokeWidth={2.5} />
              </div>
              <img src={logoImg} alt="Logo VC Corporation" className="h-8 w-auto ml-2" />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Salida de Almacén
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Gestión de Inventarios y Traslados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold border border-slate-700">
                ID: {form.numero || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* CUERPO */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">

          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="grid grid-cols-12 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="col-span-12 flex items-center gap-2 mb-2">
              <ClipboardList size={14} className="text-teal-600" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Información de Cabecera</span>
            </div>

            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fecha Registro</label>
              <input
                type="text"
                name="fecha"
                value={form.fecha || ""}
                readOnly
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Almacen</label>
              <SelectField
                id="almacen"
                inline
                size="sm"
                value={form.almacen || ""}
                onChange={(e) => handleInputChange({ target: { name: "almacen", value: e.target.value } })}
                options={almacenesOptions}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Moneda</label>
                <select
                  name="moneda"
                  value={form.moneda || ""}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-gray-100"
                >
                  <option value="Soles">Soles</option>
                  <option value="Dolares">Dolares</option>
                </select>
            </div>

            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Referencia</label>
              <SelectField
                id="mov"
                inline
                size="sm"
                value={form.referencia || ""}
                onChange={(e) => handleInputChange({ target: { name: "referencia", value: e.target.value } })}
                options={ReferenciaOptions}
              />
            </div>
              {/* SECCIÓN 2: DOCUMENTOS */}
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tipo movimiento</label>
              <SelectField
                id="tip"
                inline
                size="sm"
                value={form.tipo_movimiento || ""}
                onChange={(e) => handleInputChange({ target: { name: "tipo_movimiento", value: e.target.value } })}
                options={movimientoOptions}
              />
            </div>
            <div className="col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      Número
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={form.orden_compra || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            orden_compra: e.target.value,
                          }))
                        }
                        placeholder="Ingresar número o referencia..."
                        className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 pr-10
                                  bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                      />

                      {/* BOTÓN PARA ABRIR MODAL */}
                      <button
                        type="button"
                        onClick={() => {
                          console.log("CLICK NUMERO");
                          setOrdenProveedor("");
                          setOrdenNumero("");
                          setOrdenLista([]);
                          setOpenOrden(true);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs 
                                  bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md"
                        title="Buscar orden"
                      >
                        🔍
                      </button>
                    </div>
                  </div>
           <div className="col-span-9 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Razón Social
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={form.razon_social || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        razon_social: e.target.value,
                      }))
                    }
                    placeholder="Ingresar o buscar cliente..."
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 pr-10
                              bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                  />

                  {/* BOTÓN PARA ABRIR MODAL */}
                  <button
                    type="button"
                    onClick={() => {
                      setClienteQuery("");
                      setClienteLista([]);
                      fetchClientes("");
                      setOpenCliente(true);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs 
                              bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md"
                    title="Buscar cliente"
                  >
                    🔍
                  </button>
                </div>
              </div>
          </div>

          {/* SECCIÓN 2: DOCUMENTOS */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-l-4 border-l-teal-500">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Truck size={14} className="text-teal-600" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Documentos</span>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nro. Factura</label>
                <input
                  type="text"
                  value={form.numero_doc || ""}
                  onChange={(e) => setForm({ ...form, numero_doc: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
       <div className="col-span-9 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Recibido por
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={form.responsable || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      responsable: e.target.value,
                    }))
                  }
                  placeholder="Ingresar o buscar usuario..."
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 pr-10
                            bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                />

                {/* BOTÓN MODAL */}
                <button
                  type="button"
                  onClick={() => {
                    setUsuarioQuery("");
                    setUsuarioLista([]);
                    fetchUsuarios("");
                    setOpenUsuario(true);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs 
                            bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md"
                  title="Buscar usuario"
                >
                  🔍
                </button>
              </div>
            </div>

              <div className="col-span-6 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                  <MapPin size={10} /> Nro. de Guía
                </label>
                <input
                  type="text"
                  value={form.nro_guia || ""}
                  onChange={(e) => setForm({ ...form, nro_guia: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
              <div className="col-span-6 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                  <MapPin size={10} /> Observación
                </label>
                <input
                  type="text"
                  value={form.obs_doc || ""}
                  onChange={(e) => setForm({ ...form, obs_doc: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: TABLA DE PRODUCTOS */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>

                {/* HEADERS */}
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-12 text-center">Nro</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-32">Código</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase">Descripción</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-16 text-center">UM</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-16 text-center">Cant</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-24 text-right">Valor</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-24 text-right">Total</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase w-12 text-center"></th>
                </tr>

                {/* FILA DE BÚSQUEDA */}
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <td className="px-4 py-2 text-center">
                    <span className="text-[10px] text-slate-400 font-black">»</span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                           <button
                          onClick={() => {
                            setBusquedaQuery("");        // limpia el input
                            fetchProductos("");          // carga todos por defecto
                            setOpenBuscador(true);
                          }}
                          className="shrink-0 px-1.5 py-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded text-[10px] font-black transition-colors"
                          title="Buscar producto"
                        >
                          »
                        </button>
                      <input
                        type="text"
                        placeholder="Código"
                        value={newItem.codigo}
                        onChange={(e) => handleNewItemChange("codigo", e.target.value)}
                        className="w-full text-[11px] font-bold border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-400 bg-white"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Descripción del producto"
                      value={newItem.descripcion}
                      onChange={(e) => handleNewItemChange("descripcion", e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-400 bg-white uppercase"
                    />
                  </td>
                    <td className="px-2 py-2">
                     <button
                        onClick={() => {
                          setUmedQuery("");           // limpia el input
                          setUmedLista([]);           // limpia resultados anteriores
                          fetchUmed("");              // carga todas por defecto
                          setOpenUmed(true);
                        }}
                        className="w-full text-[11px] font-black text-center border border-slate-300 rounded px-1 py-1 
                                  bg-white hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700 
                                  transition-colors outline-none cursor-pointer"
                        title="Seleccionar unidad de medida"
                      >
                        {newItem.um || <span className="text-slate-400">UM</span>}
                      </button>
                    </td>

                  <td className="px-2 py-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={newItem.cant}
                      onChange={(e) => handleNewItemChange("cant", e.target.value)}
                      className="w-full text-[11px] font-bold text-center border border-slate-300 rounded px-1 py-1 outline-none focus:border-teal-400 bg-white"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newItem.valor}
                      onChange={(e) => handleNewItemChange("valor", e.target.value)}
                      className="w-full text-[11px] font-bold text-right border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-400 bg-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-[11px] font-black text-slate-500">
                    {(Number(newItem.cant || 0) * Number(newItem.valor || 0)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={handleAddNewItem}
                      className="p-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors shadow-sm"
                      title="Agregar ítem"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </td>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-2 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 text-xs font-bold text-slate-700">
                      {item.codigo}
                    </td>
                    <td className="px-4 py-2 text-xs font-medium text-slate-600 uppercase">
                      {item.descripcion}
                    </td>
                    <td className="px-4 py-2 text-center text-[10px] font-black text-slate-500">
                      {item.um}
                    </td>
                    <td className="px-4 py-2 text-center text-xs font-bold text-slate-700">
                      {item.cant}
                    </td>
                    <td className="px-4 py-2 text-right text-xs font-bold text-slate-700">
                      {Number(item.valor).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs font-black text-slate-800">
                      {Number(item.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-[11px] text-slate-400 font-semibold">
                      Sin ítems. Completa la fila superior y presiona{" "}
                      <span className="text-teal-500 font-black">+</span>.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-100">
                  <td colSpan={6} className="px-4 py-3 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Total General:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-amber-600">
                    {totalGeneral.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>

        {/* FOOTER */}
        <div className="shrink-0 px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[11px] font-black uppercase shadow-sm">
              <Printer size={16} /> Imprimir
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[11px] font-black uppercase shadow-sm">
              <Barcode size={16} /> Etiquetas
            </button>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-xl h-10 px-8 transition-all"
            >
              Salir
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl h-10 px-10 shadow-lg shadow-teal-200 flex gap-2"
            >
              <Save size={18} />
              {saving ? "Procesando..." : "Guardar Salida"}
            </Button>
          </div>
        </div>

            {/* ===== MODAL BUSCADOR DE PRODUCTOS ===== */}
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
                        <Package size={14} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">
                        Seleccionar Dato
                      </span>
                    </div>
                    <button
                      onClick={() => setOpenBuscador(false)}
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                    >
                      <X size={16} />
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
                {/* ✅ El botón lupa busca con el query actual */}
                <button
                  onClick={() => fetchProductos(busquedaQuery)}
                  className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  {loadingBuscador
                    ? <span className="text-[10px] font-black">...</span>
                    : <span className="text-[12px]">🔍</span>
                  }
                </button>
              </div>
            </div>

            {/* Tabla de resultados */}
            <div className="flex-1 overflow-y-auto max-h-64"> {/* ⬅️ aquí el scroll */}
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-36">Código</th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {productosLista.length === 0 && !loadingBuscador && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                        No se encontraron productos
                      </td>
                    </tr>
                  )}
                  {loadingBuscador && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                        Buscando...
                      </td>
                    </tr>
                  )}
                  {!loadingBuscador && productosLista.map((producto) => (
                    <tr
                      key={producto.codigo}
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

            {/* Footer con contador */}
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
            {/* ===== FIN MODAL BUSCADOR ===== */}

            {/* ===== MODAL BUSCADOR DE UNIDAD DE MEDIDA ===== */}
            {openUmed && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center">

                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={handleCloseUmed}
                />

                {/* Contenido */}
                <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[400px] max-h-[420px] flex flex-col overflow-hidden border border-slate-200">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-teal-600 rounded">
                        <Package size={14} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">
                        Unidad de Medida
                      </span>
                    </div>
                    <button
                      onClick={handleCloseUmed}
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Buscador */}
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar por código o nombre..."
                        value={umedQuery}
                        onChange={(e) => setUmedQuery(e.target.value)}
                        className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
                      />
                      <button
                        onClick={() => fetchUmed(umedQuery)}
                        className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                      >
                        {loadingUmed
                          ? <span className="text-[10px] font-black">...</span>
                          : <span className="text-[12px]">🔍</span>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Tabla resultados */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-24">Código</th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-20 text-center">Abrev.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {umedLista.length === 0 && !loadingUmed && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                              No se encontraron unidades
                            </td>
                          </tr>
                        )}
                        {loadingUmed && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                              Buscando...
                            </td>
                          </tr>
                        )}
                        {!loadingUmed && umedLista.map((umed, idx) => (
                          <tr
                            key={idx}
                            onClick={() => handleSeleccionarUmed(umed)}
                            className="hover:bg-teal-50 cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                              {umed.codigo}
                            </td>
                            <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                              {umed.nombre}
                            </td>
                            <td className="px-4 py-2.5 text-[11px] font-black text-center text-slate-500 group-hover:text-teal-700">
                              {umed.abr}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer contador */}
                  <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {umedLista.length > 0
                        ? `${umedLista.length} unidad(es) encontrada(s)`
                        : "Sin resultados"}
                    </span>
                  </div>

                </div>
              </div>
            )}
            {/* ===== FIN MODAL UNIDAD DE MEDIDA ===== */}


            {/* ===== MODAL BUSCADOR DE USUARIOS ===== */}
            {openUsuario && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center">

                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={handleCloseUsuario}
                />

                {/* Contenido */}
                <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[500px] max-h-[440px] flex flex-col overflow-hidden border border-slate-200">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-teal-600 rounded">
                        <Package size={14} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">
                        Seleccionar Responsable
                      </span>
                    </div>
                    <button
                      onClick={handleCloseUsuario}
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Buscador */}
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar por nombre, usuario o DNI..."
                        value={usuarioQuery}
                        onChange={(e) => setUsuarioQuery(e.target.value)}
                        className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
                      />
                      <button
                        onClick={() => fetchUsuarios(usuarioQuery)}
                        className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                      >
                        {loadingUsuario
                          ? <span className="text-[10px] font-black">...</span>
                          : <span className="text-[12px]">🔍</span>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Tabla resultados */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-28">Usuario</th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-24 text-center">Área</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">

                        {loadingUsuario && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                              Buscando...
                            </td>
                          </tr>
                        )}

                        {!loadingUsuario && usuarioLista.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                              No se encontraron usuarios
                            </td>
                          </tr>
                        )}

                        {!loadingUsuario && usuarioLista.map((usuario, idx) => (
                          <tr
                            key={idx}
                            onClick={() => handleSeleccionarUsuario(usuario)}
                            className="hover:bg-teal-50 cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                              {usuario.usuario_usu}
                            </td>
                            <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                              {usuario.nomb_cort_usu || `${usuario.nom || ""} ${usuario.ape || ""}`.trim()}
                            </td>
                          <td className="px-4 py-2.5 text-[11px] text-center font-semibold text-slate-500 group-hover:text-teal-700">
                              {usuario.area_nombre || "-"}
                            </td>
                          </tr>
                        ))}

                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {usuarioLista.length > 0
                        ? `${usuarioLista.length} usuario(s) encontrado(s)`
                        : "Sin resultados"}
                    </span>
                  </div>

                </div>
              </div>
            )}
            {/* ===== FIN MODAL USUARIOS ===== */}

            {/* ===== MODAL BUSCADOR DE CLIENTES ===== */}
            {openCliente && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center">

                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={handleCloseCliente}
                />

                {/* Contenido */}
                <div className="relative z-10 bg-white rounded-xl shadow-2xl w-[580px] max-h-[480px] flex flex-col overflow-hidden border border-slate-200">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-teal-600 rounded">
                        <Package size={14} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">
                        Seleccionar Cliente
                      </span>
                    </div>
                    <button
                      onClick={handleCloseCliente}
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Buscador */}
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar por nombre o RUC..."
                        value={clienteQuery}
                        onChange={(e) => {
                          setClienteQuery(e.target.value);
                          fetchClientes(e.target.value);
                        }}
                        className="flex-1 text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
                      />
                      <button
                        onClick={() => fetchClientes(clienteQuery)}
                        className="p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                      >
                        {loadingCliente
                          ? <span className="text-[10px] font-black">...</span>
                          : <span className="text-[12px]">🔍</span>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Tabla */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase w-36">RUC</th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase">Nombre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingCliente && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-[11px] text-teal-500 font-black">
                              Buscando...
                            </td>
                          </tr>
                        )}
                        {!loadingCliente && clienteLista.length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-[11px] text-slate-400 font-semibold">
                              No se encontraron clientes
                            </td>
                          </tr>
                        )}
                        {!loadingCliente && clienteLista.map((cliente, idx) => (
                          <tr
                            key={idx}
                            onClick={() => handleSeleccionarCliente(cliente)}
                            className="hover:bg-teal-50 cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-2.5 text-[11px] font-black text-slate-500 group-hover:text-teal-700">
                              {cliente.ruc || "-"}
                            </td>
                            <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700 uppercase">
                              {cliente.nombre}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer contador */}
                  <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {clienteLista.length > 0
                        ? `${clienteLista.length} cliente(s) encontrado(s)`
                        : "Sin resultados"}
                    </span>
                    {form.razon_social && (
                      <button
                        onClick={() => setForm((prev) => ({ ...prev, razon_social: "", ruc: "", cliente_codigo: "" }))}
                        className="text-[10px] text-rose-400 hover:text-rose-600 font-black transition-colors"
                      >
                        ✕ Limpiar selección
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )}
            {/* ===== FIN MODAL CLIENTES ===== */}

             {/* ===== MODAL BUSCADOR DE ORDENES ===== */}
                {openOrden && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-slate-900/60"
              onClick={handleCloseOrden}
            />

            {/* Contenido */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-[900px] max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-600 rounded-lg">
                    <Package size={16} className="text-white" />
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.16em]">
                    Seleccionar orden de compra
                  </span>
                </div>
                <button
                  onClick={handleCloseOrden}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Buscador */}
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Proveedor (RUC o razón social)"
                    value={ordenProveedor}
                    onChange={(e) => setOrdenProveedor(e.target.value)}
                    className="flex-1 text-[11px] font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Número Orden"
                    value={ordenNumero}
                    onChange={(e) => setOrdenNumero(e.target.value)}
                    className="w-40 text-[11px] font-semibold border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-white"
                  />
                  <button
                    onClick={fetchOrden}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-[11px] font-semibold flex items-center justify-center"
                  >
                    {loadingOrden ? "Buscando..." : "Buscar"}
                  </button>
                </div>
              </div>

              {/* Tabla resultados */}
              <div className="flex-1 overflow-y-auto bg-white">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase w-40">
                        Código
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase">
                        Cliente
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase w-20 text-center">
                        Moneda
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase w-24 text-center">
                        T. Cambio
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase w-28 text-right">
                        Monto Soles
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase w-28 text-right">
                        Monto Dólares
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loadingOrden && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-[11px] text-teal-500 font-black"
                        >
                          Buscando...
                        </td>
                      </tr>
                    )}

                    {!loadingOrden && ordenLista.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-[11px] text-slate-400 font-semibold"
                        >
                          No se encontraron órdenes
                        </td>
                      </tr>
                    )}

                    {!loadingOrden &&
                      ordenLista.map((oc) => (
                        <tr
                          key={oc.reg ?? oc.codigo}
                          onClick={() => handleSeleccionarOrden(oc)}
                          className="hover:bg-teal-50 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 py-2.5 text-[11px] font-black text-slate-700 group-hover:text-teal-700">
                            {oc.codigo}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] font-medium text-slate-600 group-hover:text-teal-700">
                            {oc.cliente}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-center font-semibold text-slate-500 group-hover:text-teal-700">
                            {oc.moneda === "D" ? "US$" : "S/."}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-center font-semibold text-slate-500">
                            {Number(oc.tcambio || 0).toFixed(3)}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-right font-semibold text-slate-500">
                            {Number(oc.monto_soles || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-right font-semibold text-slate-500">
                            {Number(oc.monto_dolares || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-semibold">
                  {ordenLista.length > 0
                    ? `${ordenLista.length} orden(es) encontrada(s)`
                    : "Sin resultados"}
                </span>
                <button
                  onClick={handleCloseOrden}
                  className="px-3 py-1.5 text-[11px] rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}


                  {/* ===== FIN MODAL ordenes ===== */}
      {openSeleccionOC && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
    <div className="bg-slate-900 rounded-2xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <span className="text-[11px] font-black text-emerald-400">OC</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-300 tracking-[0.12em] uppercase">
              Seleccionar ítems
            </p>
            <p className="text-[11px] text-slate-400">
              Orden de compra: <span className="font-semibold text-slate-100">{form.orden_compra}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpenSeleccionOC(false)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="bg-slate-950/40 px-5 py-3 border-b border-slate-800">
        <p className="text-[11px] text-slate-400">
          Todos los ítems están marcados por defecto. Desmarca los que no quieras importar y presiona{" "}
          <span className="font-semibold text-emerald-400">Aceptar</span>.
        </p>
      </div>

    <div className="flex-1 overflow-auto bg-slate-50">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="w-10 px-3 py-2 text-center">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-emerald-500"
                  checked={
                    itemsOCSeleccion.length > 0 &&
                    itemsOCSeleccion.every((it) => it.checked)
                  }
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setItemsOCSeleccion((prev) =>
                      prev.map((it) => ({ ...it, checked }))
                    );
                  }}
                />
              </th>
              <th className="w-12 px-2 py-2 text-[10px] font-black text-slate-600 uppercase text-center">
                Nro
              </th>
              <th className="w-32 px-2 py-2 text-[10px] font-black text-slate-600 uppercase">
                Código
              </th>
              <th className="px-2 py-2 text-[10px] font-black text-slate-600 uppercase">
                Descripción
              </th>
              <th className="w-16 px-2 py-2 text-[10px] font-black text-slate-600 uppercase text-center">
                UM
              </th>
              <th className="w-20 px-2 py-2 text-[10px] font-black text-slate-600 uppercase text-center">
                Cant
              </th>
              <th className="w-24 px-2 py-2 text-[10px] font-black text-slate-600 uppercase text-right">
                Valor
              </th>
              <th className="w-24 px-3 py-2 text-[10px] font-black text-slate-600 uppercase text-right">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {itemsOCSeleccion.map((it) => (
              <tr
                key={it.id}
                className="hover:bg-slate-100/60 transition-colors"
              >
                <td className="px-3 py-2 text-center align-middle">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-emerald-500"
                    checked={it.checked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setItemsOCSeleccion((prev) =>
                        prev.map((row) =>
                          row.id === it.id ? { ...row, checked } : row
                        )
                      );
                    }}
                  />
                </td>
                <td className="px-2 py-2 text-center text-[11px] font-semibold text-slate-700">
                  {it.nro}
                </td>
                <td className="px-2 py-2 text-[11px] font-bold text-emerald-700">
                  {it.codigo}
                </td>
                <td className="px-2 py-2 text-[11px] font-medium text-slate-700 uppercase">
                  {it.descripcion}
                </td>
                <td className="px-2 py-2 text-center text-[10px] font-bold text-slate-700">
                  {it.um}
                </td>
                <td className="px-2 py-2 text-center text-[11px] font-semibold text-slate-700">
                  {it.cant}
                </td>
                <td className="px-2 py-2 text-right text-[11px] font-semibold text-slate-700">
                  {it.valor.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right text-[11px] font-black text-amber-400">
                  {it.total.toFixed(2)}
                </td>
              </tr>
            ))}

            {itemsOCSeleccion.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-[11px] text-slate-500"
                >
                  No hay ítems para esta orden de compra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="px-5 py-3 border-t border-slate-800 text-slate-200 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {itemsOCSeleccion.filter((x) => x.checked).length} ítem(s){" "}
          seleccionados de {itemsOCSeleccion.length}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 text-[11px] rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors"
            onClick={() => setOpenSeleccionOC(false)}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1.5 text-[11px] rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition-colors"
              onClick={() => {
                const seleccionados = itemsOCSeleccion.filter((it) => it.checked);
                setItems(seleccionados);

                // 🔥 aquí seteas la moneda definitivamente
                if (ordenSeleccionada) {
                  setForm((prev) => ({
                    ...prev,
                    moneda:
                      ordenSeleccionada.moneda === "D" ? "Dolares" : "Soles",
                  }));
                }

                setOpenSeleccionOC(false);
              }}
          >
            Aceptar selección
          </button>
        </div>
      </div>
    </div>
  </div>
)}




      </DialogContent>
    </Dialog>
  );
}
