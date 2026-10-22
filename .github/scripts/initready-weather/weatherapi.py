"""WeatherAPI forecast adapter; API key stays server-side."""
import os,json,math,time,threading,urllib.request,urllib.parse
from datetime import datetime,timedelta,timezone
PH=timezone(timedelta(hours=8));CACHE={};LOCK=threading.Lock()
POINTS=[('dagupan',16.043,120.334),('manila',14.599,120.984),('iloilo',10.721,122.562),('cebu',10.315,123.885),('cdo',8.454,124.632),('davao',7.190,125.455)]
def parse_forecast(payload,day):
 h=next((h for d in payload.get('forecast',{}).get('forecastday',[]) if d.get('date')==day for h in d.get('hour',[]) if h.get('time')==day+' 14:00'),None)
 if h is None:raise ValueError('Missing hour')
 t=h.get('temp_c')
 if isinstance(t,bool) or not isinstance(t,(int,float)) or not math.isfinite(t) or not -40<=t<=65:raise ValueError('Invalid temperature')
 c=h.get('condition',{}).get('code');rain={1063,1072,1087,1150,1153,1168,1171,1180,1183,1186,1189,1192,1195,1198,1201,1240,1243,1246,1273,1276}
 return {'tempC':t,'condition':'clear' if c==1000 else 'cloudy' if c in {1003,1006,1009,1030,1135,1147} else 'rain' if c in rain else 'unknown'}
def get_weather(day):
 today=datetime.now(PH).date();base={'source':'WeatherAPI.com','cities':[]}
 if datetime.strptime(day,'%Y-%m-%d').date() not in (today,today+timedelta(days=1)):raise ValueError('Invalid date')
 key=os.environ.get('WEATHERAPI_KEY','').strip()
 if not key:return {**base,'status':'not_connected','message':'WeatherAPI key is not configured on this computer.'}
 with LOCK:
  cached=CACHE.get(day)
  if cached and time.monotonic()-cached[0]<1800:return cached[1]
  try:
   cities=[]
   for city,lat,lon in POINTS:
    query=urllib.parse.urlencode({'key':key,'q':f'{lat},{lon}','days':1 if day==str(today) else 2,'aqi':'no','alerts':'no'})
    with urllib.request.urlopen('https://api.weatherapi.com/v1/forecast.json?'+query,timeout=6) as r:payload=json.load(r)
    cities.append({'id':city,**parse_forecast(payload,day)})
   now=datetime.now(timezone.utc).isoformat();result={**base,'status':'connected','cities':cities,'forecastTime':day+'T06:00:00Z','initializedAt':now,'fetchedAt':now};CACHE[day]=(time.monotonic(),result)
  except Exception:
   # Provider exception URLs may contain keys: never return or log them.
   result={**base,'status':'error','message':'Weather unavailable. Check your WeatherAPI key, plan, quota and connection.'};CACHE[day]=(time.monotonic()-1740,result)
  return result
