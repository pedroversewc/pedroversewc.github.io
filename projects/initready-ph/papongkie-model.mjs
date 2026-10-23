import {validSnapshot} from './weather-url.mjs';

export const OUTFITS=[
 ['Signature red','signature-red'],['Sunny yellow','sunny-yellow'],
 ['Sky blue','sky-blue'],['Rainy day','rainy-day'],['Mint day','mint-day'],
 ['Coral day','coral-day'],['Cloudy lavender','cloudy-lavender'],
 ['Cool breeze','cool-breeze'],['Navy presenter','navy-presenter'],
 ['Peach sunshine','peach-sunshine']
].map(([name,file])=>({name,file:'assets/papongkie/'+file+'.png'}));

export function chooseOutfit(city,day){
 if(!city||!['clear','cloudy','rain'].includes(city.condition)||!Number.isFinite(city.tempC)||city.tempC < -40||city.tempC>65)return 0;
 if(city.condition==='rain')return 3;
 if(city.tempC<=25)return 7;
 const options=city.tempC>=32?[1,4,5,9]:city.condition==='cloudy'?[2,6,8]:[0,1,2,4,5,9];
 const rotation=Number(String(day).slice(-2))||0;
 return options[rotation%options.length];
}

export function autoOutfit(data,cityId,day,now=Date.now()){
 if(data?.status!=='connected'||!validSnapshot(data,day,now))return 0;
 return chooseOutfit(data.cities?.find(city=>city.id===cityId),day);
}
