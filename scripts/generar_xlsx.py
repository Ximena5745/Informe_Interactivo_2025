"""
Genera los 10 libros XLSX de las fuentes del PDI 2025.
Usa solo la biblioteca estándar (zipfile + ElementTree) — sin openpyxl.
Ejecutar: python scripts/generar_xlsx.py
"""
from __future__ import annotations
import os
import zipfile
import xml.etree.ElementTree as ET
from html import escape as _esc
from typing import Any, Iterable, Sequence

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

# ────────────────────────────────────────────────────────────────────────────
# Utilidades XLSX (formato OOXML mínimo, sin estilos avanzados)
# ────────────────────────────────────────────────────────────────────────────

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
ET.register_namespace("", NS)


def col_letter(n: int) -> str:
    """1 -> A, 2 -> B, ..., 27 -> AA"""
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def cell_xml(col: int, row: int, value: Any, shared_strings: list) -> tuple[str, list]:
    """Genera XML de una celda. value puede ser str, int, float, bool, None."""
    if value is None or value == "":
        return "", shared_strings
    ref = f"{col_letter(col)}{row}"
    if isinstance(value, bool):
        return f'<c r="{ref}" t="b"><v>{1 if value else 0}</v></c>', shared_strings
    if isinstance(value, (int, float)):
        return f'<c r="{ref}"><v>{value}</v></c>', shared_strings
    # string → shared string
    try:
        idx = shared_strings.index(value)
    except ValueError:
        shared_strings.append(value)
        idx = len(shared_strings) - 1
    return f'<c r="{ref}" t="s"><v>{idx}</v></c>', shared_strings


def sheet_xml(rows: Sequence[Sequence[Any]]) -> str:
    shared_strings: list[str] = []
    cells: list[str] = []
    sheet_rows: list[str] = []
    last_row = 0
    for r_idx, row in enumerate(rows, start=1):
        last_row = r_idx
        row_cells = []
        for c_idx, val in enumerate(row, start=1):
            xml, shared_strings = cell_xml(c_idx, r_idx, val, shared_strings)
            if xml:
                row_cells.append(xml)
        sheet_rows.append(f'<row r="{r_idx}">' + "".join(row_cells) + "</row>")
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<worksheet xmlns="{NS}">'
        f'<sheetData>{"".join(sheet_rows)}</sheetData>'
        "</worksheet>"
    ), shared_strings


def shared_strings_xml(strings: list[str]) -> str:
    items = "".join(
        f"<si><t xml:space=\"preserve\">{_esc(s)}</t></si>" for s in strings
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<sst xmlns="{NS}" count="{len(strings)}" uniqueCount="{len(strings)}">'
        f"{items}</sst>"
    )


def workbook_xml(sheet_name: str) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<workbook xmlns="{NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f"<sheets><sheet name=\"{_esc(sheet_name)}\" sheetId=\"1\" r:id=\"rId1\"/></sheets>"
        "</workbook>"
    )


def workbook_rels() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
        "</Relationships>"
    )


def root_rels() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        "</Relationships>"
    )


def content_types() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
        "</Types>"
    )


