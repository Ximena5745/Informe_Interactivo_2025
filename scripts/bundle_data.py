"""
Lee los 10 XLSX y genera data-bundle.js con todos los datos incrustados.
El HTML lo carga como <script> normal (funciona en file:// sin CORS).
Ejecutar: python scripts/bundle_data.py
"""
from __future__ import annotations
import os, json, zipfile, xml.etree.ElementTree as ET, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

SOURCES = [
    ("config",     "config",      "config/config.xlsx"),
    ("navegacion", "navegacion",  "navegacion/navegacion.xlsx"),
    ("avance",     "avance",      "avance/avance.xlsx"),
    ("foda",       "foda",        "foda/foda.xlsx"),
    ("pestel",     "pestel",      "pestel/pestel.xlsx"),
    ("proyectos",  "proyectos",   "proyectos/proyectos.xlsx"),
    ("objetivos",  "objetivos",   "objetivos/objetivos.xlsx"),
    ("reportes",   "historial",   "reportes/reportes.xlsx"),
    ("unidades",   "unidades",    "unidades/unidades.xlsx"),
    ("sources",    "fuentes",     "sources/sources.xlsx"),
    ("proyectos_pmo",     "proyectos", "proyectos/centroDeProyectos_PMO_2026.xlsx"),
    ("cmi_estrategico",    "CMI Estrategico", "indicadores/CMI Estrategico.xlsx"),
    ("retos_unidades", "Unidad", "retos/Consolidado_Retos_PDI.xlsx"),
]


def read_xlsx(path: str, sheet_name: str) -> list[dict]:
    z = zipfile.ZipFile(path)

    # Find the correct sheet index by name
    sheet_idx = 1
    if sheet_name:
        try:
            wb_xml = z.read("xl/workbook.xml").decode("utf-8")
            matches = re.findall(r'<sheet\b[^>]*\bname="([^"]*)"', wb_xml)
            for i, name in enumerate(matches, 1):
                if name == sheet_name:
                    sheet_idx = i
                    break
        except KeyError:
            pass

    sh_xml = z.read(f"xl/worksheets/sheet{sheet_idx}.xml").decode("utf-8")

    # sharedStrings.xml may not exist if no string content
    strings = []
    try:
        ss_xml = z.read("xl/sharedStrings.xml").decode("utf-8")
        strings = [t.text or "" for t in ET.fromstring(ss_xml).iter(NS + "t")]
    except KeyError:
        pass

    z.close()
    root = ET.fromstring(sh_xml)

    def col_letter(ref: str) -> str:
        return "".join(ch for ch in ref if ch.isalpha())

    rows = []
    for row in root.iter(NS + "row"):
        cells = {}
        for c in row.iter(NS + "c"):
            ref = c.get("r")
            t = c.get("t")
            v = c.find(NS + "v")
            # Handle shared strings
            if v is not None:
                val = v.text
                if t == "s":
                    val = strings[int(val)]
                cells[col_letter(ref)] = val
            # Handle inline strings
            if t == "inlineStr":
                is_el = c.find(NS + "is")
                if is_el is not None:
                    t_el = is_el.find(NS + "t")
                    if t_el is not None and t_el.text is not None:
                        cells[col_letter(ref)] = t_el.text
        rows.append(cells)

    if not rows:
        return []

    headers = rows[0]
    def col_to_num(col_str):
        """Convert column letter(s) to number (A=0, B=1, ..., Z=25, AA=26, ...)"""
        n = 0
        for ch in col_str.upper():
            n = n * 26 + (ord(ch) - ord('A') + 1)
        return n - 1

    col_order = sorted(headers.keys(), key=lambda ch: col_to_num(ch))

    out = []
    for row in rows[1:]:
        if all(not row.get(c) for c in col_order):
            continue
        rec = {}
        for c in col_order:
            h = headers.get(c)
            if h:
                rec[h] = row.get(c, "")
        if rec:
            out.append(rec)
    return out


def main():
    data = {}
    for item in SOURCES:
        id_name = item[0]
        sheet = item[1]
        rel_path = item[2] if len(item) > 2 else f"{id_name}/{id_name}.xlsx"
        path = os.path.join(DATA, rel_path)
        if not os.path.isfile(path):
            print(f"  [SKIP] {id_name}: {path} no existe")
            continue
        rows = read_xlsx(path, sheet)
        data[id_name] = rows
        print(f"  [OK] {id_name}: {len(rows)} filas")

    out_path = os.path.join(ROOT, "data-bundle.js")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("// Auto-generado por scripts/bundle_data.py\n")
        f.write("// NO EDITAR - regenerar con: python scripts/bundle_data.py\n\n")
        f.write("window.PDI_DATA = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"\n  Escrito: {out_path} ({os.path.getsize(out_path)} bytes)")


if __name__ == "__main__":
    main()
