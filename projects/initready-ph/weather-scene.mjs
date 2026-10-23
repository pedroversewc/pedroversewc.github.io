import {statusAtUse} from './model.mjs';
const CONDITIONS=['clear','cloudy','rain'];
export function sceneCondition(data,cityId,sampleCondition='clear'){
 const status=statusAtUse(data).status;
 if(status==='sample')return CONDITIONS.includes(sampleCondition)?sampleCondition:'unknown';
 if(status!=='connected')return 'unknown';
 const city=data.cities.find(c=>c.id===cityId);
 return CONDITIONS.includes(city?.condition)?city.condition:'unknown';
}
