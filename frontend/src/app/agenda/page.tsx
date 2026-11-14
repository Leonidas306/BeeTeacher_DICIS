"use client";

import {
  AlertTriangle,
  BookMarked,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Plus,
  Repeat,
  RotateCcw,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DayOfWeek } from "@/backend/types";
import {
  getMexicoCityDate,
  getTodayOfWeek,
  timeToMinutes,
} from "@/backend/utils";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import {
  type AgendaCategory,
  type AgendaColor,
  type AgendaEvent,
  useAgenda,
} from "@/hooks/useAgenda";
import { useLogbook } from "@/hooks/useLogbook";

const DAY_MAP: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
};

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 a 20:00

const TIME_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const totalMin = (8 + Math.floor(i / 2)) * 60 + (i % 2) * 30;
  const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const m = String(totalMin % 60).padStart(2, "0");
  return `${h}:${m}`;
});

const CATEGORY_CONFIG: Record<
  AgendaCategory,
  { label: string; badge: string }
> = {
  CLASE_UG: { label: "📚 Clase UG", badge: "Clase UG" },
  ASESORIA: { label: "🐝 Asesoría BeeTeacher", badge: "Asesoría" },
  EXAMEN: { label: "📝 Examen / Entrega", badge: "Examen" },
  PERSONAL: { label: "📌 Actividad Personal", badge: "Personal" },
};

const COLOR_STYLES: Record<
  AgendaColor,
  {
    name: string;
    dot: string;
    card: string;
    border: string;
  }
> = {
  amber: {
    name: "Miel",
    dot: "bg-amber-500",
    card: "bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200",
    border: "border-amber-400/60 dark:border-amber-500/40",
  },
  emerald: {
    name: "Esmeralda",
    dot: "bg-emerald-500",
    card: "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200",
    border: "border-emerald-400/60 dark:border-emerald-500/40",
  },
  indigo: {
    name: "Índigo",
    dot: "bg-indigo-500",
    card: "bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200",
    border: "border-indigo-400/60 dark:border-indigo-500/40",
  },
  rose: {
    name: "Rosa",
    dot: "bg-rose-500",
    card: "bg-rose-500/15 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200",
    border: "border-rose-400/60 dark:border-rose-500/40",
  },
  cyan: {
    name: "Cian",
    dot: "bg-cyan-500",
    card: "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200",
    border: "border-cyan-400/60 dark:border-cyan-500/40",
  },
  violet: {
    name: "Violeta",
    dot: "bg-violet-500",
    card: "bg-violet-500/15 dark:bg-violet-500/20 text-violet-900 dark:text-violet-200",
    border: "border-violet-400/60 dark:border-violet-500/40",
  },
  orange: {
    name: "Naranja",
    dot: "bg-orange-500",
    card: "bg-orange-500/15 dark:bg-orange-500/20 text-orange-900 dark:text-orange-200",
    border: "border-orange-400/60 dark:border-orange-500/40",
  },
  slate: {
    name: "Pizarra",
    dot: "bg-slate-500",
    card: "bg-slate-500/15 dark:bg-slate-500/25 text-slate-900 dark:text-slate-200",
    border: "border-slate-400/60 dark:border-slate-500/40",
  },
};

