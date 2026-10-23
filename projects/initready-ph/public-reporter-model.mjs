import {CITIES} from './model.mjs';
import {autoOutfit} from './papongkie-model.mjs';
import {validSnapshot} from './weather-url.mjs';
export function reporterView(data,cityId,day,now=Date.now()){
 const city=CITIES.find(c=>c.id===cityId)||CITIES[0];
 const reading=data?.status==='connected'&&validSnapshot(data,day,now)?data.cities?.find(c=>c.id===city.id):null;
 const condition=['clear','cloudy','rain'].includes(reading?.condition)?reading.condition:'unknown';
 const ready=condition!=='unknown'&&Number.isFinite(reading?.tempC);
 return {region:city.region,outfit:ready?autoOutfit(data,city.id,day,now):0,condition:ready?condition:'unknown',summary:ready?`${city.name}: ${Math.round(reading.tempC)}°C, ${condition==='clear'?'clear skies':condition==='rain'?'rain expected':'cloudy'} · 2 PM PHT forecast for ${day}.`:`${city.name}: fresh weather is unavailable. Papongkie is wearing her signature outfit.`};
}
