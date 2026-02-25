import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ListFilter } from "lucide-react";

export const JiraPopover = ({ trigger, children, isOpen, setIsOpen }) => {
  const popoverRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* TRIGGER */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* FLOATING CONTENT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ zIndex: 100 }}
            className="absolute left-0 mt-2 w-[450px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden"
          >
            {/* Header del Popover */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                  Panel de Filtros Avanzados
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Contenido (Tu FilterCard) */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {children}
            </div>

            {/* Footer Estilo Jira */}
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[9px] text-slate-400 italic font-medium">
                V&C Enterprise System • 2024
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};