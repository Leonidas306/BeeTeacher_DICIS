"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayOfWeek } from "@/backend/types";
import { timeToMinutes } from "@/backend/utils";

export type AgendaCategory = "CLASE_UG" | "ASESORIA" | "EXAMEN" | "PERSONAL";

export type AgendaColor =
  | "amber"
  | "emerald"
  | "indigo"
  | "rose"
  | "cyan"
  | "violet"
  | "orange"
  | "slate";

export interface AgendaEvent {
  id: string;
  title: string;
  category: AgendaCategory;
  day: DayOfWeek;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  room?: string;
  person?: string; // Profesor, Tutor o Alumno
  notes?: string;
  color: AgendaColor;
  isRecurringSemester: boolean; // true = Materia fija de todo el semestre; false = Evento solo de esta semana
}

const AGENDA_STORAGE_KEY = "beeteacher_user_agenda_v1";

const DEFAULT_EVENTS: AgendaEvent[] = [
  {
    id: "ag_init_1",
    title: "Cálculo Integral",
    category: "CLASE_UG",
    day: "MONDAY",
    start: "08:00",
    end: "10:00",
    room: "Salón 101",
    person: "Clase Semestral UG",
    notes: "Materia fija del semestre",
    color: "indigo",
    isRecurringSemester: true,
  },
  {
    id: "ag_init_2",
    title: "Termodinámica",
    category: "CLASE_UG",
    day: "WEDNESDAY",
    start: "10:00",
    end: "12:00",
    room: "Salón B202",
    person: "Clase Semestral UG",
    notes: "Traer tablas termodinámicas",
    color: "cyan",
    isRecurringSemester: true,
  },
  {
    id: "ag_init_3",
    title: "Asesoría de Probabilidad",
    category: "ASESORIA",
    day: "WEDNESDAY",
    start: "12:00",
    end: "14:00",
    room: "Salón B102",
    person: "Juan Leonardo Rivera",
    notes: "Repaso de variables aleatorias acordado por WhatsApp",
    color: "amber",
    isRecurringSemester: false,
  },
];

export function useAgenda() {
  const [events, setEvents] = useState<AgendaEvent[]>(DEFAULT_EVENTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AGENDA_STORAGE_KEY);
      if (raw) {
        setEvents(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Error loading agenda:", err);
    }
  }, []);

  const saveEvents = useCallback((next: AgendaEvent[]) => {
    setEvents(next);
    try {
      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("beeteacher-agenda-updated"));
    } catch {}
  }, []);

  useEffect(() => {
    const syncListener = () => {
      try {
        const raw = localStorage.getItem(AGENDA_STORAGE_KEY);
        if (raw) setEvents(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener("beeteacher-agenda-updated", syncListener);
    window.addEventListener("storage", syncListener);
    return () => {
      window.removeEventListener("beeteacher-agenda-updated", syncListener);
      window.removeEventListener("storage", syncListener);
    };
  }, []);

  const addEvent = useCallback(
    (newEvent: Omit<AgendaEvent, "id">) => {
      const created: AgendaEvent = {
        ...newEvent,
        id: `ag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };
      saveEvents([...events, created]);
      return created;
    },
    [events, saveEvents],
  );

  const updateEvent = useCallback(
    (id: string, updated: Omit<AgendaEvent, "id">) => {
      saveEvents(events.map((ev) => (ev.id === id ? { ...updated, id } : ev)));
    },
    [events, saveEvents],
  );

  const removeEvent = useCallback(
    (id: string) => {
      saveEvents(events.filter((ev) => ev.id !== id));
    },
    [events, saveEvents],
  );

  const clearTemporaryWeekEvents = useCallback(() => {
    saveEvents(events.filter((ev) => ev.isRecurringSemester));
  }, [events, saveEvents]);

  /**
   * Busca si un bloque (day, start, end) choca con algún evento ya registrado en Mi Agenda.
   */
  const findConflicts = useCallback(
    (day: DayOfWeek, start: string, end: string, ignoreEventId?: string): AgendaEvent[] => {
      const startMin = timeToMinutes(start);
      const endMin = timeToMinutes(end);
      return events.filter((ev) => {
        if (ev.id === ignoreEventId || ev.day !== day) return false;
        const evStart = timeToMinutes(ev.start);
        const evEnd = timeToMinutes(ev.end);
        return Math.max(startMin, evStart) < Math.min(endMin, evEnd);
      });
    },
    [events],
  );

  const exportAgendaJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi_agenda_beeteacher.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const importAgendaJson = useCallback(
    (jsonText: string): boolean => {
      try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) {
          saveEvents(parsed);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [saveEvents],
  );

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    clearTemporaryWeekEvents,
    findConflicts,
    exportAgendaJson,
    importAgendaJson,
  };
}
