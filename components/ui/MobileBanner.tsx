"use client";

import { useState, useEffect } from "react";
import { X, MonitorSmartphone } from "lucide-react";

const STORAGE_KEY = "ns_mobile_banner_dismissed";

export function MobileBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
      <div className="pointer-events-auto bg-ns-black text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <MonitorSmartphone className="w-5 h-5 text-ns-blue shrink-0" strokeWidth={1.5} />
        <p className="flex-1 text-xs font-sans text-white/70 leading-snug">
          NeuralSpace est optimisé pour desktop.<br />
          <span className="text-white/40">L&apos;expérience mobile arrive bientôt.</span>
        </p>
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
