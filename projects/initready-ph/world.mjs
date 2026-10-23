// Original SVG pixel world; decorative lighting never represents live weather.
export function drawVillage(svg){
const parts=[];
const poly=(points,fill,extra='')=>`<polygon points="${points}" fill="${fill}" ${extra}/>`;
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
function block(x,y,w,d,h,top='#68847c',left='#364f61',right='#485871'){return poly(`${x},${y-h} ${x+w},${y+w*.45-h} ${x+w-d},${y+(w+d)*.45-h} ${x-d},${y+d*.45-h}`,top)+poly(`${x-d},${y+d*.45-h} ${x+w-d},${y+(w+d)*.45-h} ${x+w-d},${y+(w+d)*.45} ${x-d},${y+d*.45}`,left)+poly(`${x+w},${y+w*.45-h} ${x+w-d},${y+(w+d)*.45-h} ${x+w-d},${y+(w+d)*.45} ${x+w},${y+w*.45}`,right);}
function house(x,y,scale=1,shop=false){return `<g transform="translate(${x} ${y}) scale(${scale})">`+block(0,0,75,56,63,'#a78b7e','#70617a','#8a7187')+poly('-68,-43 3,-116 87,-55 15,-21','#6c5277')+poly('3,-116 17,-77 87,-55 15,-21','#92728b')+poly('-50,-51 4,-102 7,-88 -35,-47','#c9a781')+rect(-35,-27,14,22,'#ffdb8d')+rect(-12,-18,14,22,'#ffdb8d')+poly('30,-19 46,-26 46,3 30,10','#f5c583')+poly('49,-31 63,-37 63,-20 49,-14','#94d9e0')+(shop?`<path d="M-49 -40L15 -11L15 4L-49 -25Z" fill="#d09294"/><text x="-30" y="-27" fill="#fff0c1" font-size="6" transform="rotate(24 -30 -27)">SARI-SARI</text>`:poly('16,-72 44,-60 29,-45 2,-57','#365b80')+poly('18,-68 36,-60 27,-50 9,-58','#75b0c4'))+rect(-31,7,5,27,'#695575')+rect(29,25,5,25,'#695575')+'</g>';}
function palm(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0H9V-56H14V-98H6V-55H0Z" fill="#9e7e80"/><path d="M10 -92H-7V-106H-34V-117H-58V-110H-37V-96H-17V-81H-3V-68H5V-89H19V-108H42V-117H65V-110H45V-96H25V-80H14Z" fill="#67a49a"/><path d="M9 -99V-122H-4V-135H-21V-128H-11V-114H0V-92M15 -98V-121H33V-131H50V-123H38V-109H27V-91" fill="#86b4a2"/></g>`;}
parts.push('<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#14172f"/><stop offset=".55" stop-color="#484268"/><stop offset="1" stop-color="#232e4b"/></linearGradient><radialGradient id="halo"><stop stop-color="#dca9b1" stop-opacity=".22"/><stop offset="1" stop-color="#997bbc" stop-opacity="0"/></radialGradient></defs>',rect(0,0,1440,1000,'url(#sky)'),'<ellipse cx="720" cy="490" rx="600" ry="400" fill="url(#halo)"/>');
for(let i=0;i<90;i++){const x=(i*173+47)%1440,y=(i*83+19)%540;parts.push(rect(x,y,i%6===0?3:2,i%6===0?3:2,i%3?'#afa0ca':'#efc889'));}
parts.push('<path d="M1175 109h36v12h13v37h-13v12h-37v-12h-12v-37h13z" fill="#ebce9a"/><path d="M1198 109h13v12h13v37h-13v12h-13v-12h-13v-37h13z" fill="#c6adb3"/>');
for(const [x,y,s] of [[80,260,1],[1050,310,1.2],[400,90,.8]])parts.push(`<g class="cloud ${x>500?'second':''}" transform="translate(${x} ${y}) scale(${s})" opacity=".3">${poly('0,20 30,20 30,8 67,8 67,0 108,0 108,12 145,12 145,28 175,28 175,40 0,40','#a49ab9')}</g>`);
// Distant island silhouettes and water glints.
parts.push(poly('0,530 95,490 180,510 300,447 425,525 550,482 700,537 900,468 1080,526 1220,480 1440,535 1440,1000 0,1000','#233851'));
for(let i=0;i<100;i++){const x=(i*117)%1440,y=550+(i*53)%440;parts.push(`<g class="water-glow" opacity="${i%3?'.25':'.5'}">${rect(x,y,12+(i%5)*12,2,i%4?'#7c94b4':'#c9a5d3')}</g>`);}
parts.push('<ellipse cx="725" cy="772" rx="532" ry="122" fill="#111c34" opacity=".55"/>');
// One connected stepped archipelago.
parts.push(block(640,510,550,370,90,'#5e777a','#2d3f59','#414666'),block(377,544,228,190,70,'#6f8a83','#344860','#46516b'),block(1010,620,187,156,66,'#62827e','#344860','#46516b'));
parts.push(block(592,581,345,42,5,'#b2a1a1','#7d7488','#8d7b91'),block(760,565,38,193,6,'#b2a1a1','#7d7488','#8d7b91'));
for(let i=0;i<14;i++)parts.push(block(525+i*23,582+i*10,10,5,2,'#e2c79d','#a19092','#a19092'));
// Back row first, then foreground for natural isometric depth.
parts.push(palm(510,498,.85),house(625,490,.85),house(840,540,.8),palm(1030,580,1),house(432,570,.9,true),house(950,650,.9),palm(1133,701,.9));
// Barangay hub with subtle solar architecture.
parts.push(`<g transform="translate(729 605)">${block(0,0,118,80,90,'#bba9b0','#6a6786','#8b7d9e')}${poly('-92,-53 5,-132 135,-69 38,-26','#5e577d')}${poly('5,-132 28,-100 135,-69 38,-26','#85779f')}${poly('19,-111 91,-78 68,-62 -4,-95','#3d6486')}${poly('23,-106 81,-79 67,-69 8,-95','#6c9fb6')}${rect(-49,-37,20,29,'#ffd393')}${rect(-17,-22,18,29,'#ffd393')}${poly('48,-17 68,-26 68,22 48,32','#e7b579')}<path d="M-65 -54L24 -12V2L-65 -40Z" fill="#302c51"/><text x="-53" y="-41" transform="rotate(25 -53 -41)" fill="#f3daa7" font-size="8">BARANGAY PEDROVERSE</text></g>`);
parts.push(house(552,688,1.05),house(850,748,.8,true),palm(375,667,1.1),palm(1005,789,.9));
// Jeepney, cyan light poles, footbridge and village sign.
parts.push(`<g transform="translate(671 707)">${block(0,0,68,28,25,'#e0bf83','#a98083','#c1998d')}${block(3,-24,47,27,18,'#e3c99b','#465e7a','#67939c')}<circle cx="-10" cy="19" r="8" fill="#22293f"/><circle cx="40" cy="41" r="8" fill="#22293f"/>${rect(52,14,8,7,'#ffe6ac')}</g>`);
for(const [x,y] of [[483,625],[901,606],[935,765],[596,754]])parts.push(`<g>${rect(x,y-69,4,69,'#77718d')}${rect(x-6,y-75,16,7,'#95d9d7')}${rect(x-12,y-78,28,14,'#8ef1f3')}<circle cx="${x+2}" cy="${y-71}" r="21" fill="#91e9f0" opacity=".07"/></g>`);
parts.push(`<g transform="translate(1080 590)">${rect(0,0,5,84,'#817797')}${rect(104,0,5,84,'#817797')}${rect(-13,-6,136,35,'#302d50')}${rect(-13,-6,136,3,'#b59acb')}<text x="55" y="9" text-anchor="middle" fill="#f3d291" font-size="11" letter-spacing="2">PEDROVERSE</text><text x="55" y="22" text-anchor="middle" fill="#b2c8de" font-size="6" letter-spacing="1">TECHNOLOGIES</text></g>`);
parts.push('<path d="M178 778l82 35 48-22-82-36z" fill="#b59692"/><path d="M178 778v9l82 35v-9z" fill="#786b86"/><path d="M260 813v9l48-22v-9z" fill="#8d7590"/>');
svg.innerHTML=parts.join('');
}
