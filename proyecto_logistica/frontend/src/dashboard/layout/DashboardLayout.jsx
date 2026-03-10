// src/dashboard/layout/DashboardLayout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import logo from "@/assets/logo.png";
import api from "@/services/api"; // tu servicio de API
import "@/styles/Home.css"; // Tailwind global
import GlobalSearchModal from "../../components/global/GlobalSearchModal";
import GlobalNavbar from "./GlobalNavbar";

const SIDEBAR_ITEMS = [
  {
    section: "Movimientos",
    items: [
   // { to: "/dashboard/cotizaciones-home", label: "Cotizaciones Home", icon: FileText },
      { to: "/dashboard/entrada-almacen", label: "Entrada a Almacen", icon: FileText },
      //{ to: "/dashboard/cotizaciones", label: "Entrada a Almacen", icon: FileText },
      { to: "/dashboard/salida-almacen", label: "Salida a Almacen", icon: FileText },
      { to: "/dashboard/kardex", label: "Kardex", icon: FileText },
     // { to: "/dashboard/seguimiento-cotizaciones", label: "Seguimiento Cotizaciones", icon: BarChart2 },
    ],
  },
];

const NavSectionTitle = ({ title }) => (
  <div className="text-xs uppercase text-gray-400 font-semibold px-4 pt-6 pb-1">
    {title}
  </div>
);

const SidebarLink = ({ to, label, icon: Icon, collapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`relative group flex items-center gap-3 px-2 py-1.5 transition-all duration-200 text-sm
        ${isActive 
          ? "bg-cyan-50 text-cyan-700 font-semibold border-l-4 border-cyan-700 rounded-r-md" 
          : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 rounded-md mx-1"}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-4 px-2 py-1 rounded-md bg-slate-800 text-white text-[10px] opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-[100]">
          {label}
        </span>
      )}
    </NavLink>
  );
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // 🔹 Estado de usuario y carga
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔹 Traer usuario directamente desde el endpoint
  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const res = await api.get("usuario-actual/");
      setUser(res.data);
    } catch (err) {
      console.error("❌ Error al cargar usuario:", err.response?.data || err.message);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredSidebar = useMemo(() => SIDEBAR_ITEMS, []);

  // ================================
  // ⌨️ ATAJOS GLOBALES UI
  // ================================
  useEffect(() => {
    const openSearch = () => {
      console.log("🔎 DashboardLayout → abrir buscador global");
      // luego aquí abrirás el modal real
      // setOpenGlobalSearch(true);
    };

    window.addEventListener("pm:open-search", openSearch);

    return () => {
      window.removeEventListener("pm:open-search", openSearch);
    };
  }, []);

  // ==============
  // BUSCADOR
  // ==============
  const [openSearch, setOpenSearch] = useState(false);

  useEffect(() => {
    const open = () => setOpenSearch(true);
    const close = () => setOpenSearch(false);

    window.addEventListener("pm:open-search", open);
    window.addEventListener("pm:close-modal", close);

    return () => {
      window.removeEventListener("pm:open-search", open);
      window.removeEventListener("pm:close-modal", close);
    };
  }, []);

  return (
    <div className="flex h-screen bg-white font-sans text-[#172B4D] overflow-hidden">
      {/* Overlay Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* SIDEBAR ESTILO JIRA ACTUALIZADO */}
      <aside
        className={`bg-[#F4F5F7] flex flex-col transition-all duration-300 ease-in-out h-screen z-50 flex-shrink-0 overflow-hidden
          ${sidebarOpen 
            ? "w-64 border-r border-slate-200 translate-x-0 relative" 
            : "w-0 border-none -translate-x-full md:translate-x-0"
          }
          fixed md:relative
        `}
      >
        {/* Contenedor interno con ancho fijo para evitar que el texto se amontone al cerrar */}
        <div className="w-64 h-full flex flex-col overflow-hidden"> 
          
          {/* CABECERA: Logo y Texto centrados */}
          <div className="flex items-start justify-between py-6 px-4 shrink-0">
            {/* Contenedor dinámico para Logo + Texto */}
            <div className="flex flex-col items-center gap-3 flex-1 ml-6"> 
              {/* ml-6 compensa el espacio del botón de la derecha para que el centro sea real */}
              
              {/* Contenedor del Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={logo} 
                  alt="V&C" 
                  className="h-13 w-15 object-contain" 
                />
              </div>
              
              {/* Contenedor del Texto */}
              <div className="flex flex-col items-center overflow-hidden">
                <h2 className="text-sm font-bold text-[#172B4D] text-center leading-tight">
                  Gestión Comercial
                </h2>
              </div>
            </div>

            {/* BOTÓN DE CIERRE: Se queda en su esquina */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors shrink-0"
            >
              <PanelLeftClose size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto no-scrollbar shrink-0">
            {SIDEBAR_ITEMS.map((section) => (
              <div key={section.section} className="mb-4">
                <span className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  {section.section}
                </span>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <SidebarLink
                      key={item.to}
                      {...item}
                      collapsed={false}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* BOTÓN FINALIZAR SESIÓN */}
          <div className="p-3 border-t border-slate-200 bg-[#F4F5F7] shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-all duration-200 group/logout"
            >
              <LogOut size={18} className="group-hover/logout:translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Finalizar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO (DERECHA) */}
      {/* min-w-0 es vital para que flex-1 funcione con contenidos anchos (tablas) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header móvil (solo visible en pantallas pequeñas) */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600">
            <Menu size={20} />
          </button>
          <span className="text-xs font-bold text-[#0052CC]">V&C SYSTEM</span>
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {user?.nomb_cort_usu?.charAt(0) || "U"}
          </div>
        </div>

        {/* NAVBAR GLOBAL (Aquí es donde aparecerá el icono de abrir si sidebarOpen es false) */}
        <div className="shrink-0">
          <GlobalNavbar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            user={user} 
          />
        </div>

        {/* CONTENIDO DINÁMICO (Scroll independiente) */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>

      </div>

      <GlobalSearchModal open={openSearch} onClose={() => setOpenSearch(false)} />
    </div>
  );
}
