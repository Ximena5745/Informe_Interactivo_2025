"""
Genera fixtures XLSX para tests/.
Ejecutar: python tests/fixtures/generar.py
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from generar_xlsx import write_xlsx  # noqa: E402

FIXTURES = os.path.join(os.path.dirname(os.path.abspath(__file__)))


def main():
    # Fixture: 2 líneas con shapes válidos
    avance = [
        ["id", "nombre", "color", "icono", "slideId", "logroSlideId", "slidePPT",
         "real", "esperado", "cumplimiento", "retos", "areas", "logros"],
        ["calidad", "Calidad", "#EC0677", "rosa", "cal-avance", "cal-logro", "7/8",
         99, 100, 99, 103, 45, "Logro A | Logro B | Logro C"],
        ["educacion", "Educación", "#0F385A", "graduacion", "edu-avance", "edu-logro", "9/10",
         95, 100, 95, 18, 14, "Logro X | Logro Y"],
    ]
    write_xlsx(os.path.join(FIXTURES, "avance-fixture.xlsx"), "avance", avance)
    print("  [OK] avance-fixture.xlsx (2 lineas)")

    # Fixture: navegación mínima
    navegacion = [
        ["id", "titulo", "layout", "dataTitle", "colorHeader", "lineaId", "imagen", "origen"],
        ["home", "Inicio", "home", "Inicio", "#0F385A", "", "", "configuracion"],
        ["cal-avance", "Calidad", "linea", "Calidad", "#EC0677", "calidad", "", "avance"],
    ]
    write_xlsx(os.path.join(FIXTURES, "navegacion-fixture.xlsx"), "navegacion", navegacion)
    print("  [OK] navegacion-fixture.xlsx (2 slides)")


if __name__ == "__main__":
    main()
