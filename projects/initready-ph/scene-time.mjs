// Fixed visual dayparts, not computed sunrise or observed sky conditions.
export function scenePeriod(date=new Date()){
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',hourCycle:'h23'}).format(date));
 return hour>=5&&hour<8?'sunrise':hour>=8&&hour<17?'day':hour>=17&&hour<19?'sunset':'night';
}
