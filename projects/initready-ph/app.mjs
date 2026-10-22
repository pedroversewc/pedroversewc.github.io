import {weatherURL,validSnapshot} from './weather-url.mjs';
import {sceneCondition} from './weather-scene.mjs';
import {REGIONS,phDate,addDay,prettyDate,prettyTime,degrees,normalize,sampleData,emptyData,outputLabel,statusAtUse} from './model.mjs';
import {drawVillage} from './world.mjs';
import {SCENES} from './scenes.mjs';
import {scenePeriod} from './scene-time.mjs';
import {setupProvincePanel} from './province-panel.mjs';
const $=id=>document.getElementById(id);
const staticMode=document.querySelector('meta[name="weather-mode"]')?.content==='static';
const state={day:phDate(),data:emptyData(),sample:false,busy:false,scene:'clear',sceneRegion:'Luzon'};let requestId=0;let liveVerified=false;
const updateProvincePanel=setupProvincePanel(()=>state);
drawVillage($('village'));const dialog=$('connection-dialog');
$('connection').onclick=()=>dialog.showModal();$('close-dialog').onclick=()=>dialog.close();
const scenePicker=document.createElement('label');scenePicker.className='scene-picker';scenePicker.textContent='Sample scenery ';const sceneSelect=document.createElement('select');sceneSelect.setAttribute('aria-label','Sample scenery');for(const [value,label] of [['clear','Clear skies'],['cloudy','Cloudy'],['rain','Rain']]){const option=document.createElement('option');option.value=value;option.textContent=label;sceneSelect.append(option);}scenePicker.append(sceneSelect);dialog.append(scenePicker);sceneSelect.onchange=()=>{state.scene=sceneSelect.value;render();};
const effect=document.createElement('div');effect.className='weather-effect';effect.setAttribute('aria-hidden','true');document.getElementById('main').prepend(effect);
document.getElementById('weather').addEventListener('click',event=>{const card=event.target.closest('[data-island]');if(card){state.sceneRegion=card.dataset.island;updateEffects();}});
function updateEffects(){const ids={Luzon:'dagupan',Visayas:'cebu',Mindanao:'davao'};document.documentElement.dataset.weather=sceneCondition(state.data,ids[state.sceneRegion],state.scene);scenePicker.hidden=true;for(const card of document.querySelectorAll('[data-island]'))card.dataset.weather=sceneCondition(state.data,ids[card.dataset.island],state.scene);}
function calendar(){document.documentElement.dataset.period=scenePeriod();const today=phDate();$('current-date').textContent=prettyDate(today)+' · PHT';$('current-date').dateTime=today;}
$('sample-toggle').onclick=()=>{state.sample=!state.sample;requestId++;state.busy=false;state.data=state.sample?sampleData(state.day):emptyData();dialog.close();render();if(!state.sample)sync();};
$('refresh').onclick=()=>{if(state.sample){state.data=sampleData(state.day);render();}else sync();};
function render(){if(state.data.status==='connected')liveVerified=true;document.getElementById('sample-toggle').hidden=true;updateProvincePanel();calendar();state.data=statusAtUse(state.data);$('weather').replaceChildren();
for(const [i,region] of REGIONS.entries()){const card=document.createElement('article');card.className='weather-card';card.dataset.island=region;card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-label','Explore '+region+' provinces');const scene=document.createElement('div');scene.className='card-scene';scene.setAttribute('aria-hidden','true');scene.innerHTML=SCENES[region].replace('viewBox="0 0 600 650"','viewBox="0 270 600 380"');card.append(scene);const heading=document.createElement('div');heading.className='card-title';const title=document.createElement('h2');title.textContent=region;const number=document.createElement('span');number.className='region-index';number.textContent='0'+(i+1)+' / PH';heading.append(title,number);card.append(heading);const cities=document.createElement('div');for(const city of state.data.cities.filter(c=>c.region===region)){const row=document.createElement('div');row.className='city';const name=document.createElement('span');name.textContent=city.name;const temp=document.createElement('strong');temp.textContent=city.tempC===null?'— °C':degrees(city.tempC)+'C';row.append(name,temp);cities.append(row);}card.append(cities);const note=document.createElement('p');note.className='weather-note';note.textContent='2 PM PHT · EXPLORE PROVINCES ↗';card.append(note);$('weather').append(card);}
$('data-label').textContent=outputLabel(state.data);$('notice').textContent=state.busy?'Checking weather…':state.sample?'Illustrative values only · '+prettyDate(state.day):state.data.status==='connected'?'Forecast for '+prettyDate(state.day):state.data.status==='stale'?'Previous forecast is stale. Refresh before use.':state.data.message||'WeatherAPI.com is not connected. Open Weather connection to preview sample weather.';$('source-detail').textContent=state.data.source+' · Last sync: '+prettyTime(state.data.fetchedAt);$('connection').textContent=state.sample?'Sample weather ↗':state.data.status==='connected'?'WeatherAPI.com · connected ↗':'Weather connection ↗';$('sample-toggle').textContent=state.sample?'Leave sample weather':'Explore sample weather';$('refresh').disabled=state.busy;updateEffects();}
async function sync(){if(state.sample)return;const id=++requestId,day=state.day;state.busy=true;render();try{const response=await fetch(weatherURL('weather',day,'',staticMode),{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Weather request failed');const data=normalize(await response.json());if(staticMode&&!validSnapshot(data,day))throw Error('Weather snapshot expired');if(data.forecastTime&&new Date(data.forecastTime).toISOString()!==new Date(day+'T14:00:00+08:00').toISOString())throw Error('Wrong forecast date');if(id===requestId)state.data=data;}catch{if(id===requestId)state.data=state.data.cities.some(c=>c.tempC!==null)?{...state.data,status:'stale'}:{...emptyData(),status:'error',message:'Weather connection unavailable. No live readings to display.'};}finally{if(id===requestId){state.busy=false;render();}}}
setInterval(()=>{calendar();if(!document.hidden&&!state.sample&&!state.busy)sync();},15*60000);setInterval(()=>{if(state.data.status==='connected'&&statusAtUse(state.data).status==='stale')render();calendar();},60000);render();sync();










