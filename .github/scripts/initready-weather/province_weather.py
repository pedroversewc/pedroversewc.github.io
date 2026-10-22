"""On-demand provincial reference-location forecasts, cached for one hour."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,os,time,threading,urllib.request,urllib.parse,math
from datetime import datetime,timedelta,timezone
from weatherapi import parse_forecast,PH
POINTS={};group=None
for line in Path(__file__).with_name('province-points.txt').read_text(encoding='utf-8-sig').splitlines():
 if not line or line.startswith('#'):continue
 if line.endswith(':'):group=line[:-1];POINTS[group]=[];continue
 name,town,lat,lon=line.split('|');POINTS[group].append({'name':name,'reference':town,'lat':float(lat),'lon':float(lon)})
CACHE={};LOCKS={r:threading.Lock() for r in POINTS}
def fetch_point(point,day,key):
 base={'name':point['name'],'reference':point['reference'],'tempC':None,'condition':'unknown','status':'unavailable'}
 try:
  params=urllib.parse.urlencode({'key':key,'q':f"{point['lat']},{point['lon']}",'days':1,'aqi':'no','alerts':'no'})
  with urllib.request.urlopen('https://api.weatherapi.com/v1/forecast.json?'+params,timeout=8) as response:payload=json.load(response)
  location=payload.get('location',{})
  # Reject a geocoder result in another country or far from the reference point.
  if location.get('country')!='Philippines':raise ValueError('Wrong country')
  distance=math.hypot((float(location['lat'])-point['lat'])*111,(float(location['lon'])-point['lon'])*111*math.cos(math.radians(point['lat'])))
  if distance>50:raise ValueError('Reference mismatch')
  return {**base,**parse_forecast(payload,day),'status':'connected','resolvedLocation':str(location.get('name',''))}
 except Exception:return base

def get_provinces(region,day):
 if region not in POINTS or day!=str(datetime.now(PH).date()):raise ValueError('Invalid region/date')
 key=os.environ.get('WEATHERAPI_KEY','').strip()
 if not key:return {'status':'not_connected','source':'WeatherAPI.com','provinces':[]}
 with LOCKS[region]:
  cache=CACHE.get((region,day))
  if cache and time.monotonic()-cache[0]<cache[1]:return cache[2]
  with ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(lambda p:fetch_point(p,day,key),POINTS[region]))
  success=sum(r['status']=='connected' for r in rows)
  now=datetime.now(timezone.utc).isoformat()
  result={'status':'connected' if success==len(rows) else 'partial' if success else 'error','source':'WeatherAPI.com','forecastTime':day+'T06:00:00Z','fetchedAt':now,'provinces':rows}
  CACHE[(region,day)]=(time.monotonic(),3600 if success==len(rows) else 300 if success else 60,result)
  return result
