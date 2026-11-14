"""
Script sincronizador de BeeTeacher:
Ya incluye preconfiguradas tus 3 URLs reales de Google Sheets (.csv)
para Tutores_DICIS, Tutores_Externos y Comentarios.
"""

import csv
import io
import json
import logging
import os
import re
import urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

DEFAULT_DICIS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ1dtPdjG1fLpE_aVzKmbW2qiWzJl1IcMqjYcWc5hJGnTw3uNUCj3FG8b30xjhWBZ32vOYTS2wRGRN/pub?gid=1902917026&single=true&output=csv"
DEFAULT_EXTERNOS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ1dtPdjG1fLpE_aVzKmbW2qiWzJl1IcMqjYcWc5hJGnTw3uNUCj3FG8b30xjhWBZ32vOYTS2wRGRN/pub?gid=1158175325&single=true&output=csv"
DEFAULT_REVIEWS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ1dtPdjG1fLpE_aVzKmbW2qiWzJl1IcMqjYcWc5hJGnTw3uNUCj3FG8b30xjhWBZ32vOYTS2wRGRN/pub?gid=1285429493&single=true&output=csv"

DAY_MAPPING = {
  "lunes": "MONDAY",
  "martes": "TUESDAY",
  "miercoles": "WEDNESDAY",
  "miércoles": "WEDNESDAY",
  "jueves": "THURSDAY",
  "viernes": "FRIDAY",
  "sabado": "SATURDAY",
  "sábado": "SATURDAY",
}


def drive_url_to_direct_image(url: str) -> str:
  if not url or not url.strip():
    return ""
  match = re.search(r"(?:id=|/d/)([a-zA-Z0-9_-]{15,})", url)
  if match:
    return f"https://lh3.googleusercontent.com/d/{match.group(1)}"
  return url.strip()


def find_field(row: dict, keywords: list[str], exclude: list[str] | None = None) -> str:
  exclude = exclude or []
  for k, v in row.items():
    if not k:
      continue
    kl = k.lower()
    if any(kw in kl for kw in keywords) and not any(ex in kl for ex in exclude):
      return (v or "").strip()
  return ""


def extract_tags(row: dict) -> list[str]:
  tags = []
  for k, v in row.items():
    if not k or not v:
      continue
    kl = k.lower()
    if "etiqueta" in kl or "materia" in kl:
      for part in v.split(","):
        cleaned = part.strip().lstrip("#").strip()
        if cleaned and cleaned not in tags:
          tags.append(cleaned)
  return tags or ["Cálculo"]


def extract_schedules(row: dict) -> list[dict]:
  schedules = []
  for col_name, cell_val in row.items():
    if not col_name or not cell_val:
      continue
    col_lower = col_name.lower()
    for day_es, day_en in DAY_MAPPING.items():
      if f"[{day_es}]" in col_lower or col_lower.endswith(day_es):
        for block in cell_val.split(","):
          times = re.findall(r"\d{1,2}:\d{2}", block)
          if len(times) >= 2:
            schedules.append({
              "day": day_en,
              "start": times[0].zfill(5),
              "end": times[1].zfill(5),
            })
        break
  return schedules or [{"day": "WEDNESDAY", "start": "12:00", "end": "14:00"}]


def fetch_csv_rows(csv_url: str) -> list[dict]:
  if not csv_url:
    return []
  req = urllib.request.Request(csv_url, headers={"User-Agent": "BeeTeacher-Sync/1.0"})
  with urllib.request.urlopen(req, timeout=20) as resp:
    content = resp.read().decode("utf-8")
    return list(csv.DictReader(io.StringIO(content)))


