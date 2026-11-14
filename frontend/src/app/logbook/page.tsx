"use client";

import { BookMarked, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import { useLogbook } from "@/hooks/useLogbook";

export default function LogbookPage() {
  const { entries, addEntry, removeEntry, exportToTxt } = useLogbook();
  const [studentName, setStudentName] = useState("");
  const [studentNua, setStudentNua] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !subject.trim() || !notes.trim()) return;
    addEntry({
      studentName: studentName.trim(),
      studentNua: studentNua.trim(),
      subject: subject.trim(),
      room: room.trim() || "Salón DICIS",
      notes: notes.trim(),
    });
    setStudentName("");
    setStudentNua("");
    setSubject("");
    setRoom("");
    setNotes("");
  };

  return (
    <LayoutSection className="mt-4 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageHeader
          title="Bitácora de Asesorías (#TutorPar)"
          icon={BookMarked}
          count={entries.length}
          countLabel="sesiones registradas"
          className="flex-1"
        />
        <button
          type="button"
          onClick={exportToTxt}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Descargar Bitácora (.txt)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 space-y-3.5 h-fit"
        >
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-500">
            Registrar sesión impartida
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Nombre del Alumno *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ej. Sofía Hernández"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                NUA del Alumno (6 díg.)
              </label>
              <input
                type="text"
                maxLength={6}
                value={studentNua}
                onChange={(e) => setStudentNua(e.target.value)}
                placeholder="Ej. 149102"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Materia / Etiqueta *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Probabilidad"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Salón o Modalidad *
              </label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ej. Salón B102 (Tutor Par)"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Observaciones (máx. 500 caracteres) *
            </label>
            <textarea
              rows={3}
              maxLength={500}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Temas cubiertos y puntos a reforzar en la próxima asesoría..."
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider transition-colors"
          >
            Guardar en mi dispositivo
          </button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {entries.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.studentName}
                  </span>
                  {item.studentNua && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500">
                      NUA: {item.studentNua}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    #{item.subject}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  aria-label="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {item.room} · {item.date}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.notes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </LayoutSection>
  );
}
