export const CITIES=[
 {id:'dagupan',name:'Dagupan',region:'Luzon',lat:16.043,lon:120.334},
 {id:'manila',name:'Manila',region:'Luzon',lat:14.599,lon:120.984},
 {id:'iloilo',name:'Iloilo',region:'Visayas',lat:10.721,lon:122.562},
 {id:'cebu',name:'Cebu',region:'Visayas',lat:10.315,lon:123.885},
 {id:'cdo',name:'Cagayan de Oro',region:'Mindanao',lat:8.454,lon:124.632},
 {id:'davao',name:'Davao',region:'Mindanao',lat:7.190,lon:125.455}
];
export const REGIONS=['Luzon','Visayas','Mindanao'];
export const phDate=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const addDay=(date,days=1)=>new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
export const forecastTime=(day)=>new Date(day+'T14:00:00+08:00').toISOString();
export const prettyDate=(day)=>new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'}).format(new Date(day+'T12:00:00+08:00'));
export const prettyTime=(s)=>s?new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(s))+' PHT':'Not available';
export const degrees=(n)=>typeof n==='number'&&Number.isFinite(n)?Math.round(n)+'°':'—';
export function normalize(payload){
 if(!payload||!['connected','stale','sample','not_connected','error'].includes(payload.status))throw Error('Unrecognized weather response.');
 const entries=payload.cities||[];
 for(const c of entries){
  if(!CITIES.some(x=>x.id===c.id))throw Error('Unknown city.');
  if(c.tempC!==null&&(typeof c.tempC!=='number'||!Number.isFinite(c.tempC)||c.tempC < -40||c.tempC>65))throw Error('Invalid temperature.');
 }
 return {...payload,cities:CITIES.map(city=>({...city,tempC:entries.find(x=>x.id===city.id)?.tempC??null,condition:entries.find(x=>x.id===city.id)?.condition??'unknown'}))};
}
export const selectCities=(data,region='all')=>data.cities.filter(c=>region==='all'||c.region===region);
export function sampleData(day){
 return normalize({status:'sample',source:'Illustrative sample — not a forecast',forecastTime:forecastTime(day),initializedAt:null,fetchedAt:null,cities:CITIES.map((c,i)=>({id:c.id,tempC:[31,32,30,31,30,32][i]}))});
}
export const emptyData=()=>normalize({status:'not_connected',source:'WeatherAPI.com connection pending',cities:[]});
export function statusAtUse(data,now=new Date()){
 if(data.status==='connected'&&(!Number.isFinite(Date.parse(data.initializedAt))||now-Date.parse(data.initializedAt)>12*3600000))return {...data,status:'stale'};
 return data;
}
export function outputLabel(data){const s=statusAtUse(data).status;return s==='sample'?'SAMPLE DATA • NOT A FORECAST':s==='connected'?'WeatherAPI.com • 2 PM forecast':s==='stale'?'STALE FORECAST • CHECK BEFORE SHARING':'NO FORECAST DATA • PREVIEW ONLY';}

