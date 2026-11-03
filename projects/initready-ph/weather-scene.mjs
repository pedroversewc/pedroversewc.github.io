import {statusAtUse} from './model.mjs';
const CONDITIONS=['clear','cloudy','rain'];
export function sceneCondition(data,cityId,sampleCondition='clear'){
 const status=statusAtUse(data).status;
 if(status==='sample')return CONDITIONS.includes(sampleCondition)?sampleCondition:'unknown';
 if(status!=='connected')return 'unknown';
 const city=data.cities.find(c=>c.id===cityId);
 // Scenery follows the weather right now when available, else the 2 PM forecast.
 const condition=city?.now?.condition??city?.condition;
 return CONDITIONS.includes(condition)?condition:'unknown';
}
