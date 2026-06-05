"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, UserPlus, Upload, ChevronDown } from "lucide-react";
import { createContributor } from "@/lib/actions/contributors";
import type { ContributorRef } from "@/lib/actions/contributors";

export type { ContributorRef };

type Props = {
  contributors: ContributorRef[];
  onChange: (c: ContributorRef[]) => void;
  isSponsored: boolean;
  onSponsoredChange: (v: boolean) => void;
};

function Avatar({ c }: { c: ContributorRef }) {
  if (c.avatarUrl) {
    return (
      <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
        <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" sizes="28px" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-ns-blue/10 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-sans font-bold text-ns-blue">
        {c.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function ContributorPicker({ contributors, onChange, isSponsored, onSponsoredChange }: Props) {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<ContributorRef[]>([]);
  const [showDrop, setShowDrop]     = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [newName, setNewName]       = useState("");
  const [newRole, setNewRole]       = useState("");
  const [newInst, setNewInst]       = useState("");
  const [newAvatar, setNewAvatar]   = useState("");
  const [uploading, setUploading]   = useState(false);
  const [creating, setCreating]     = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const avatarRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); setShowDrop(false); return; }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/contributors?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as ContributorRef[];
      setResults(data.filter((r) => !contributors.some((c) => c.id === r.id)));
      setShowDrop(true);
    }, 280);
    return () => clearTimeout(timer.current);
  }, [query, contributors]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function add(c: ContributorRef) {
    if (contributors.some((x) => x.id === c.id)) return;
    onChange([...contributors, c]);
    setQuery(""); setShowDrop(false);
  }

  function remove(id: string) {
    onChange(contributors.filter((c) => c.id !== id));
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "neuralspace/contributors");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      setNewAvatar(url);
    }
    setUploading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const r = await createContributor({
      name: newName.trim(),
      role: newRole.trim() || null,
      institution: newInst.trim() || null,
      avatarUrl: newAvatar || null,
    });
    if (r.ok && r.contributor) {
      add(r.contributor);
      setShowNew(false);
      setNewName(""); setNewRole(""); setNewInst(""); setNewAvatar("");
    }
    setCreating(false);
  }

  const fieldCls = "w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors";

  return (
    <div className="space-y-3">
      {/* Added contributors */}
      {contributors.map((c) => (
        <div key={c.id} className="flex items-center gap-2 group/item">
          <Avatar c={c} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-sans font-semibold text-ns-black leading-tight truncate">{c.name}</p>
            {(c.role || c.institution) && (
              <p className="text-[10px] text-neutral-400 font-sans leading-tight truncate">
                {[c.role, c.institution].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(c.id)}
            className="opacity-0 group-hover/item:opacity-100 p-0.5 text-neutral-300 hover:text-red-400 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Search input */}
      <div className="relative" ref={dropRef}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un contributeur…"
          className={fieldCls}
        />
        {showDrop && results.length > 0 && (
          <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-neutral-100 rounded-xl shadow-xl py-1 max-h-48 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => add(r)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 transition-colors text-left"
              >
                <Avatar c={r} />
                <div className="min-w-0">
                  <p className="text-xs font-sans font-semibold text-ns-black truncate">{r.name}</p>
                  {r.role && <p className="text-[10px] text-neutral-400 font-sans truncate">{r.role}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
        {showDrop && results.length === 0 && query.trim() && (
          <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-neutral-100 rounded-xl shadow-xl py-3 px-3">
            <p className="text-[11px] text-neutral-400 font-sans">Aucun résultat pour « {query} »</p>
          </div>
        )}
      </div>

      {/* Nouveau contributeur toggle */}
      <button
        type="button"
        onClick={() => setShowNew((v) => !v)}
        className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-neutral-400 hover:text-ns-blue transition-colors"
      >
        <UserPlus className="w-3 h-3" />
        Nouveau contributeur
        <ChevronDown className={`w-3 h-3 transition-transform ${showNew ? "rotate-180" : ""}`} />
      </button>

      {showNew && (
        <div className="border border-neutral-100 rounded-2xl p-3 space-y-2 bg-neutral-50/50">
          {/* Avatar upload */}
          <div className="flex items-center gap-2">
            {newAvatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image src={newAvatar} alt="avatar" fill className="object-cover" sizes="40px" />
              </div>
            ) : (
              <div
                onClick={() => avatarRef.current?.click()}
                className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-200 flex items-center justify-center cursor-pointer hover:border-ns-blue transition-colors shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-neutral-300" />
              </div>
            )}
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom complet *"
              className={fieldCls}
            />
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </div>
          <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Rôle (ex: Astrophysicien, Journaliste…)" className={fieldCls} />
          <input value={newInst} onChange={(e) => setNewInst(e.target.value)} placeholder="Institution (optionnel)" className={fieldCls} />
          {uploading && <p className="text-[10px] text-neutral-400 font-sans">Upload en cours…</p>}
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="w-full py-1.5 rounded-xl bg-ns-blue text-white text-[11px] font-sans font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {creating ? "Création…" : "Créer et ajouter"}
          </button>
        </div>
      )}

      {/* Sponsored toggle */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
          Contenu sponsorisé
        </span>
        <button
          type="button"
          onClick={() => onSponsoredChange(!isSponsored)}
          className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 ${isSponsored ? "bg-ns-blue" : "bg-neutral-200"}`}
          style={{ height: "1.125rem" }}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isSponsored ? "translate-x-3.5" : "translate-x-0"}`}
            style={{ width: "0.875rem", height: "0.875rem" }}
          />
        </button>
      </div>
    </div>
  );
}
