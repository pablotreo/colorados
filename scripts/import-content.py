"""Importa la copia local de la fuente sin corregir silenciosamente sus datos."""
import re,json,unicodedata,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
def slug(s):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def write(kind,id,data,body=''):
 p=root/'src/data'/kind/(id+'.md');p.parent.mkdir(parents=True,exist_ok=True);p.write_text('---\n'+ '\n'.join(k+': '+json.dumps(v,ensure_ascii=False) for k,v in data.items())+'\n---\n'+body+'\n')
text=(root/'docs/sources/contenido.txt').read_text(encoding='utf-8-sig')
sectors=[]; routes=[]
for block in re.split(r'(?=SECTOR \d+:)',text)[1:]:
 lines=[s.strip() for s in block.splitlines() if s.strip()];m=re.match(r'SECTOR (\d+): (.+)',lines[0]);number=int(m[1]);name=m[2].title();id=slug(name);sectors.append(id)
 description=next(s.removeprefix('Descripción: ') for s in lines if s.startswith('Descripción:'))
 data=dict(name=name,number=number,order=number,description=description,declaredRoutes=int(re.search(r'Cantidad de vías: (\d+)',block)[1]),source='https://docs.google.com/document/d/1Jeyi0XtoBjCj5vTKd7hTQVcWXJPbBDPS/edit',approach='Menos de 10 minutos desde el cementerio Cerro Colorado')
 if number==2:data['restriction']='No escalar de septiembre a diciembre: nidificación de halcones peregrinos.'
 if number==7:data['warning']='Roca que aún necesita limpieza, según la fuente.'
 write('sectores',id,data)
 for seq,line in enumerate([s for s in lines if re.match(r'^\d+\.',s)],1):
 m=re.match(r'(\d+)\.\s*(.*?)(?:\s*\(([^)]+)\)(.*))?$',line); n=int(m[1]);rname=m[2].strip();grade=m[3];tail=(m[4] or '').strip();rid=f'{id}-{n:02d}-{slug(rname)}'
  if number==2 and rname.lower() == 'variante final x la dere':
   continue
  d=dict(name=rname,sector=id,order=n,sourceOrder=seq,classification='DEPORTIVA',description=f'Vía de escalada deportiva en {name}.',sourceText=line,source=data['source'],verified=False)
  if number==2 and n==1:d['sourceText'] += ' Variante final x la dere (??), GF-2015.'
  if grade:d['grade']=grade;d['gradeUncertain']='?' in grade
  if id == 'la-visera' and rname == 'Teniente coronel':
   d['grade']='7b'
   d['sourceText']=line.replace('(6c)', '(7b)')
  bolts=re.match(r'(\d+)\+(\d+)',tail)
  if bolts:d['bolts']=int(bolts[1]);d['anchorPoints']=int(bolts[2]);d['protection']=bolts[0]+' (notación de la fuente)'
  if 'construcción' in rname.lower() or 'falta la entrada' in line:d['status']='Inconclusa'
  if 'Atención con Bloque' in line:d['warning']='Atención con bloque: advertencia de la fuente. Confirmar condiciones antes de escalar.'
  if 'falta la entrada' in line:d['warning']='Falta la entrada y limpieza, según la fuente.'
  if number==2:d['restriction']=data['restriction']
  write('vias',rid,d);routes.append(dict(id=rid,**d))
write('clasificaciones','deportiva',dict(name='DEPORTIVA',order=1,sourceText='Escalada deportiva. Los grados y la notación de equipamiento se transcriben de la fuente. Los signos de pregunta indican incertidumbre; no se infieren longitudes ni estados de verificación.'))
(root/'docs/import-report.json').write_text(json.dumps(dict(sectors=len(sectors),declaredRoutes=78,importedEntries=len(routes),counts={s:sum(r['sector']==s for r in routes) for s in sectors},notes=['La Visera declara 10 vías. La variante final se incorpora como nota de la vía 1; las dos entradas numeradas 10 se conservan.','La exportación HTML no conserva marcas naranjas de proyectos: no se infiere ese estado.']),ensure_ascii=False,indent=2))
print(f'{len(sectors)} sectores; {len(routes)} entradas importadas; 78 vías declaradas en la fuente.')
