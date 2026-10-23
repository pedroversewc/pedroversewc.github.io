import {SCENES} from './scenes.mjs';

// Keep studio artwork unchanged; the homepage owns its decorative day/night sky.
export function islandScene(region){
 const art=SCENES[region]
  .replace(/<circle cx="(?:452|430)"[^>]*\/>/g,'')
  .replace(/<rect x="440" y="96"[^>]*\/>/,'')
  .replace(/<path d="M378 116[^>]*\/>/,'')
  .replace(/<path[^>]*fill="#b7c6d9"[^>]*\/>/,'');
 const sky='<g class="island-stars"><path d="M50 70h4v4h-4zm130 80h4v4h-4zm190-90h4v4h-4zm130 150h4v4h-4zm-230 30h4v4h-4z" fill="#fff0bc"/></g><g class="island-sun"><path d="M440 110h36v8h9v36h-9v8h-36v-8h-9v-36h9z" fill="#ffda6b"/><path d="M453 90h9v13h-9zm0 80h9v13h-9zm-42-38h13v9h-13zm80 0h13v9h-13z" fill="#ffe89c"/></g><g class="island-moon"><path d="M447 108h34v9h10v35h-10v9h-34v-9h-10v-35h10z" fill="#ffedbc"/><path d="M467 108h14v9h10v35h-10v9h-14v-14h-10v-25h10z" fill="#c5c5dc"/></g><g class="island-clouds"><path d="M30 220h25v-14h30v-12h40v12h30v14h25v17H30zM310 80h20V66h30V55h35v11h28v14h25v15H310z" fill="#fff4dc" opacity=".72"/></g>';
 return art.replace(/(<rect width="600" height="650"[^>]*\/>)/,'$1'+sky);
}
