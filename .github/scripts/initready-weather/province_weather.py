"""On-demand provincial reference-location forecasts, cached for one hour."""
from pathlib import Path
import time,threading
from datetime import datetime,timedelta,timezone
from openmeteo import fetch,parse_location,PH,SOURCE
POINTS={};group=None
for line in Path(__file__).with_name('province-points.txt').read_text(encoding='utf-8-sig').splitlines():
 if not line or line.startswith('#'):continue
 if line.endswith(':'):group=line[:-1];POINTS[group]=[];continue
 name,town,lat,lon=line.split('|');POINTS[group].append({'name':name,'reference':town,'lat':float(lat),'lon':float(lon)})
CACHE={};LOCKS={r:threading.Lock() for r in POINTS}
def get_provinces(region,day):
 if region not in POINTS or day!=str(datetime.now(PH).date()):raise ValueError('Invalid region/date')
 with LOCKS[region]:
  cache=CACHE.get((region,day))
  if cache and time.monotonic()-cache[0]<cache[1]:return cache[2]
  points=POINTS[region];rows=[{'name':p['name'],'reference':p['reference'],'tempC':None,'condition':'unknown','status':'unavailable'} for p in points]
  try:
   for row,payload in zip(rows,fetch([(p['lat'],p['lon']) for p in points],timeout=30)):
    try:row.update({**parse_location(payload,day,False),'status':'connected'})
    except Exception:pass
  except Exception:pass
  success=sum(r['status']=='connected' for r in rows)
  now=datetime.now(timezone.utc).isoformat()
  result={'status':'connected' if success==len(rows) else 'partial' if success else 'error','source':SOURCE,'forecastTime':day+'T06:00:00Z','fetchedAt':now,'provinces':rows}
  CACHE[(region,day)]=(time.monotonic(),3600 if success==len(rows) else 300 if success else 60,result)
  return result
