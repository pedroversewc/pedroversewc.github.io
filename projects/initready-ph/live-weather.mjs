// Public (static) pages read Open-Meteo directly in the visitor's browser, so they do not depend on
// the scheduled snapshot job (GitHub delays it by hours). The snapshot stays as a fallback.
// Mirrors website/openmeteo.py: ECMWF model, 2 PM PHT hour, rain only at >=50% chance.
import {CITIES} from './model.mjs';
import {POINTS} from './province-points.mjs';
import {weatherURL,validSnapshot} from './weather-url.mjs';
const SOURCE='Open-Meteo.com',MODEL='ecmwf_ifs025',RAIN_CHANCE=50;
export function condition(code,chance=null){
 if(code===0||code===1)return 'clear';
 if([2,3,45,48].includes(code))return 'cloudy';
 if(Number.isInteger(code)&&code>=51&&code<=99)return code>=95||chance===null||chance>=RAIN_CHANCE?'rain':'cloudy';
 return 'unknown';
}
function validTemp(t){
 if(typeof t!=='number'||!Number.isFinite(t)||t<-40||t>65)throw Error('Invalid temperature');
 return t;
}
export function parseLocation(payload,day,withCurrent=true){
 const h=payload?.hourly??{},i=(h.time??[]).indexOf(day+'T14:00');
 if(i<0)throw Error('Missing hour');
 const chance=h.precipitation_probability?.[i]??null;
 const result={tempC:validTemp(h.temperature_2m[i]),condition:condition(h.weather_code[i],chance),rainChance:chance};
 const c=payload.current;
 if(withCurrent&&c)result.now={tempC:validTemp(c.temperature_2m),condition:condition(c.weather_code),time:c.time};
 return result;
}
export function openMeteoURL(points,day,withCurrent){
 const q=new URLSearchParams({latitude:points.map(p=>p.lat).join(','),longitude:points.map(p=>p.lon).join(','),hourly:'temperature_2m,weather_code,precipitation_probability',models:MODEL,timezone:'Asia/Manila',start_date:day,end_date:day});
 if(withCurrent)q.set('current','temperature_2m,weather_code');
 return 'https://api.open-meteo.com/v1/forecast?'+q;
}
async function fetchPoints(points,day,withCurrent,timeout){
 const response=await fetch(openMeteoURL(points,day,withCurrent),{signal:AbortSignal.timeout(timeout)});
 if(!response.ok)throw Error('Open-Meteo request failed');
 const body=await response.json(),list=Array.isArray(body)?body:[body];
 if(list.length!==points.length)throw Error('Point count mismatch');
 return list;
}
export function citiesPayload(list,day,now=new Date().toISOString()){
 return {status:'connected',source:SOURCE,model:MODEL,cities:CITIES.map((c,i)=>({id:c.id,...parseLocation(list[i],day)})),forecastTime:day+'T06:00:00Z',initializedAt:now,fetchedAt:now};
}
export function provincesPayload(points,list,day,now=new Date().toISOString()){
 const provinces=points.map((p,i)=>{
  try{return {name:p.name,reference:p.reference,...parseLocation(list[i],day,false),status:'connected'};}
  catch{return {name:p.name,reference:p.reference,tempC:null,condition:'unknown',status:'unavailable'};}
 });
 const ok=provinces.filter(p=>p.status==='connected').length;
 if(!ok)throw Error('No provincial readings');
 return {status:ok===provinces.length?'connected':'partial',source:SOURCE,forecastTime:day+'T06:00:00Z',fetchedAt:now,provinces};
}
// One loader for every page: local app -> Python API; public site -> Open-Meteo, then the snapshot if it is still fresh.
export async function loadWeather(kind,day,region,staticMode,timeout){
 if(staticMode){
  try{
   if(kind==='provinces')return provincesPayload(POINTS[region],await fetchPoints(POINTS[region],day,false,30000),day);
   return citiesPayload(await fetchPoints(CITIES,day,true,20000),day);
  }catch{/* fall back to the published snapshot */}
 }
 const response=await fetch(weatherURL(kind,day,region,staticMode),{signal:AbortSignal.timeout(timeout)});
 if(!response.ok)throw Error('Weather request failed');
 const data=await response.json();
 if(staticMode&&!validSnapshot(data,day))throw Error('Weather snapshot expired');
 return data;
}