def sync_google_sheets(
  dicis_csv_url: str,
  externos_csv_url: str,
  reviews_csv_url: str,
  output_json_path: str,
):
  seen_ids = set()
  tutors_by_id = {}

  # 1. Tutores DICIS / Tutor Par
  for row in fetch_csv_rows(dicis_csv_url):
    nua = re.sub(r"\D", "", find_field(row, ["nua"]))
    if len(nua) != 6:
      continue
    if nua in seen_ids:
      logging.warning(f"NUA duplicado bloqueado: {nua}")
      continue
    seen_ids.add(nua)

    full_name = find_field(row, ["nombre"])
    if not full_name:
      continue

    tp_raw = find_field(row, ["tutor par", "pares", "beca"]).lower()
    is_tutor_par = "sí" in tp_raw or "si" in tp_raw or "tutorpar" in tp_raw

    mod_raw = find_field(row, ["modalidad"]).upper()
    modalities = []
    if "PRESENCIAL" in mod_raw:
      modalities.append("PRESENCIAL")
    if "VIRTUAL" in mod_raw or "LÍNEA" in mod_raw or "LINEA" in mod_raw:
      modalities.append("VIRTUAL")
    if not modalities:
      modalities = ["PRESENCIAL"]

    p30_str = find_field(row, ["30"])
    p60_str = find_field(row, ["1 hora", "hora"], ["30", "horario", "condicion", "nota"])

    tutors_by_id[nua] = {
      "id": nua,
      "fullName": full_name,
      "career": find_field(row, ["carrera", "programa"]) or "Ingeniería DICIS",
      "semester": find_field(row, ["semestre", "rol"]) or "Comunidad UG",
      "communityTag": "DICIS",
      "isExternal": False,
      "isTutorPar": is_tutor_par,
      "verified": True,
      "modalities": modalities,
      "headquarters": "Salamanca",
      "whatsapp": re.sub(r"\D", "", find_field(row, ["whatsapp", "tel", "celular"]))[-10:],
      "price30": int(float(p30_str or 0)),
      "price60": int(float(p60_str or 0)),
      "tutorParNote": find_field(row, ["nota", "aclaración", "aclaracion", "condicion"]),
      "subjectTags": extract_tags(row),
      "bio": find_field(row, ["sobre", "descripción", "descripcion"]),
      "avatarUrl": drive_url_to_direct_image(find_field(row, ["perfil"])),
      "coverUrl": drive_url_to_direct_image(find_field(row, ["portada", "fondo", "facebook"])),
      "coverGradient": "from-indigo-600 via-emerald-600 to-teal-700" if is_tutor_par else "from-blue-700 via-indigo-700 to-slate-800",
      "schedules": extract_schedules(row),
      "reviews": [],
    }

  # 2. Tutores Externos
  for row in fetch_csv_rows(externos_csv_url):
    phone = re.sub(r"\D", "", find_field(row, ["whatsapp", "tel", "id"]))[-10:]
    if not phone:
      continue
    ext_id = f"EXT-{phone}"
    if ext_id in seen_ids:
      logging.warning(f"Externo duplicado bloqueado: {ext_id}")
      continue
    seen_ids.add(ext_id)

    full_name = find_field(row, ["nombre"])
    if not full_name:
      continue

    mod_raw = find_field(row, ["modalidad"]).upper()
    modalities = []
    if "PRESENCIAL" in mod_raw:
      modalities.append("PRESENCIAL")
    if "VIRTUAL" in mod_raw or "LÍNEA" in mod_raw or "LINEA" in mod_raw:
      modalities.append("VIRTUAL")
    if not modalities:
      modalities = ["VIRTUAL"]

    p30_str = find_field(row, ["30"])
    p60_str = find_field(row, ["1 hora", "hora"], ["30", "horario", "condicion", "nota"])

    tutors_by_id[ext_id] = {
      "id": ext_id,
      "fullName": full_name,
      "career": find_field(row, ["perfil", "profesional", "formación", "carrera"], ["foto"]) or "Asesor Independiente",
      "semester": "Asesor Externo",
      "communityTag": "Externo",
      "isExternal": True,
      "isTutorPar": False,
      "verified": True,
      "modalities": modalities,
      "headquarters": "Salamanca",
      "whatsapp": phone,
      "price30": int(float(p30_str or 0)),
      "price60": int(float(p60_str or 0)),
      "tutorParNote": find_field(row, ["nota", "aclaración", "aclaracion", "lugar"]),
      "subjectTags": extract_tags(row),
      "bio": find_field(row, ["sobre", "descripción", "descripcion"]),
      "avatarUrl": drive_url_to_direct_image(find_field(row, ["foto de perfil", "cuadrada"])),
      "coverUrl": drive_url_to_direct_image(find_field(row, ["portada", "fondo", "facebook"])),
      "coverGradient": "from-amber-600 via-orange-600 to-rose-700",
      "schedules": extract_schedules(row),
      "reviews": [],
    }

  # 3. Comentarios por NUA
  for idx, row in enumerate(fetch_csv_rows(reviews_csv_url)):
    vals = list(row.values())
    target_id = (find_field(row, ["id o nua", "nua del tutor", "id del tutor"]) or (vals[1] if len(vals) > 1 else "")).strip()
    if target_id not in tutors_by_id:
      continue
    student_nua = find_field(row, ["tu nua", "estudiante"]) or "000000"
    stars_str = find_field(row, ["calificación", "calificacion", "estrellas"]) or "5"
    try:
      stars = max(1, min(5, int(stars_str)))
    except ValueError:
      stars = 5
    comment = find_field(row, ["comentario", "reseña", "escribe"])
    if not comment:
      continue

    tutors_by_id[target_id]["reviews"].append({
      "id": f"rev_{idx + 1}",
      "studentNua": student_nua,
      "stars": stars,
      "subject": find_field(row, ["materia"]) or "Asesoría",
      "modality": "Verificada por NUA",
      "comment": comment,
      "date": (vals[0] if vals else "").split(" ")[0],
    })

  if not tutors_by_id:
    logging.info("La hoja de Google Sheets aún no tiene filas de tutores; se conserva el tutors.json actual.")
    return

  os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
  with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(list(tutors_by_id.values()), f, ensure_ascii=False, indent=2)
  logging.info(f"Sincronizados {len(tutors_by_id)} tutores en {output_json_path}")


if __name__ == "__main__":
  out_file = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend",
    "src",
    "data",
    "tutors.json",
  )
  sync_google_sheets(
    dicis_csv_url=os.environ.get("BEETEACHER_DICIS_CSV_URL", DEFAULT_DICIS_CSV),
    externos_csv_url=os.environ.get("BEETEACHER_EXTERNOS_CSV_URL", DEFAULT_EXTERNOS_CSV),
    reviews_csv_url=os.environ.get("BEETEACHER_REVIEWS_CSV_URL", DEFAULT_REVIEWS_CSV),
    output_json_path=out_file,
  )