def write_xlsx(path: str, sheet_name: str, rows: Sequence[Sequence[Any]]) -> None:
    """Escribe un .xlsx válido. rows[0] = encabezados, rows[1:] = datos."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sx, ss = sheet_xml(rows)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types())
        z.writestr("_rels/.rels", root_rels())
        z.writestr("xl/workbook.xml", workbook_xml(sheet_name))
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels())
        z.writestr("xl/worksheets/sheet1.xml", sx)
        z.writestr("xl/sharedStrings.xml", shared_strings_xml(ss))


# ────────────────────────────────────────────────────────────────────────────
# Definición de las 9 fuentes + sources registry
# ────────────────────────────────────────────────────────────────────────────

def _join_logros(*lists):
    out = []
    for lst in lists:
        out.extend(lst or [])
    return out


def build_config():
    # Una hoja "config" con: seccion, clave, valor
    return [
        ["seccion", "clave", "valor"],
        ["general", "tenant", "politecnico-grancolombiano"],
        ["general", "periodo", "2025"],
        ["general", "versionInforme", "1.0.0"],
        ["branding", "nombre", "Informe de Cierre PDI 2025"],
        ["branding", "subtitulo", "Planeación y Gestión Institucional"],
        ["branding", "logo", "./public/img/brand/logo-poli.jpg"],
        ["branding", "diagramaLineas", "./public/img/brand/lineas-estrategicas.jpg"],
        ["paleta", "navy", "#0F385A"],
        ["paleta", "cyan", "#1FB2DE"],
        ["paleta", "pink", "#EC0677"],
        ["paleta", "green", "#A6CE38"],
        ["paleta", "yellow", "#FBAF17"],
        ["paleta", "teal", "#15BECE"],
        ["paleta_navy_rol", "valor", "Marco institucional, Amenazas, headers"],
        ["paleta_cyan_rol", "valor", "Experiencia, acentos"],
        ["paleta_pink_rol", "valor", "Calidad, orgullosamente"],
        ["paleta_green_rol", "valor", "Sostenibilidad"],
        ["paleta_yellow_rol", "valor", "Expansión"],
        ["paleta_teal_rol", "valor", "Transformación organizacional"],
        ["tipografia", "familia", "Montserrat, system-ui, sans-serif"],
        ["tipografia", "pesos", "400,600,700,800,900"],
        ["tipografia", "fuente", "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap"],
        ["atajos_home", "valor", "h,H"],
        ["atajos_atras", "valor", "Escape"],
    ]


def build_navegacion():
    return [
        ["id", "titulo", "layout", "dataTitle", "colorHeader", "lineaId", "imagen", "origen"],
        ["home", "Inicio", "home", "Inicio", "#0F385A", "", "", "configuracion"],
        ["ciclo", "Ciclo de la Estrategia", "ciclo", "Ciclo de la Estrategia", "", "", "", "configuracion"],
        ["analisis", "Análisis del Contexto", "analisis", "Análisis del Contexto", "", "", "", "configuracion"],
        ["foda", "FODA Institucional 2025", "foda", "FODA Institucional", "", "", "", "foda"],
        ["pestel", "PESTEL Institucional 2025", "pestel", "PESTEL Institucional", "", "", "", "pestel"],
        ["avances", "Avance Líneas Estratégicas 2025", "avances", "Avance Líneas Estratégicas", "", "", "", "avance"],
        ["cal-avance", "Calidad", "linea", "Calidad", "#EC0677", "calidad", "", "avance"],
        ["edu-avance", "Educación para Toda la Vida", "linea", "Educación para Toda la Vida", "#0F385A", "educacion", "", "avance"],
        ["exp-avance", "Expansión", "linea", "Expansión", "#FBAF17", "expansion", "", "avance"],
        ["exp2-avance", "Experiencia", "linea", "Experiencia", "#1FB2DE", "experiencia", "", "avance"],
        ["to-avance", "Transformación Organizacional", "linea", "Transformación Organizacional", "#15BECE", "transformacion", "", "avance"],
        ["sos-avance", "Sostenibilidad", "linea", "Sostenibilidad", "#A6CE38", "sostenibilidad", "", "avance"],
        ["logros", "Logros por Línea Estratégica", "logros", "Logros por Línea Estratégica", "", "", "", "configuracion"],
        ["cal-logro", "Calidad – Logros 2025", "logro", "Calidad – Logros 2025", "#EC0677", "calidad", "./public/img/logros/GP051-_INFOGRAFIAS_CAP_12_CALIDAD_1.jpg", "logros"],
        ["exp-logro", "Expansión – Logros 2025", "logro", "Expansión – Logros 2025", "#FBAF17", "expansion", "./public/img/logros/GP051-_INFOGRAFIAS_CAP_12_EXPANSION.jpg", "logros"],
        ["edu-logro", "Educación para Toda la Vida – Logros 2025", "logro", "Educación para Toda la Vida – Logros 2025", "#0F385A", "educacion", "./public/img/logros/GP051-_INFOGRAFIAS_CAP_12_EDUVIDA.jpg", "logros"],
        ["exp2-logro", "Experiencia – Logros 2025", "logro", "Experiencia – Logros 2025", "#1FB2DE", "experiencia", "./public/img/logros/GP051-_INFOGRAFIAS_CAP_12_EXPERIENCIA.jpg", "logros"],
        ["to-logro", "Transformación Org. – Logros 2025", "logro", "Transformación Org. – Logros 2025", "#15BECE", "transformacion", "./public/img/logros/GP051-_INFOGRAFIAS_CAP_12_TRANSFORMACION_1.jpg", "logros"],
        ["sos-logro", "Sostenibilidad – Logros 2025", "logro", "Sostenibilidad – Logros 2025", "#A6CE38", "sostenibilidad", "./public/img/logros/GP051-_INFOGRAFIAS_CAP_12_SOSTENIBILIDAD_1.jpg", "logros"],
        ["planes", "Planes Anuales de Retos", "planes", "Planes Anuales de Retos", "", "", "", "configuracion"],
        ["reporte", "Reporte Anual Institucional", "reporte", "Reporte Anual Institucional", "", "", "", "reportes"],
        ["unidad", "Unidad – Área", "unidad", "Unidad – Área", "", "", "", "unidades"],
        ["lineas-est", "Líneas Estratégicas", "lineas-est", "Líneas Estratégicas", "", "", "", "avance"],
        ["objetivos", "Objetivos Estratégicos", "objetivos", "Objetivos Estratégicos", "", "", "", "objetivos"],
        ["proyectos", "Proyectos Estratégicos", "proyectos", "Proyectos Estratégicos", "", "", "", "proyectos"],
        ["balance", "Balance Institucional 2025", "balance", "Balance Institucional 2025", "", "", "", "configuracion"],
        ["orgullosamente", "Orgullosamente Poli", "orgullosamente", "Orgullosamente Poli", "", "", "", "configuracion"],
    ]


def build_avance():
    """Hoja 'avance': global por línea, con columna 'logros' como pipe-separated."""
    headers = ["id", "nombre", "color", "icono", "slideId", "logroSlideId", "slidePPT",
               "real", "esperado", "cumplimiento", "retos", "areas", "logros"]
    lineas = [
        ("calidad", "Calidad", "#EC0677", "rosa", "cal-avance", "cal-logro", "7/8", 99, 100, 99, 103, 45,
         ["Renovación de registros calificados y acreditaciones de alta calidad.",
          "Fortalecimiento del modelo de autoevaluación institucional.",
          "Implementación de planes de mejora continua por programa."]),
        ("educacion", "Educación para Toda la Vida", "#0F385A", "graduacion", "edu-avance", "edu-logro", "9/10", 95, 100, 95, 18, 14,
         ["Ampliación de la oferta de educación continua y lifelong learning.",
          "Alianzas estratégicas con el sector productivo.",
          "Diversificación de modalidades (virtual, híbrida, dual)."]),
        ("expansion", "Expansión", "#FBAF17", "mapa", "exp-avance", "exp-logro", "11/12", 95, 100, 95, 40, 23,
         ["Apertura de nuevas sedes y ampliación de cobertura regional.",
          "Fortalecimiento del modelo Poli Virtual a nivel nacional.",
          "Incremento de la población estudiantil en programas estratégicos."]),
        ("experiencia", "Experiencia", "#1FB2DE", "estrella", "exp2-avance", "exp2-logro", "13/14", 99, 100, 99, 108, 55,
         ["Mejora de los indicadores de experiencia del estudiante (NPS).",
          "Implementación del modelo de bienestar integral.",
          "Fortalecimiento de la ruta de acompañamiento y permanencia."]),
        ("transformacion", "Transformación Organizacional", "#15BECE", "engranaje", "to-avance", "to-logro", "15/16", 86, 100, 86, 63, 35,
         ["Evolución del modelo de gobierno institucional.",
          "Implementación de la cultura data-driven en la toma de decisiones.",
          "Modernización tecnológica de procesos administrativos."]),
        ("sostenibilidad", "Sostenibilidad", "#A6CE38", "hoja", "sos-avance", "sos-logro", "17/18", 89, 100, 89, 42, 29,
         ["Avances en el plan de descarbonización y eficiencia energética.",
          "Implementación de la estrategia ASG (Ambiental, Social, Gobernanza).",
          "Fortalecimiento de la gestión de riesgos y cumplimiento normativo."]),
    ]
    # Segunda hoja: global
    global_sheet = [
        ["clave", "valor"],
        ["fuente", "Kawak — Corte diciembre 2025"],
        ["cumplimiento", 94],
        ["retos", 374],
        ["areas", 201],
    ]
    return [
        ("avance", [headers] + [[lid, nom, col, icn, sid, lsid, sppt, r, e, c, ret, are, " | ".join(log)]
                                for (lid, nom, col, icn, sid, lsid, sppt, r, e, c, ret, are, log) in lineas]),
        ("global", global_sheet),
    ]


def build_foda():
    return [
        ["cuadrante", "orden", "item"],
        ["debilidades", 1, "Necesidad de fortalecer la cultura de datos para la toma de decisiones."],
        ["debilidades", 2, "Brechas en la transformación digital de algunos procesos administrativos."],
        ["debilidades", 3, "Dependencia de fuentes externas para la actualización curricular."],
        ["debilidades", 4, "Indicadores de permanencia por debajo de la meta en algunos programas."],
        ["debilidades", 5, "Articulación incipiente entre investigación, docencia y proyección social."],
        ["debilidades", 6, "Limitaciones de infraestructura física en algunas sedes."],
        ["debilidades", 7, "Necesidad de mayor apropiación del modelo educativo institucional."],
        ["oportunidades", 1, "Crecimiento de la demanda de educación superior en modalidades virtual e híbrida."],
        ["oportunidades", 2, "Alianzas con el sector productivo para programas duales y educación continua."],
        ["oportunidades", 3, "Aprovechamiento de la IA para personalización del aprendizaje."],
        ["oportunidades", 4, "Políticas nacionales de cierre de brechas y acceso (Generación E)."],
        ["oportunidades", 5, "Internacionalización del currículo y dobles titulaciones."],
        ["oportunidades", 6, "Expansión de los servicios de extensión y consultoría."],
        ["oportunidades", 7, "Nuevas líneas de financiación para sostenibilidad e infraestructura."],
        ["fortalezas", 1, "Marca institucional sólida y posicionamiento en educación virtual."],
        ["fortalezas", 2, "Modelo educativo flexible y centrado en el estudiante."],
        ["fortalezas", 3, "Equipo docente con experiencia y formación posgradual."],
        ["fortalezas", 4, "Portafolio amplio de programas en distintas modalidades."],
        ["fortalezas", 5, "Infraestructura tecnológica robusta para soportar la operación."],
        ["fortalezas", 6, "Cultura organizacional orientada al servicio y la mejora continua."],
        ["fortalezas", 7, "Capacidad demostrada de adaptación ante entornos cambiantes."],
        ["amenazas", 1, "Incertidumbre regulatoria por reformas a la educación superior."],
        ["amenazas", 2, "Competencia creciente de IES nacionales e internacionales."],
        ["amenazas", 3, "Presión inflacionaria sobre costos operativos y tarifas."],
        ["amenazas", 4, "Cambios demográficos que afectan la demanda tradicional."],
        ["amenazas", 5, "Riesgos de ciberseguridad y protección de datos."],
        ["amenazas", 6, "Vulnerabilidad ante eventos climáticos y de salud pública."],
        ["amenazas", 7, "Tensión en el financiamiento público para educación superior."],
    ]


def build_pestel():
    return [
        ["letra", "nombre", "color", "orden", "item"],
        ["P", "Político", "#0F385A", 1, "Reformas a la educación superior en curso."],
        ["P", "Político", "#0F385A", 2, "Plan Nacional de Desarrollo 2022-2026 con énfasis en cierre de brechas."],
        ["P", "Político", "#0F385A", 3, "Programa Generación E y políticas de acceso."],
        ["P", "Político", "#0F385A", 4, "Relación con el Ministerio de Educación Nacional y CESU."],
        ["P", "Político", "#0F385A", 5, "Lineamientos de acreditación de alta calidad."],
        ["P", "Político", "#0F385A", 6, "Acuerdo 01/2025 del CESU sobre reforma del modelo."],
        ["E", "Económico", "#1FB2DE", 1, "Comportamiento del PIB nacional y sectorial."],
        ["E", "Económico", "#1FB2DE", 2, "Tasas de inflación y presión sobre tarifas."],
        ["E", "Económico", "#1FB2DE", 3, "Indicadores de calidad de vida y empleabilidad (ICES)."],
        ["E", "Económico", "#1FB2DE", 4, "Tasa de desempleo e informalidad juvenil."],
        ["E", "Económico", "#1FB2DE", 5, "Acceso a crédito educativo (ICETEX, fondos)."],
        ["E", "Económico", "#1FB2DE", 6, "Inversión pública en CTI."],
        ["S", "Social", "#EC0677", 1, "Preferencia creciente por modalidades híbridas y virtuales."],
        ["S", "Social", "#EC0677", 2, "Salud mental y bienestar estudiantil."],
        ["S", "Social", "#EC0677", 3, "Cambios demográficos y expectativa de vida."],
        ["S", "Social", "#EC0677", 4, "Demanda de educación continua y lifelong learning."],
        ["S", "Social", "#EC0677", 5, "Diversidad e inclusión."],
        ["S", "Social", "#EC0677", 6, "Movimientos sociales y expectativas ciudadanas."],
        ["T", "Tecnológico", "#A6CE38", 1, "Conectividad y brecha digital regional."],
        ["T", "Tecnológico", "#A6CE38", 2, "Adopción de IA generativa en educación."],
        ["T", "Tecnológico", "#A6CE38", 3, "Plataformas LMS y analítica de aprendizaje."],
        ["T", "Tecnológico", "#A6CE38", 4, "Ciberseguridad y protección de datos personales."],
        ["T", "Tecnológico", "#A6CE38", 5, "Posicionamiento del Poli en rankings digitales."],
        ["T", "Tecnológico", "#A6CE38", 6, "Automatización de procesos administrativos."],
        ["E", "Ecológico", "#FBAF17", 1, "Compromisos COP16 y agenda de biodiversidad."],
        ["E", "Ecológico", "#FBAF17", 2, "Gestión de gases de efecto invernadero (GEI)."],
        ["E", "Ecológico", "#FBAF17", 3, "Ley 2232 de 2022 sobre plásticos de un solo uso."],
        ["E", "Ecológico", "#FBAF17", 4, "Eficiencia energética y descarbonización."],
        ["E", "Ecológico", "#FBAF17", 5, "Gestión de residuos y economía circular."],
        ["E", "Ecológico", "#FBAF17", 6, "Emergencias climáticas y su impacto en infraestructura."],
        ["L", "Legal", "#15BECE", 1, "Decreto 0529 de 2024 sobre calidad."],
        ["L", "Legal", "#15BECE", 2, "Decreto 1174 de 2023 sobre modalidades."],
        ["L", "Legal", "#15BECE", 3, "Decreto 0391 de 2025 sobre acreditación."],
        ["L", "Legal", "#15BECE", 4, "Acuerdo 01/2025 del CESU."],
        ["L", "Legal", "#15BECE", 5, "Reglamentación de Habeas Data (Ley 1581/2012)."],
        ["L", "Legal", "#15BECE", 6, "Normatividad sobre educación virtual y a distancia."],
    ]


def build_proyectos():
    return [
        ["id", "nombre", "linea", "avance", "unidad"],
        ["P-001", "Renovación de registros calificados", "calidad", 100, "Vicerrectoría Académica"],
        ["P-002", "Autoevaluación institucional continua", "calidad", 98, "Planeación y Gestión"],
        ["P-003", "Planes de mejora por programa", "calidad", 99, "Vicerrectoría Académica"],
        ["P-004", "Acreditación de alta calidad multicampus", "calidad", 96, "Calidad Académica"],
        ["P-010", "Educación continua corporativa", "educacion", 95, "Educación Continua"],
        ["P-011", "Alianzas sector productivo", "educacion", 92, "Proyección Social"],
        ["P-012", "Modalidad dual y microcredenciales", "educacion", 88, "Vicerrectoría Académica"],
        ["P-020", "Apertura de sede regional Sur", "expansion", 96, "Vicerrectoría Financiera"],
        ["P-021", "Consolidación Poli Virtual nacional", "expansion", 94, "Tecnología"],
        ["P-030", "Modelo de bienestar integral", "experiencia", 99, "Bienestar Universitario"],
        ["P-031", "Ruta de permanencia y graduación", "experiencia", 98, "Vicerrectoría de Estudiantes"],
        ["P-040", "Evolución del modelo de gobierno", "transformacion", 86, "Rectoría"],
        ["P-041", "Cultura data-driven y BI institucional", "transformacion", 84, "Tecnología"],
        ["P-042", "Modernización tecnológica administrativa", "transformacion", 88, "Tecnología"],
        ["P-050", "Plan de descarbonización institucional", "sostenibilidad", 90, "Gestión Ambiental"],
        ["P-051", "Estrategia ASG integral", "sostenibilidad", 88, "Planeación y Gestión"],
    ]


def build_objetivos():
    return [
        ["id", "nombre", "perspectiva", "meta", "real", "linea"],
        ["OE-01", "Consolidar el modelo de calidad académica", "Procesos internos", 100, 99, "calidad"],
        ["OE-02", "Fortalecer la acreditación institucional", "Procesos internos", 100, 100, "calidad"],
        ["OE-03", "Ampliar la oferta de educación continua", "Clientes/Mercado", 100, 95, "educacion"],
        ["OE-04", "Incrementar la cobertura regional", "Clientes/Mercado", 100, 95, "expansion"],
        ["OE-05", "Mejorar la experiencia del estudiante", "Clientes/Mercado", 100, 99, "experiencia"],
        ["OE-06", "Fortalecer la ruta de permanencia", "Aprendizaje", 100, 98, "experiencia"],
        ["OE-07", "Evolucionar el modelo de gobierno", "Procesos internos", 100, 86, "transformacion"],
        ["OE-08", "Adoptar cultura data-driven", "Aprendizaje", 100, 88, "transformacion"],
        ["OE-09", "Avanzar en descarbonización", "Financiera", 100, 89, "sostenibilidad"],
        ["OE-10", "Implementar la estrategia ASG", "Financiera", 100, 90, "sostenibilidad"],
        ["OE-11", "Modernizar la plataforma tecnológica", "Procesos internos", 100, 92, "transformacion"],
        ["OE-12", "Aumentar la internacionalización del currículo", "Aprendizaje", 100, 85, "educacion"],
    ]


def build_reportes():
    hist = [
        ["anio", "planes", "cumplimiento"],
        [2022, 33, 96],
        [2023, 55, 97],
        [2024, 83, 98],
    ]
    kpis = [
        ["clave", "valor"],
        ["anioActual", 2025],
        ["planes", 83],
        ["cumplimientoPromedio", 98],
        ["lineasEstrategicas", 6],
        ["objetivosEstrategicos", 12],
    ]
    return [("historial", hist), ("kpis", kpis)]


def build_unidades():
    return [
        ["id", "nombre", "vicerrectoria", "color"],
        ["RECT", "Rectoría", "", "#0F385A"],
        ["VACA", "Vicerrectoría Académica", "", "#EC0677"],
        ["VEST", "Vicerrectoría de Estudiantes", "", "#1FB2DE"],
        ["VFIN", "Vicerrectoría Financiera", "", "#FBAF17"],
        ["PLAG", "Planeación y Gestión Institucional", "", "#15BECE"],
        ["TI", "Tecnología e Información", "", "#A6CE38"],
        ["BIEN", "Bienestar Universitario", "VEST", "#1FB2DE"],
        ["CALE", "Calidad Académica", "VACA", "#EC0677"],
        ["EDCO", "Educación Continua", "VACA", "#0F385A"],
        ["GA", "Gestión Ambiental", "PLAG", "#A6CE38"],
    ]


def build_sources():
    """Registry de fuentes — debe coincidir con data/sources/sources.js"""
    return [
        ["id", "nombre", "archivo", "hoja", "obligatorio", "descripcion"],
        ["config",     "Configuración institucional",      "../data/config/config.xlsx",     "config",     1, "Branding, paleta, atajos"],
        ["navegacion", "Mapa de navegación",               "../data/navegacion/navegacion.xlsx", "navegacion", 1, "Lista de slides"],
        ["avance",     "Avance de cumplimiento (Kawak)",   "../data/avance/avance.xlsx",     "avance",     1, "Cumplimiento por línea estratégica"],
        ["foda",       "FODA institucional",               "../data/foda/foda.xlsx",         "foda",       0, "Fortalezas, Oportunidades, Debilidades, Amenazas"],
        ["pestel",     "Análisis PESTEL",                  "../data/pestel/pestel.xlsx",     "pestel",     0, "Categorías PESTEL con sus items"],
        ["proyectos",  "Maestro de proyectos",             "../data/proyectos/proyectos.xlsx", "proyectos", 1, "Listado de proyectos estratégicos"],
        ["objetivos",  "Objetivos estratégicos (CMI)",     "../data/objetivos/objetivos.xlsx", "objetivos", 1, "Cuadro de Mando Integral"],
        ["reportes",   "Reportes anuales",                 "../data/reportes/reportes.xlsx", "historial",  0, "Histórico de cumplimiento 2022-2024"],
        ["unidades",   "Unidades organizacionales",        "../data/unidades/unidades.xlsx", "unidades",   0, "Unidades, vicerrectorías y áreas"],
    ]


# ────────────────────────────────────────────────────────────────────────────
# Plan de generación
# ────────────────────────────────────────────────────────────────────────────

SHEETS = {
    "config/config.xlsx":     [("config", build_config())],
    "navegacion/navegacion.xlsx": [("navegacion", build_navegacion())],
    "avance/avance.xlsx":     build_avance(),
    "foda/foda.xlsx":         [("foda", build_foda())],
    "pestel/pestel.xlsx":     [("pestel", build_pestel())],
    "proyectos/proyectos.xlsx": [("proyectos", build_proyectos())],
    "objetivos/objetivos.xlsx": [("objetivos", build_objetivos())],
    "reportes/reportes.xlsx": build_reportes(),
    "unidades/unidades.xlsx": [("unidades", build_unidades())],
    "sources/sources.xlsx":   [("fuentes", build_sources())],
}


def main():
    print("Generando XLSX en {} ...".format(DATA))
    for relpath, sheets in SHEETS.items():
        if len(sheets) == 1:
            sheet_name, rows = sheets[0]
            full = os.path.join(DATA, relpath)
            write_xlsx(full, sheet_name, rows)
            print("  [OK] {}  ({} filas)".format(relpath, len(rows) - 1))
        else:
            primary, rows_p = sheets[0]
            extras = sheets[1:]
            combined = list(rows_p)
            for sn, rows in extras:
                combined.append(["-- hoja: {} --".format(sn)] + [""] * (len(rows_p[0]) - 1))
                combined.extend(rows)
            full = os.path.join(DATA, relpath)
            write_xlsx(full, primary, combined)
            print("  [OK] {}  (hoja '{}' + {} hoja(s) embebida(s))".format(relpath, primary, len(extras)))
    print("Listo.")


if __name__ == "__main__":
    main()
