import json
jb = open(r'C:\Users\ximen\OneDrive\Proyectos_DS\Informe_Interactivo\data-bundle.js', encoding='utf-8').read()
start = jb.index('{')
end = jb.rindex('}') + 1
data = json.loads(jb[start:end])
cfg = {r['clave']: r['valor'] for r in data['config'] if r.get('seccion') == 'general'}
for k,v in cfg.items():
    print(f'  {k}: {v}')
print()
for r in data['avance']:
    print(f'  {r.get("nombre","")} | {r.get("color","")} | {r.get("cumplimiento","")}% | {r.get("retos","")} retos | {r.get("areas","")} areas')
print()
for r in data['foda']:
    print(f'  FODA: {r.get("cuadrante","")} | {r.get("item","")}')
print()
for r in data['objetivos']:
    print(f'  OE: {r.get("id","")} | {r.get("nombre","")} | {r.get("perspectiva","")} | meta={r.get("meta","")} real={r.get("real","")}')