function getPositionedDayEvents(
  dayEvents: AgendaEvent[],
): Array<AgendaEvent & { width: string; left: string }> {
  if (dayEvents.length === 0) return [];
  const sorted = [...dayEvents].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );
  const positioned: Array<AgendaEvent & { width: string; left: string }> = [];
  let columns: AgendaEvent[][] = [];
  let lastEnding: number | null = null;

  const flush = (cols: AgendaEvent[][]) => {
    const n = cols.length;
    cols.forEach((col, colIdx) => {
      col.forEach((ev) => {
        positioned.push({
          ...ev,
          width: `calc(${100 / n}% - 4px)`,
          left: `calc(${(100 / n) * colIdx}% + 2px)`,
        });
      });
    });
  };

  for (const ev of sorted) {
    const start = timeToMinutes(ev.start);
    const end = timeToMinutes(ev.end);

    if (lastEnding !== null && start >= lastEnding) {
      flush(columns);
      columns = [];
      lastEnding = null;
    }

    let placed = false;
    for (const col of columns) {
      const lastInCol = col[col.length - 1];
      if (timeToMinutes(lastInCol.end) <= start) {
        col.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([ev]);
    if (lastEnding === null || end > lastEnding) lastEnding = end;
  }

  if (columns.length > 0) flush(columns);
  return positioned;
}

export default function AgendaPage() {
  const {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    clearTemporaryWeekEvents,
    findConflicts,
    exportAgendaJson,
    importAgendaJson,
  } = useAgenda();
  const { addEntry: addLogbookEntry } = useLogbook();

  const [viewMode, setViewMode] = useState<"week" | "today">("week");
  const [currentTime, setCurrentTime] = useState(() => getMexicoCityDate());
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario para agregar/editar bloques
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AgendaCategory>("CLASE_UG");
  const [isRecurringSemester, setIsRecurringSemester] = useState(true);
  const [day, setDay] = useState<DayOfWeek>("MONDAY");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("12:00");
  const [room, setRoom] = useState("");
  const [person, setPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<AgendaColor>("indigo");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getMexicoCityDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentDay = getTodayOfWeek();
  const currentDecimalHour =
    currentTime.getHours() + currentTime.getMinutes() / 60;
  const isCurrentTimeVisible =
    currentDecimalHour >= 8 && currentDecimalHour <= 20;
  const currentTimeTop = (currentDecimalHour - 8) * 56;

  const liveConflicts = useMemo(() => {
    if (timeToMinutes(end) <= timeToMinutes(start)) return [];
    return findConflicts(day, start, end, editingId ?? undefined);
  }, [day, start, end, editingId, findConflicts]);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("CLASE_UG");
    setIsRecurringSemester(true);
    setDay("MONDAY");
    setStart("10:00");
    setEnd("12:00");
    setRoom("");
    setPerson("");
    setNotes("");
    setColor("indigo");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (timeToMinutes(end) <= timeToMinutes(start)) {
      showNotice("⚠️ La hora de término debe ser posterior a la hora de inicio.");
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      day,
      start,
      end,
      room: room.trim(),
      person: person.trim(),
      notes: notes.trim(),
      color,
      isRecurringSemester,
    };

    if (editingId) {
      updateEvent(editingId, payload);
      showNotice("✔ Evento actualizado en tu agenda.");
    } else {
      addEvent(payload);
      showNotice(
        isRecurringSemester
          ? "🔁 Materia fija del semestre agregada a todas tus semanas."
          : "📅 Evento de esta semana agregado a tu horario.",
      );
    }
    resetForm();
  };

  const handleEditClick = (ev: AgendaEvent) => {
    setSelectedEvent(null);
    setEditingId(ev.id);
    setTitle(ev.title);
    setCategory(ev.category);
    setIsRecurringSemester(ev.isRecurringSemester);
    setDay(ev.day);
    setStart(ev.start);
    setEnd(ev.end);
    setRoom(ev.room || "");
    setPerson(ev.person || "");
    setNotes(ev.notes || "");
    setColor(ev.color);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendToLogbook = (ev: AgendaEvent) => {
    addLogbookEntry({
      studentName: ev.person || "Alumno / Tutor",
      studentNua: "",
      subject: ev.title,
      room: ev.room || "Salón DICIS",
      notes:
        ev.notes ||
        `Sesión registrada desde Mi Agenda (${DAY_MAP[ev.day]} ${ev.start}-${ev.end}).`,
    });
    setSelectedEvent(null);
    showNotice("🐝 Sesión enviada automáticamente a Mi Bitácora.");
  };

  const semesterCount = events.filter((e) => e.isRecurringSemester).length;
  const weekEventsCount = events.filter((e) => !e.isRecurringSemester).length;

  return (
    <LayoutSection className="mt-4 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Mi Agenda Semanal (Clases y Asesorías)"
          icon={CalendarDays}
          count={events.length}
          countLabel="bloques en tu horario"
          className="flex-1"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportAgendaJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Respaldar
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              file.text().then((txt) => {
                if (importAgendaJson(txt)) {
                  showNotice("✔ Agenda restaurada correctamente.");
                } else {
                  showNotice("⚠️ El archivo JSON no tiene un formato válido.");
                }
              });
            }}
          />
          {weekEventsCount > 0 && (
            <button
              type="button"
              onClick={() => {
                clearTemporaryWeekEvents();
                showNotice(
                  "🔁 Se limpiaron los eventos temporales conservando tus materias fijas del semestre.",
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Iniciar Nueva Semana
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-amber-500 hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORMULARIO LATERAL PARA AGREGAR MATERIAS DEL SEMESTRE O EVENTOS DE LA SEMANA */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-white/10 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {editingId ? "Editar bloque de horario" : "Agregar a Mi Agenda"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[10px] font-bold uppercase text-rose-500 hover:underline"
              >
                Cancelar edición
              </button>
            )}
          </div>

          {/* Selector: Materia Fija del Semestre vs Evento de esta Semana */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/5">
            <button
              type="button"
              onClick={() => {
                setIsRecurringSemester(true);
                setCategory("CLASE_UG");
                setColor("indigo");
              }}
              className={`py-2 px-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                isRecurringSemester
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Fijo del Semestre
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRecurringSemester(false);
                setCategory("ASESORIA");
                setColor("amber");
              }}
              className={`py-2 px-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                !isRecurringSemester
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Solo esta Semana
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Nombre de la Materia o Evento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isRecurringSemester
                  ? "Ej. Cálculo Integral, Control Discreto..."
                  : "Ej. Asesoría de Probabilidad, Examen..."
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-medium outline-none border border-transparent focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AgendaCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold outline-none"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Día de la semana *
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold outline-none"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_MAP[d]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Hora de inicio *
              </label>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold outline-none"
              >
                {TIME_OPTIONS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Hora de fin *
              </label>
              <select
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold outline-none"
              >
                {TIME_OPTIONS.slice(1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detector en vivo si choca con otra clase tuya */}
          {liveConflicts.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Se cruza con{" "}
                <strong>
                  {liveConflicts.map((c) => c.title).join(", ")}
                </strong>{" "}
                (ambos se mostrarán lado a lado en tu calendario).
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Salón / Aula (Opcional)
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ej. B102, 101, Virtual"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Profesor / Tutor / Alumno
              </label>
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="Ej. Dr. Hernández / Juan"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
              />
            </div>
          </div>

          {/* Paleta de 8 Colores */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              Color del bloque en tu agenda
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(COLOR_STYLES) as AgendaColor[]).map((cKey) => {
                const style = COLOR_STYLES[cKey];
                const isSelected = color === cKey;
                return (
                  <button
                    type="button"
                    key={cKey}
                    onClick={() => setColor(cKey)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white scale-[1.03]"
                        : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className="truncate">{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Notas o recordatorio (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Llevar calculadora, repasar tema 3..."
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            {editingId
              ? "Guardar Cambios"
              : isRecurringSemester
                ? "Guardar Materia Fija del Semestre"
                : "Agregar Evento de esta Semana"}
          </button>
        </form>

        {/* CALENDARIO VISUAL SEMANAL Y VISTA DE HOY */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0D1322] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                  viewMode === "week"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semana Completa
              </button>
              <button
                type="button"
                onClick={() => setViewMode("today")}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                  viewMode === "today"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Solo Hoy ({DAY_MAP[currentDay] ?? "Hoy"})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                <strong>{semesterCount}</strong> fijas del semestre
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                <strong>{weekEventsCount}</strong> de esta semana
              </span>
            </div>
          </div>

          {viewMode === "week" ? (
            <div className="overflow-x-auto pb-2 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1322] shadow-sm">
              <div className="min-w-[760px]">
                {/* Encabezado de días */}
                <div className="flex ml-14 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className={`flex-1 py-3 text-center border-l border-slate-200 dark:border-white/10 first:border-l-0 text-[11px] font-extrabold uppercase tracking-wider ${
                        d === currentDay
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {DAY_MAP[d]}
                      {d === currentDay && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500 text-slate-950">
                          Hoy
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cuadrícula de 08:00 a 20:00 (12 horas * 56px = 672px) */}
                <div className="relative flex h-[672px] overflow-hidden">
                  {/* Columna de horas */}
                  <div className="w-14 shrink-0 flex flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.01]">
                    {HOURS.slice(0, -1).map((hour) => (
                      <div
                        key={hour}
                        className="relative flex-1 border-b border-slate-200/70 dark:border-white/5 last:border-b-0"
                      >
                        <span className="absolute right-2 top-1.5 text-[9px] font-bold text-slate-400">
                          {String(hour).padStart(2, "0")}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Columnas de días y bloques */}
                  <div className="flex-1 relative flex">
                    {/* Líneas horizontales */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                      {HOURS.slice(0, -1).map((hour) => (
                        <div
                          key={hour}
                          className="flex-1 border-b border-slate-100 dark:border-white/5 last:border-b-0"
                        />
                      ))}
                    </div>

                    {/* Línea de la hora actual en vivo */}
                    {isCurrentTimeVisible && (
                      <div
                        className="pointer-events-none absolute left-0 right-0 z-30 h-[2px] bg-rose-500"
                        style={{ top: `${currentTimeTop}px` }}
                      >
                        <div className="absolute -top-1 left-0 h-2.5 w-2.5 rounded-full bg-rose-500 shadow" />
                      </div>
                    )}

                    {DAYS.map((d) => {
                      const dayEvs = getPositionedDayEvents(
                        events.filter((ev) => ev.day === d),
                      );
                      return (
                        <div
                          key={d}
                          className={`flex-1 relative border-l border-slate-100 dark:border-white/5 first:border-l-0 ${
                            d === currentDay ? "bg-amber-500/[0.025]" : ""
                          }`}
                        >
                          {dayEvs.map((ev) => {
                            const startDec = timeToMinutes(ev.start) / 60;
                            const endDec = timeToMinutes(ev.end) / 60;
                            const top = (startDec - 8) * 56;
                            const height = Math.max(
                              (endDec - startDec) * 56,
                              28,
                            );
                            const cStyle =
                              COLOR_STYLES[ev.color] ?? COLOR_STYLES.amber;

                            return (
                              <button
                                type="button"
                                key={ev.id}
                                onClick={() => setSelectedEvent(ev)}
                                style={{
                                  top: `${top}px`,
                                  height: `${height - 2}px`,
                                  width: ev.width,
                                  left: ev.left,
                                  marginTop: "1px",
                                }}
                                className={`group absolute z-10 flex flex-col overflow-hidden rounded-xl border p-2 text-left text-xs leading-tight shadow-sm hover:z-20 hover:scale-[1.02] transition-all cursor-pointer ${cStyle.card} ${cStyle.border}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-extrabold uppercase text-[10px] line-clamp-1">
                                    {ev.title}
                                  </span>
                                  {ev.isRecurringSemester && (
                                    <Repeat
                                      className="w-3 h-3 shrink-0 opacity-75"
                                      title="Materia fija del semestre"
                                    />
                                  )}
                                </div>
                                {ev.room && (
                                  <span className="text-[9px] font-semibold opacity-90 truncate mt-0.5">
                                    📍 {ev.room}
                                  </span>
                                )}
                                <span className="mt-auto text-[9px] font-bold opacity-80">
                                  {ev.start} - {ev.end}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VISTA DE HOY */
            <div className="space-y-3">
              {events
                .filter((ev) => ev.day === currentDay)
                .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                .map((ev) => {
                  const cStyle = COLOR_STYLES[ev.color] ?? COLOR_STYLES.amber;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5 ${cStyle.card} ${cStyle.border}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold uppercase">
                            {ev.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                            {CATEGORY_CONFIG[ev.category]?.badge}
                          </span>
                          {ev.isRecurringSemester && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                              🔁 Semestral
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-90">
                          {ev.room ? `📍 ${ev.room}` : "Sin aula asignada"}{" "}
                          {ev.person ? `· 👤 ${ev.person}` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black">
                          {ev.start} - {ev.end}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {events.filter((ev) => ev.day === currentDay).length === 0 && (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1322]">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No tienes bloques programados para{" "}
                    {DAY_MAP[currentDay] ?? "hoy"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DEL BLOQUE SELECCIONADO (Con botón "Pasar a Mi Bitácora", Editar y Eliminar) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedEvent(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0D1322] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  {CATEGORY_CONFIG[selectedEvent.category]?.label} ·{" "}
                  {selectedEvent.isRecurringSemester
                    ? "🔁 Fijo del Semestre"
                    : "📅 Evento de la Semana"}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 py-3 border-y border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-bold">
                  {DAY_MAP[selectedEvent.day]} · {selectedEvent.start} a{" "}
                  {selectedEvent.end}
                </span>
              </div>
              {selectedEvent.room && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Espacio / Aula: {selectedEvent.room}</span>
                </div>
              )}
              {selectedEvent.person && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Profesor / Tutor / Alumno: {selectedEvent.person}</span>
                </div>
              )}
              {selectedEvent.notes && (
                <p className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs">
                  {selectedEvent.notes}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleSendToLogbook(selectedEvent)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <BookMarked className="w-4 h-4" />
                ✔ Pasar sesión a Mi Bitácora
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleEditClick(selectedEvent)}
                  className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Editar bloque
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeEvent(selectedEvent.id);
                    setSelectedEvent(null);
                    showNotice("🗑️ Bloque eliminado de tu agenda.");
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutSection>
  );
}
