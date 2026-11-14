"use client";

import { useCallback, useEffect, useState } from "react";

export interface LogbookEntry {
  id: string;
  studentName: string;
  studentNua: string;
  subject: string;
  room: string;
  date: string;
  notes: string;
}

const LOGBOOK_KEY = "beeteacher_tutor_logbook_v1";

const DEFAULT_LOGS: LogbookEntry[] = [
  {
    id: "log_initial_1",
    studentName: "Sofía Hernández",
    studentNua: "149102",
    subject: "Probabilidad",
    room: "Salón B102 (Tutor Par)",
    date: "2026-11-05",
    notes:
      "Repasamos distribución binomial, Poisson y normal estándar. Quedó lista para el segundo parcial.",
  },
];

export function useLogbook() {
  const [entries, setEntries] = useState<LogbookEntry[]>(DEFAULT_LOGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOGBOOK_KEY);
      if (raw) {
        setEntries(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Error loading logbook:", err);
    }
  }, []);

  const addEntry = useCallback(
    (entry: Omit<LogbookEntry, "id" | "date">) => {
      setEntries((prev) => {
        const next: LogbookEntry[] = [
          {
            ...entry,
            id: `log_${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ];
        try {
          localStorage.setItem(LOGBOOK_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(LOGBOOK_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const exportToTxt = useCallback(() => {
    const lines = entries.map(
      (item, idx) =>
        `${idx + 1}. [${item.date}] Alumno: ${item.studentName} (NUA: ${item.studentNua || "S/N"}) | Materia: #${item.subject} | Espacio: ${item.room}\n   Observaciones: ${item.notes}`,
    );
    const content = `BITÁCORA DE ASESORÍAS BEETEACHER (COMUNIDAD UG / TUTOR PAR)\n\n${lines.join("\n\n")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitacora_beeteacher_ug.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  return { entries, addEntry, removeEntry, exportToTxt };
}
