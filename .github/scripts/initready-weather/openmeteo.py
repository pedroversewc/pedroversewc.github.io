"""Open-Meteo forecast adapter (ECMWF model); no API key needed."""
import json,math,time,threading,urllib.request,urllib.parse
from datetime import datetime,timedelta,timezone
PH=timezone(timedelta(hours=8));CACHE={};LOCK=threading.Lock()
SOURCE='Open-Meteo.com';MODEL='ecmwf_ifs025';RAIN_CHANCE=50
POINTS=[('dagupan',16.043,120.334),('manila',14.599,120.984),('iloilo',10.721,122.562),('cebu',10.315,123.885),('cdo',8.454,124.632),('davao',7.190,125.455)]
def condition(code,chance=None):
 # WMO weather codes. A forecast hour only counts as rain when the rain chance is high enough.
 if code in (0,1):return 'clear'
 if code in (2,3,45,48):return 'cloudy'
 if isinstance(code,int) and 51<=code<=99:return 'rain' if code>=95 or chance is None or chance>=RAIN_CHANCE else 'cloudy'
 return 'unknown'
def valid_temp(t):
 if isinstance(t,bool) or not isinstance(t,(int,float)) or not math.isfinite(t) or not -40<=t<=65:raise ValueError('Invalid temperature')
 return t
def parse_location(payload,day,with_current=True):
 h=payload.get('hourly',{});times=h.get('time',[])
 if day+'T14:00' not in times:raise ValueError('Missing hour')
 i=times.index(day+'T14:00');chance=(h.get('precipitation_probability') or [None]*len(times))[i]
 result={'tempC':valid_temp(h['temperature_2m'][i]),'condition':condition(h['weather_code'][i],chance),'rainChance':chance}
 c=payload.get('current')
 if with_current and c:result['now']={'tempC':valid_temp(c['temperature_2m']),'condition':condition(c['weather_code']),'time':c['time']}
 return result
def fetch(coords,days=1,timeout=20):
 """One request for many points; returns one payload per point, in order."""
 query=urllib.parse.urlencode({'latitude':','.join(f'{lat}' for lat,_ in coords),'longitude':','.join(f'{lon}' for _,lon in coords),
  'current':'temperature_2m,weather_code','hourly':'temperature_2m,weather_code,precipitation_probability',
  'models':MODEL,'timezone':'Asia/Manila','forecast_days':days})
 with urllib.request.urlopen('https://api.open-meteo.com/v1/forecast?'+query,timeout=timeout) as r:payload=json.load(r)
 payload=payload if isinstance(payload,list) else [payload]
 if len(payload)!=len(coords):raise ValueError('Point count mismatch')
 return payload
def get_weather(day):
 today=datetime.now(PH).date();base={'source':SOURCE,'cities':[]}
 if datetime.strptime(day,'%Y-%m-%d').date() not in (today,today+timedelta(days=1)):raise ValueError('Invalid date')
 with LOCK:
  cached=CACHE.get(day)
  if cached and time.monotonic()-cached[0]<1800:return cached[1]
  try:
   payloads=fetch([(lat,lon) for _,lat,lon in POINTS],1 if day==str(today) else 2)
   cities=[{'id':city,**parse_location(p,day,day==str(today))} for (city,_,_),p in zip(POINTS,payloads)]
   now=datetime.now(timezone.utc).isoformat();result={**base,'status':'connected','model':MODEL,'cities':cities,'forecastTime':day+'T06:00:00Z','initializedAt':now,'fetchedAt':now};CACHE[day]=(time.monotonic(),result)
  except Exception:
   result={**base,'status':'error','message':'Weather unavailable. Check the Open-Meteo connection.'};CACHE[day]=(time.monotonic()-1740,result)
  return result
