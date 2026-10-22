"""Generate public forecast JSON; the API key remains in the process environment."""
import json,os
from pathlib import Path
from datetime import datetime
from weatherapi import get_weather,PH
from province_weather import get_provinces

def export_forecasts(target):
 if not os.environ.get('WEATHERAPI_KEY'):raise SystemExit('Add the WEATHERAPI_KEY repository secret first.')
 day=str(datetime.now(PH).date());payloads={'weather.json':get_weather(day)}
 for region in ('Luzon','Visayas','Mindanao'):payloads['provinces-'+region.lower()+'.json']=get_provinces(region,day)
 if any(data.get('status')!='connected' for data in payloads.values()):raise SystemExit('Forecast update incomplete; previous public snapshots preserved.')
 target=Path(target);target.mkdir(parents=True,exist_ok=True)
 for name,data in payloads.items():(target/name).write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
 print('Updated six city forecasts and 82 provincial reference locations. No credentials exported.')
if __name__=='__main__':
 import sys
 export_forecasts(sys.argv[1])
