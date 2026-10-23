import {CITIES,phDate,normalize} from './model.mjs';
import {OUTFITS} from './papongkie-model.mjs';
import {scenePeriod} from './scene-time.mjs';
import {weatherURL} from './weather-url.mjs';
import {reporterView} from './public-reporter-model.mjs';
const $=id=>document.getElementById(id),stage=document.querySelector('.stage');
const staticMode=document.querySelector('meta[name="weather-mode"]')?.content==='static';
let data=null,busy=false;
for(const city of CITIES){const option=document.createElement('option');option.value=city.id;option.textContent=city.name+' · '+city.region;$('report-city').append(option);}
function render(){const view=reporterView(data,$('report-city').value,phDate());stage.dataset.period=scenePeriod();stage.dataset.region=view.region;stage.dataset.weather=view.condition;const outfit=OUTFITS[view.outfit];$('character').style.backgroundImage=`url("${outfit.file}")`;$('character').setAttribute('aria-label','Papongkie wearing '+outfit.name);$('report-summary').textContent=view.summary;$('stage-weather').textContent=view.condition==='unknown'?'SIGNATURE LOOK':'2 PM FORECAST · '+view.condition.toUpperCase();$('report-source').textContent=view.condition==='unknown'?'No fresh provider reading. Missing weather is never replaced with demo values.':'WeatherAPI.com · Forecast fetched '+new Date(data.fetchedAt).toLocaleString('en-PH',{timeZone:'Asia/Manila'})+' PHT';}
async function refresh(){if(busy)return;busy=true;$('refresh-report').disabled=true;try{const response=await fetch(weatherURL('weather',phDate(),'',staticMode),{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Unavailable');data=normalize(await response.json());}catch{data=null;}finally{busy=false;$('refresh-report').disabled=false;render();}}
$('report-city').onchange=render;$('refresh-report').onclick=refresh;
$('share-page').onclick=async()=>{const url=new URL('watch.html',location.href).href;try{if(navigator.share)await navigator.share({title:'Meet Papongkie · InitReady PH',url});else{await navigator.clipboard.writeText(url);$('share-status').textContent='Link copied. Share it with your family and friends.';}}catch(error){if(error.name!=='AbortError')$('share-status').textContent='Copy this page address to share Papongkie.';}};
setInterval(()=>{render();if(!document.hidden)refresh();},15*60000);setInterval(render,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();refresh();}});render();refresh();
