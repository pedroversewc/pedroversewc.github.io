// Relative data paths also work when hosted below /projects/initready-ph/.
export function weatherURL(kind,day,region='',staticMode=false){
 if(staticMode)return kind==='provinces'?'data/provinces-'+region.toLowerCase()+'.json':'data/weather.json';
 return kind==='provinces'?'/api/provinces?region='+encodeURIComponent(region)+'&date='+encodeURIComponent(day):'/api/weather?date='+encodeURIComponent(day);
}
export function validSnapshot(data,day,now=Date.now()){
 const fetched=Date.parse(data?.fetchedAt);
 return data?.forecastTime===day+'T06:00:00Z'&&Number.isFinite(fetched)&&now-fetched<2*3600000&&fetched<=now+300000;
}
