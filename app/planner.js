"use strict";
(function(){

/* ============================================================
   constants
   ============================================================ */
const W = 1000, H = 640;
const KITS = {
  a:{fill:"#EC1C24", text:"#fff", name:"Red"},
  b:{fill:"#2563EB", text:"#fff", name:"Blue"},
  g:{fill:"#F0A63A", text:"#3A2606", name:"Keeper"},
  n:{fill:"#FFFFFF", text:"#15201A", name:"Neutral"}
};
const PITCHES = [
  {id:"full",  label:"Full"},
  {id:"half",  label:"Half"},
  {id:"third", label:"Final third"},
  {id:"area",  label:"Grid area"},
  {id:"box",   label:"Penalty box"}
];
const LINE = "rgba(255,255,255,.86)";
const DARK = "#101A14";

/* LVFC Coaching Methodology - the ten principles this planner is built around */
const PRIN = [
  {id:1,  short:"Ball contact",     name:"Maximum Ball Contact",      line:"70%+ ball rolling time"},
  {id:2,  short:"Repetition",       name:"Repetition Without Repetition", line:"Repeat actions in changing situations"},
  {id:3,  short:"Problem solving",  name:"Problem Solving &amp; Decision Making", line:"The game is the teacher"},
  {id:4,  short:"Creativity",       name:"Creativity &amp; Freedom",      line:"Celebrate brave actions"},
  {id:5,  short:"Competition",      name:"Competition &amp; Scoring",     line:"Competition drives engagement"},
  {id:6,  short:"Active thinking",  name:"Active Thinking",           line:"Scan, react, communicate, solve"},
  {id:7,  short:"Differentiation",  name:"Individual Needs",          line:"Support every player's journey"},
  {id:8,  short:"Organisation",     name:"Structure &amp; Organisation",  line:"Less standing equals more learning"},
  {id:9,  short:"Fun",              name:"Fun &amp; Engagement",          line:"Enjoyment accelerates learning"},
  {id:10, short:"Safe uncertainty", name:"Safe Uncertainty",          line:"Safe enough to try, hard enough to learn"}
];
const PRINBY = Object.fromEntries(PRIN.map(p => [p.id, p]));

/* ---- LVFC quarterly curriculum: the four age groups ---- */
const CURRIC = {
  "U8": {
    label:"Ages 7-8", stage:"Technical Foundation", max:"5v5 maximum",
    obj:"Enjoyment, self-confidence, creativity, motor skills, balance, agility, guided discovery, peer to peer",
    months:[
      {n:1, title:"Ball Mastery & Basics of 1v1s", format:"4v4 max with Neutral Players",
       focus:"Dribbling, turning, basic attacking 1v1s",
       theme:"Build confidence and directness on the ball",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Dribbling & Turning",
         tech:"Ball rolls, dragbacks, in/out hooks, body feints, scissors, stepovers",
         tact:"1v1 attacking, beating a defender with feints and speed change",
         fmt:"4v4 SSGs with dribble-in restarts to maximise touches"},
        {wk:"Weeks 3 & 4", title:"Protecting the Ball",
         tech:"Shielding, turning away from pressure",
         tact:"Basic 1v1 and 2v1 attacking - when to pass, when to dribble",
         fmt:"4v4 / 5v5 directional games"}]},
      {n:2, title:"Shooting & Finishing", format:"4v4 / 5v5 with Neutral Players",
       focus:"Shooting technique, dribble-to-finish",
       theme:"Introduce shooting technique and end product",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Shooting Technique",
         tech:"Laces shooting, side-foot shooting",
         tact:"Recognising shooting opportunities",
         fmt:"Skills-based practice into small finishing games"},
        {wk:"Weeks 3 & 4", title:"Dribble & Turn to Finish",
         tech:"Finishing after skills moves",
         tact:"Turning into goal-scoring actions",
         fmt:"1v1s and 2v2s to small goals"}]},
      {n:3, title:"Receiving & Game Understanding", format:"5v5 with Neutral Players",
       focus:"First touch, receiving in space",
       theme:"Ball control on receiving, preparing for matchday",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Receiving Basics",
         tech:"First touch, orientation, receiving in space",
         tact:"Scanning before receiving",
         fmt:"4v4 / 5v5 possession games"},
        {wk:"Weeks 3 & 4", title:"Playing Forward",
         tech:"Ball control on receiving",
         tact:"Receiving to play forward; simple decision-making under light pressure",
         fmt:"5v5 with neutrals; match week"}]}
    ]},

  "U10": {
    label:"Ages 9-10", stage:"Technical Application", max:"5v5 maximum",
    obj:"Self-confidence, aggression, communication, composure, creativity, resilience, decision making, leadership",
    months:[
      {n:1, title:"Dribbling and Basics of 1v1s", format:"5v5 max with Neutral Players",
       focus:"Dribbling, attacking and defending 1v1s",
       theme:"Confidence and directness in dribbling, with an understanding of 1v1 defending",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Dribbling & Attacking Principles",
         tech:"Close control (inside/outside foot, sole rolls); head up while dribbling; change of direction",
         tact:"1v1 attacking, beating a defender with feints and speed change; encourage creativity, no over-coaching",
         fmt:"5v5 max with Neutral Players"},
        {wk:"Weeks 3 & 4", title:"Protecting the Ball & Defending",
         tech:"Shielding, turning away from pressure",
         tact:"1v1 defending: jockeying, delaying, not diving in; force one direction, towards weaker side",
         fmt:"5v5 max with Neutral Players"}]},
      {n:2, title:"Pass, Move, Finish", format:"5v5 max with Neutral Players",
       focus:"The space-time connection and finishing techniques",
       theme:"Polish off passing and finishing techniques",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Passing & Support Play",
         tech:"Pass and move, do not stand still; angles of support",
         tact:"3v1, 4v1 rondos (start easy); 2v1 attacking decision-making - when to pass vs when to dribble",
         fmt:"2v1 to goal and other overload games"},
        {wk:"Weeks 3 & 4", title:"Creating Space & Finishing",
         tech:"Shooting technique - accuracy over power",
         tact:"Creating space by moving away from defenders; introducing width via wide-zone games",
         fmt:"First-time finishing and 1v1s, 2v2s, 3v3s"}]},
      {n:3, title:"Transitions (Win / Lose the Ball)", format:"5v5, 6v6 or 7v7 with Neutral Players",
       focus:"Counter-attacks and width",
       theme:"Learn to take advantage of space",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Winning or Losing the Ball",
         tech:"Recovery movements after losing the ball",
         tact:"Transition games - rondos converting into counter-attacks; 1v1s with attacker given a headstart",
         fmt:"Attacking direction: go forward whenever possible, recognise space"},
        {wk:"Weeks 3 & 4", title:"Basic Team Shape",
         tech:"Spreading out naturally using the concept of width",
         tact:"Introduction to team shape - not formations, just spacing; freezing during SSGs to show the concept",
         fmt:"5v5 with neutrals; 6v6, 7v7 allowed"}]}
    ]},

  "U12": {
    label:"Ages 11-12", stage:"Game Intelligence", max:"7v7 maximum",
    obj:"Leadership, decision making, creativity, confidence, communication, teamwork, awareness, guided discovery",
    months:[
      {n:1, title:"Dribbling & Individual Ownership", format:"5v5",
       focus:"Dribbling, turning, running with ball, shooting",
       theme:"Ball mastery and confidence in attacking situations",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Dribbling & Turning",
         tech:"Ball rolls, fake shot, roulette, in/out hooks, body feints, scissors and stepovers",
         tact:"1v1 proficiency and confidence in attacking situations",
         fmt:"4v4 SSGs with dribble-in restarts"},
        {wk:"Weeks 3 & 4", title:"Running with Ball & Shooting",
         tech:"Running with ball, laces finishing",
         tact:"Ball control with all surfaces of foot; decision-making in shooting situations",
         fmt:"5v5 / 6v6 directional games"}]},
      {n:2, title:"Passing, Receiving & Unit Play", format:"6v6 / 7v7",
       focus:"Passing and receiving, receiving to target player",
       theme:"Scanning, weight of pass, and playing forward",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Passing & Receiving",
         tech:"First touch, push pass, receiving towards next action",
         tact:"Angles of support; developing the habit of scanning",
         fmt:"6v6 / 7v7 possession games (rondos)"},
        {wk:"Weeks 3 & 4", title:"Receiving for Next Action",
         tech:"Passing into space, wall passes, finishing after receiving, receiving proactively",
         tact:"Weight of pass, understanding receiving angles, improved passing decisions",
         fmt:"7v7 match-play with focus on quick transitions"}]},
      {n:3, title:"Defending, Transition Principles & Team Integration", format:"7v7 / 9v9",
       focus:"Defending 1v1s, defending and transition principles",
       theme:"Defensive principles and decision-making under pressure",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Defending 1v1s",
         tech:"Jockeying, body positioning, blocking passing lanes",
         tact:"Understanding defensive principles; improved 1v1 defending",
         fmt:"6v6 / 7v7 directional defending games"},
        {wk:"Weeks 3 & 4", title:"Defending, Transition Principles & Matchweek",
         tech:"Tackling, 1v1 defending, communication in defensive moments",
         tact:"Attack-to-defence transition games; decision-making under pressure",
         fmt:"Matchweek with conditions (7v7 / 9v9)"}]}
    ]},

  "13+": {
    label:"Ages 13+", stage:"Youth Development Macrocycle", max:"9v9",
    obj:"Leadership, composure, decision making, role responsibility, communication, resilience, tactical understanding, positive regains",
    months:[
      {n:1, title:"Technical Foundation & 1v1 Dominance", format:"5v5",
       focus:"Ball mastery, 1v1 defending",
       theme:"Individual confidence and technical foundation through ball control and 1v1 fundamentals",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Dribbling & Attacking Principles",
         tech:"Ball manipulation in tight spaces; changes of pace and feints to unbalance defenders",
         tact:"1v1 and 2v1 isolation; when to drive into space vs when to protect the ball",
         fmt:"4v4 SSGs with dribble-in restarts to maximise touches"},
        {wk:"Weeks 3 & 4", title:"Defending Principles & Pressing",
         tech:"Body positioning (jockeying), footwork, and the delay phase of defending",
         tact:"Pressing and covering; forcing the attacker away from central areas and winning 1v1 duels",
         fmt:"5v5 / 6v6 directional games focusing on defensive transitions"}]},
      {n:2, title:"Unit Connectivity & Possession", format:"7v7",
       focus:"Creating overloads, compactness",
       theme:"Partnerships in pairs and trios while maintaining possession",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Passing, Receiving & Possession Games",
         tech:"Weight of pass, receiving on the half-turn, first-touch efficiency to play forward",
         tact:"Angles of support; creating passing triangles to bypass opposition lines",
         fmt:"6v6 / 7v7 possession games (rondos) with specific target zones"},
        {wk:"Weeks 3 & 4", title:"Shooting, Receiving & Finishing",
         tech:"Ball striking (power vs placement) and reacting to second balls and rebounds",
         tact:"Movement in the final third; creating overloads (2v1, 3v2) for high-quality chances",
         fmt:"7v7 match-play with a focus on quick transitions to goal"}]},
      {n:3, title:"Tactical Integration & Game Management", format:"9v9",
       focus:"Positive regains, role responsibility",
       theme:"Larger format with defined positions, spatial awareness and tactical understanding",
       blocks:[
        {wk:"Weeks 1 & 2", title:"Transition & Decision Making",
         tech:"Recovery runs and high-intensity intercepting",
         tact:"The 5-second rule - instant pressure upon losing the ball, vertical play upon winning it",
         fmt:"7v7 high-intensity transition games"},
        {wk:"Weeks 3 & 4", title:"Scanning & Positional Roles",
         tech:"Scanning (head up) and long-range distribution",
         tact:"Spreading the play (width and depth); role responsibilities in a 9v9 system",
         fmt:"9v9 positional games with defined roles"}]}
    ]}
};

/* ---- the three-session weekly cycle ---- */
const DAYS = {
  "mon-thu":{name:"Technical Foundation", short:"Mon / Thu",
    blocks:[["Gamification",10],["Technical (Unopposed)",20],["Tactical (Opposed)",25]]},
  "tue-fri":{name:"SSG Stations", short:"Tue / Fri",
    blocks:[["SSG Station 1",20],["SSG Station 2",20],["SSG Station 3",20]]},
  "wed-sat":{name:"Match Application", short:"Wed / Sat",
    blocks:[["Gamification",10],["Match / Festival Stage",45]]}
};
/* 13+ runs the explicit 60-minute session shape */
const DAYS13 = {
  "mon-thu":{name:"Technical Application", short:"Mon / Thu",
    blocks:[["Arrival Activity",10],["Development Block",30],["Festival Stage",20]]},
  "tue-fri":{name:"Tactical Workshop", short:"Tue / Fri",
    blocks:[["Arrival Activity",10],["Development Block",30],["Festival Stage",20]]},
  "wed-sat":{name:"Festival Stage", short:"Wed / Sat",
    blocks:[["Arrival Activity",10],["Match Play 7v7 / 9v9",50]]}
};
/* ============================================================
   club configuration - what coaches are allowed to choose.
   Defaults are permissive; a locked coach edition overrides them.
   ============================================================ */
const CFG_DEFAULT = {
  club:"LVFC",
  quarterAnchor:1,        // calendar month that starts Month 1 (1=Jan -> Aug is Month 2)
  ages:["U8","U10","U12","13+"],
  days:["mon-thu","tue-fri","wed-sat"],
  practices:null,          // null = all; otherwise an array of allowed practice names
  autoPosition:true,       // derive month / weeks / session from the date
  allowOverride:true,      // may a coach override the derived position?
  lockDurations:false,     // may a coach change block minutes?
  requireFields:false,     // must scoring + differentiation be filled before printing?
  locked:false             // true in a coach edition: settings are read-only
};
let CFG = Object.assign({}, CFG_DEFAULT);

function loadCfg(){
  let baked = null;
  const el = document.getElementById("lvfcCfg");
  if(el){ try{ baked = JSON.parse(el.textContent.trim() || "null"); }catch(_){} }
  if(baked) CFG = Object.assign({}, CFG_DEFAULT, baked);
  if(!CFG.locked){
    try{
      const saved = JSON.parse(localStorage.getItem("lvfc.cfg") || "null");
      if(saved) CFG = Object.assign({}, CFG, saved, {locked:false});
    }catch(_){}
  }
  if(!CFG.ages.length) CFG.ages = CFG_DEFAULT.ages.slice();
  if(!CFG.days.length) CFG.days = CFG_DEFAULT.days.slice();
}
function saveCfg(){
  if(typeof HOOKS.onCfgSaved === "function"){ try{ HOOKS.onCfgSaved(CFG); }catch(_){} }
  if(CFG.locked) return;
  try{ localStorage.setItem("lvfc.cfg", JSON.stringify(CFG)); }catch(_){}
}

/* ---- derive the curriculum position from the session date ---- */
const WEEKDAY_DAY = {1:"mon-thu", 4:"mon-thu", 2:"tue-fri", 5:"tue-fri", 3:"wed-sat", 6:"wed-sat"};
function derive(dateStr){
  const parts = String(dateStr || "").split("-").map(Number);
  if(parts.length !== 3 || !parts[0]) return null;
  const d = new Date(parts[0], parts[1]-1, parts[2]);
  if(isNaN(d)) return null;
  const month = (((d.getMonth() + 1) - CFG.quarterAnchor) % 3 + 3) % 3 + 1;
  const block = d.getDate() <= 14 ? "w12" : "w34";
  const day   = WEEKDAY_DAY[d.getDay()] || null;   // Sunday has no session
  return {month, block, day, weekday:d.getDay()};
}
/* apply the derived position, respecting which days the club actually runs */
function applyDerived(){
  if(!CFG.autoPosition) return;
  const dv = derive(S.date);
  if(!dv) return;
  S.month = dv.month;
  S.block = dv.block;
  if(dv.day && CFG.days.indexOf(dv.day) >= 0 && dayset(S.age)[dv.day]) S.day = dv.day;
}
const DAYNAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const dayset = age => age === "13+" ? DAYS13 : DAYS;
function curr(){
  const c = CURRIC[S.age] || CURRIC.U10;
  const m = c.months[(S.month||1)-1] || c.months[0];
  const b = m.blocks[S.block === "w34" ? 1 : 0];
  return {c, m, b, d: dayset(S.age)[S.day] || dayset(S.age)["mon-thu"]};
}

/* ============================================================
   state
   ============================================================ */
let S = null;           // session
let cur = 0;            // current practice index
let sel = null;         // selected item id
let armed = null;       // {kind:'el', spec} | {kind:'arrow', style} | null
let undoStack = [];
let uid = 1;
const nid = () => "i" + (uid++) + Math.random().toString(36).slice(2,6);

const drill = () => S.drills[cur];

function blankDrill(name){
  return {id:nid(), name:name||"New practice", mins:15, pitch:"area",
          org:"", pts:"", questions:"", scoring:"", diff:"",
          prin:[], rolling:70, items:[]};
}
/* older saved sessions predate the methodology fields - fill them in */
function upgrade(d){
  if(!Array.isArray(d.prin)) d.prin = [];
  ["org","pts","questions","scoring","diff"].forEach(k => { if(typeof d[k] !== "string") d[k] = ""; });
  if(typeof d.rolling !== "number") d.rolling = 70;
  if(d.prog){ d.diff = d.diff || d.prog; delete d.prog; }
  return d;
}
function blankSession(){
  return {
    id:nid(), academy:"LVFC", title:"", age:"U10",
    month:1, block:"w12", day:"mon-thu",
    date:new Date().toISOString().slice(0,10), coach:"",
    drills:[blankDrill("Gamification")]
  };
}

/* ============================================================
   geometry helpers for authoring
   ============================================================ */
const P  = (team,x,y,label) => ({id:nid(),type:"player",team,x,y,label:label||"",s:1,r:0});
const B  = (x,y)            => ({id:nid(),type:"ball",x,y,s:1,r:0});
const C  = (x,y)            => ({id:nid(),type:"cone",x,y,s:1,r:0});
const D  = (x,y)            => ({id:nid(),type:"disc",x,y,s:1,r:0});
const M  = (x,y)            => ({id:nid(),type:"mann",x,y,s:1,r:0});
const G  = (x,y,r)          => ({id:nid(),type:"goal",x,y,s:1,r:r||0});
const MG = (x,y,r)          => ({id:nid(),type:"minigoal",x,y,s:1,r:r||0});
const Z  = (x,y,w,h)        => ({id:nid(),type:"zone",x,y,w:w,h:h,s:1,r:0});
const T  = (x,y,t)          => ({id:nid(),type:"text",x,y,text:t,s:1,r:0});
const A  = (style,x1,y1,x2,y2) => ({id:nid(),type:"arrow",style,x1,y1,x2,y2});

/* ============================================================
   pitch backdrops
   ============================================================ */
function stripes(){
  let o = "";
  const n = 8, bw = W/n;
  for(let i=0;i<n;i++){
    if(i%2) o += `<rect x="${(i*bw).toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${H}" fill="#35854D"/>`;
  }
  return `<rect x="0" y="0" width="${W}" height="${H}" fill="#2F7A46"/>` + o;
}
function box(x,y,w,h){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
}
function goalPosts(x,dir){
  const gy = H/2, gh = 92, d = 22*dir;
  return `<path d="M${x},${gy-gh/2} L${x+d},${gy-gh/2} L${x+d},${gy+gh/2} L${x},${gy+gh/2}"
    fill="rgba(255,255,255,.12)" stroke="${LINE}" stroke-width="3"/>`;
}
function pitchBG(kind){
  const m = 46, x0 = m, y0 = m, w = W-2*m, h = H-2*m, x1 = x0+w, y1 = y0+h, cy = H/2;
  let g = stripes();

  if(kind === "area"){
    g += `<g opacity=".22" stroke="#fff" stroke-width="1">`;
    for(let x=100;x<W;x+=100) g += `<path d="M${x},40 V${H-40}"/>`;
    for(let y=140;y<H-40;y+=100) g += `<path d="M60,${y} H${W-60}"/>`;
    g += `</g>`;
    g += box(70,60,W-140,H-120);
    return g;
  }
  if(kind === "box"){
    g += box(x0,y0,w,h);
    g += box(x0, cy-190, 300, 380);                    // penalty area
    g += box(x0, cy-92, 110, 184);                     // 6-yard
    g += `<circle cx="${x0+200}" cy="${cy}" r="4.5" fill="${LINE}"/>`;
    g += `<path d="M${x0+300},${cy-72} A 120 120 0 0 0 ${x0+300},${cy+72}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
    g += goalPosts(x0,-1);
    return g;
  }
  if(kind === "third" || kind === "half"){
    const pb = kind === "half" ? 150 : 118;            // penalty box depth
    g += box(x0,y0,w,h);
    g += box(x1-pb, cy-(kind==="half"?150:132), pb, (kind==="half"?300:264));
    g += box(x1-pb*0.36, cy-64, pb*0.36, 128);
    g += `<circle cx="${x1-pb*0.72}" cy="${cy}" r="4.5" fill="${LINE}"/>`;
    g += `<path d="M${x1-pb},${cy-56} A 92 92 0 0 1 ${x1-pb},${cy+56}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
    g += `<path d="M${x0},${y0} V${y1}" stroke="${LINE}" stroke-width="3"/>`;
    if(kind === "half") g += `<path d="M${x0},${cy-96} A 96 96 0 0 1 ${x0},${cy+96}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
    g += goalPosts(x1,1);
    return g;
  }
  // full
  g += box(x0,y0,w,h);
  g += `<path d="M${W/2},${y0} V${y1}" stroke="${LINE}" stroke-width="3"/>`;
  g += `<circle cx="${W/2}" cy="${cy}" r="82" fill="none" stroke="${LINE}" stroke-width="3"/>`;
  g += `<circle cx="${W/2}" cy="${cy}" r="4.5" fill="${LINE}"/>`;
  g += box(x0, cy-150, 132, 300) + box(x1-132, cy-150, 132, 300);
  g += box(x0, cy-62, 46, 124)  + box(x1-46, cy-62, 46, 124);
  g += `<circle cx="${x0+90}" cy="${cy}" r="4.5" fill="${LINE}"/><circle cx="${x1-90}" cy="${cy}" r="4.5" fill="${LINE}"/>`;
  g += `<path d="M${x0+132},${cy-52} A 80 80 0 0 0 ${x0+132},${cy+52}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
  g += `<path d="M${x1-132},${cy-52} A 80 80 0 0 1 ${x1-132},${cy+52}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
  g += goalPosts(x0,-1) + goalPosts(x1,1);
  return g;
}

/* ============================================================
   item renderers
   ============================================================ */
function wavy(x1,y1,x2,y2){
  const dx = x2-x1, dy = y2-y1, len = Math.hypot(dx,dy);
  if(len < 6) return `M${x1},${y1}L${x2},${y2}`;
  const px = -dy/len, py = dx/len, amp = 7.5;
  const n = Math.max(2, Math.round(len/26));
  let d = `M${x1},${y1}`;
  for(let i=1;i<=n;i++){
    const t0=(i-1)/n, t1=i/n, tm=(t0+t1)/2, sg = i%2 ? 1 : -1;
    const cx = x1+dx*tm+px*amp*sg, cy = y1+dy*tm+py*amp*sg;
    d += `Q${cx.toFixed(1)},${cy.toFixed(1)} ${(x1+dx*t1).toFixed(1)},${(y1+dy*t1).toFixed(1)}`;
  }
  return d;
}
const ARROWS = {
  run:     {stroke:DARK, w:4,   dash:"",       head:"hd-dark", label:"Run"},
  pass:    {stroke:DARK, w:4,   dash:"13 9",   head:"hd-dark", label:"Pass"},
  dribble: {stroke:DARK, w:4,   dash:"",       head:"hd-dark", label:"Dribble"},
  shot:    {stroke:"#EC1C24", w:5.5, dash:"",  head:"hd-red",  label:"Shot"}
};

function itemSVG(it, isSel){
  const s = it.s || 1, r = it.r || 0;
  const halo = c => `<circle class="halo" r="${c}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/>`;
  const open = extra =>
    `<g class="it${isSel?" sel":""}" data-id="${it.id}" transform="translate(${it.x.toFixed(1)},${it.y.toFixed(1)}) rotate(${r}) scale(${s})" ${extra||""}>`;

  switch(it.type){
    case "player":{
      const k = KITS[it.team] || KITS.a;
      return open() +
        halo(25) +
        `<ellipse cx="0" cy="20" rx="15" ry="4.5" fill="rgba(0,0,0,.22)"/>` +
        `<circle r="17" fill="${k.fill}" stroke="#12201A" stroke-width="2"/>` +
        `<circle r="17" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1" transform="scale(.82)"/>` +
        (it.label ? `<text y="5.5" text-anchor="middle" font-size="16" font-weight="700"
            font-family="var(--mono)" fill="${k.text}">${esc(it.label)}</text>` : "") +
        `</g>`;
    }
    case "ball":
      return open() + halo(17) +
        `<ellipse cx="0" cy="11" rx="9" ry="3" fill="rgba(0,0,0,.25)"/>` +
        `<circle r="9.5" fill="#fff" stroke="${DARK}" stroke-width="1.6"/>` +
        `<path d="M0,-5 L4.8,-1.5 L3,4.2 L-3,4.2 L-4.8,-1.5 Z" fill="${DARK}"/></g>`;
    case "cone":
      return open() + halo(20) +
        `<ellipse cx="0" cy="12" rx="13" ry="4" fill="rgba(0,0,0,.22)"/>` +
        `<path d="M0,-15 L11,11 L-11,11 Z" fill="#F2761F" stroke="#8A3D08" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<path d="M-6.4,-.5 L6.4,-.5" stroke="rgba(255,255,255,.65)" stroke-width="2.6"/></g>`;
    case "disc":
      return open() + halo(16) +
        `<ellipse rx="13" ry="6" fill="#F5C518" stroke="#8A6A05" stroke-width="1.4"/>` +
        `<ellipse rx="6.5" ry="2.6" fill="rgba(255,255,255,.45)"/></g>`;
    case "mann":
      return open() + halo(24) +
        `<ellipse cx="0" cy="21" rx="11" ry="4" fill="rgba(0,0,0,.22)"/>` +
        `<rect x="-8" y="-8" width="16" height="29" rx="7.5" fill="#586A60" stroke="#26332C" stroke-width="1.6"/>` +
        `<circle cy="-15" r="7" fill="#586A60" stroke="#26332C" stroke-width="1.6"/></g>`;
    case "goal":
    case "minigoal":{
      const w = it.type === "goal" ? 96 : 56, d = it.type === "goal" ? 20 : 14;
      let net = "";
      for(let i=-w/2+8;i<w/2;i+=10) net += `<path d="M${i},0 L${i},${d}" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`;
      for(let j=5;j<d;j+=6) net += `<path d="M${-w/2},${j} L${w/2},${j}" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`;
      return open() + halo(w/2+8) +
        `<rect x="${-w/2}" y="0" width="${w}" height="${d}" fill="rgba(255,255,255,.16)"/>` + net +
        `<path d="M${-w/2},${d} L${-w/2},0 L${w/2},0 L${w/2},${d}" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/></g>`;
    }
    case "zone":{
      const w = it.w || 240, h = it.h || 170;
      return `<g class="it${isSel?" sel":""}" data-id="${it.id}" transform="translate(${it.x},${it.y}) rotate(${r})">` +
        `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="4" fill="rgba(255,232,120,.14)"
           stroke="#FFE878" stroke-width="3" stroke-dasharray="12 8"/>` +
        `<circle class="halo" r="9" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/></g>`;
    }
    case "text":
      return open() + halo(15) +
        `<text text-anchor="middle" y="6" font-size="21" font-weight="700" fill="#fff"
           stroke="rgba(12,24,18,.85)" stroke-width="4.5" paint-order="stroke"
           font-family="var(--sans)">${esc(it.text||"Label")}</text></g>`;
    case "arrow":{
      const cfg = ARROWS[it.style] || ARROWS.run;
      const d = it.style === "dribble" ? wavy(it.x1,it.y1,it.x2,it.y2) : `M${it.x1},${it.y1} L${it.x2},${it.y2}`;
      return `<g class="it${isSel?" sel":""}" data-id="${it.id}">` +
        `<path d="${d}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="${cfg.w+3.5}"
           stroke-linecap="round" ${cfg.dash?`stroke-dasharray="${cfg.dash}"`:""}/>` +
        `<path d="${d}" fill="none" stroke="${cfg.stroke}" stroke-width="${cfg.w}" stroke-linecap="round"
           ${cfg.dash?`stroke-dasharray="${cfg.dash}"`:""} marker-end="url(#${cfg.head})"/>` +
        (isSel ? `<circle cx="${it.x1}" cy="${it.y1}" r="7" fill="#fff" stroke="${DARK}" stroke-width="2"/>
                  <circle cx="${it.x2}" cy="${it.y2}" r="7" fill="#fff" stroke="${DARK}" stroke-width="2"/>` : "") +
        `</g>`;
    }
  }
  return "";
}
function esc(t){
  return String(t).replace(/[&<>"']/g, m =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
const DEFS = `<defs>
  <marker id="hd-dark" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="4.6" markerHeight="4.6"
    orient="auto-start-reverse" markerUnits="strokeWidth">
    <path d="M0,.6 L9.4,5 L0,9.4 L2.2,5 Z" fill="${DARK}"/></marker>
  <marker id="hd-red" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="4.6" markerHeight="4.6"
    orient="auto-start-reverse" markerUnits="strokeWidth">
    <path d="M0,.6 L9.4,5 L0,9.4 L2.2,5 Z" fill="#EC1C24"/></marker>
</defs>`;

function drillSVG(d, selId){
  return DEFS + pitchBG(d.pitch) +
    `<g>` + d.items.map(it => itemSVG(it, it.id === selId)).join("") + `</g>`;
}
function thumbSVG(d){
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${drillSVG(d,null)}</svg>`;
}

/* ============================================================
   practice library
   ============================================================ */
function LIB(){ return [
  {
    name:"Ball Mastery Arrival", fit:["arrival","dribbling"], mins:12, pitch:"area", tag:"Arrival", rolling:95,
    prin:[1,4,9,8],
    org:"A ball each in a 25x25 area. Players move freely from the moment they arrive.\nNo lines, no queue, no waiting - late arrivals just join in.\nCoach calls a skill every 60-90 seconds.",
    pts:"Every player touching a ball constantly\nHead up while dribbling, not staring down\nBravery to try the skill badly first time\nEnergy and noise in the area",
    questions:"Which foot gives you more control there?\nHow do you find space without looking up too late?\nWhat can you try that you have never tried before?",
    scoring:"Free-dribble challenges: count skill reps in 30 seconds, beat your own score second time.",
    diff:"Easier: bigger area, fewer commands.\nHarder: shrink the area, add two defenders trying to kick balls out.",
    items:[
      P("a",240,180,""), B(268,196), P("a",420,150,""), B(448,166),
      P("a",620,190,""), B(648,206), P("a",790,270,""), B(818,286),
      P("a",300,420,""), B(328,436), P("a",520,470,""), B(548,486),
      P("a",700,440,""), B(728,456), P("a",430,320,""), B(458,336),
      T(500,90,"Ball each - no queues")
    ]
  },
  {
    name:"1v1 Creativity Zone", fit:["dribbling","duels"], mins:15, pitch:"area", tag:"Duels", rolling:85,
    prin:[4,10,3,5],
    org:"Three channels side by side. 1v1 in each channel, ball starts with the attacker.\nScore by dribbling through the gate at the far end.\nNew pair goes immediately - continuous, no waiting.",
    pts:"Players attacking at speed, not slowing down\nWillingness to try a skill in a real duel\nDefender side-on, showing one way\nReaction after losing it - do they go again?",
    questions:"What did you see that made you go that way?\nWhen is the best moment to take them on?\nWhat would you try differently next time?",
    scoring:"1 point for getting through the gate. 2 points if you beat them with a skill.\nFirst channel to 5 wins.",
    diff:"Easier: wider channel, defender starts further back.\nHarder: narrow the channel, add a 6-second limit.",
    items:[
      C(180,110), C(820,110), C(180,290), C(820,290), C(180,470), C(820,470), C(180,570), C(820,570),
      P("a",300,190,""), B(330,190), P("b",640,190,""),
      P("a",300,380,""), B(330,380), P("b",640,380,""),
      P("a",300,520,""), B(330,520), P("b",640,520,""),
      A("dribble",350,190,600,175), A("dribble",350,380,600,395)
    ]
  },
  {
    name:"Rondo 5v2", fit:["possession","passing","receiving"], mins:12, pitch:"area", tag:"Possession", rolling:88,
    prin:[2,3,6],
    org:"18x18 square. 5 outside, 2 inside. Two touches.\nDefenders swap in when they win it or force it out - instant restart with a spare ball.",
    pts:"Body open before the ball arrives\nWeight of pass into the back foot\nMovement after passing, not admiring it\nBravery to split the two defenders",
    questions:"Where should you stand so you can see both sides?\nWhat tells you the middle pass is on?\nHow do you make the defender commit?",
    scoring:"10 consecutive passes = 1 point. Splitting the two defenders = 2 points.",
    diff:"Easier: three touches, add a floating player inside.\nHarder: one touch, or go 4v2.",
    items:[
      C(250,150), C(750,150), C(750,490), C(250,490),
      P("a",500,142,"1"), P("a",772,250,"2"), P("a",700,505,"3"), P("a",300,505,"4"), P("a",228,250,"5"),
      P("b",455,300,""), P("b",568,368,""),
      B(505,178),
      A("pass",520,170,760,242), A("pass",782,275,712,478)
    ]
  },
  {
    name:"Four Goal Game", fit:["possession","decisions"], mins:18, pitch:"area", tag:"Game", rolling:92,
    prin:[3,6,5,9],
    org:"30x24 pitch, two mini goals on each end line. 4v4, no keepers.\nEither goal counts - players choose which one to attack.",
    pts:"Heads up to spot the open goal\nSwitching play when one side is crowded\nQuick decisions, not slow build-up\nEveryone involved in both directions",
    questions:"Which goal is easier to score in right now, and why?\nWhat makes the other team shift across?\nWho is free that you did not see?",
    scoring:"1 goal in either net. 2 points if you score within 5 seconds of winning it back.",
    diff:"Easier: add a neutral player who plays for whoever has the ball.\nHarder: two-touch limit.",
    items:[
      MG(120,190,90), MG(120,450,90), MG(880,190,-90), MG(880,450,-90),
      P("a",320,200,""), P("a",320,440,""), P("a",450,320,""), P("a",210,320,""),
      P("b",680,200,""), P("b",680,440,""), P("b",550,320,""), P("b",790,320,""),
      B(480,320),
      A("pass",480,300,700,210), A("run",330,450,520,500)
    ]
  },
  {
    name:"Transition Game 4v4+2", fit:["transition","decisions"], mins:18, pitch:"area", tag:"Transition", rolling:90,
    prin:[2,3,6,5],
    org:"30x24 area. 4v4 with two neutrals who always play for the team in possession.\nWhen the ball goes out, coach serves a new one immediately from the side.",
    pts:"Reaction in the first 3 seconds after turnover\nNeutrals finding the free side quickly\nCounter-pressing straight away\nNo stoppages - the game keeps rolling",
    questions:"What is the first thing you do the moment you lose it?\nWhere is the free player when we win it back?\nHow fast can we go forward before they set?",
    scoring:"1 point per goal. 3 points if you score within 6 seconds of a turnover.",
    diff:"Easier: three neutrals.\nHarder: one neutral, or neutrals limited to one touch.",
    items:[
      MG(110,320,90), MG(890,320,-90),
      P("a",300,200,""), P("a",300,450,""), P("a",440,320,""), P("a",195,320,""),
      P("b",700,200,""), P("b",700,450,""), P("b",560,320,""), P("b",805,320,""),
      P("n",500,130,""), P("n",500,520,""),
      B(470,320),
      A("pass",470,300,500,150), A("run",560,340,420,380)
    ]
  },
  {
    name:"End Zone Game", fit:["receiving","passing","decisions"], mins:18, pitch:"area", tag:"Game", rolling:88,
    prin:[3,6,5,2],
    org:"30x24 pitch with a 3-yard end zone at each end. 4v4.\nScore by passing to a team-mate who receives the ball under control in the end zone.",
    pts:"Runners timing arrival into the end zone\nPlayers scanning before they receive\nPasses played in front of the runner\nDefenders tracking runners, not just the ball",
    questions:"When should you run into the zone - early or late?\nWhat makes the pass into the zone possible?\nWho is watching the runner behind them?",
    scoring:"1 point per controlled receive in the end zone. 2 points if it comes from a first-time pass.",
    diff:"Easier: deeper end zone, unlimited touches.\nHarder: must receive facing forward, or two-touch maximum.",
    items:[
      Z(140,320,150,520), Z(860,320,150,520),
      P("a",340,200,""), P("a",340,450,""), P("a",470,320,""), P("a",250,320,""),
      P("b",660,200,""), P("b",660,450,""), P("b",540,320,""), P("b",760,320,""),
      B(490,320),
      A("pass",500,305,845,240), A("run",680,430,850,380),
      T(140,110,"End zone"), T(860,110,"End zone")
    ]
  },
  {
    name:"Small-Sided Game", fit:["game","decisions"], mins:20, pitch:"area", tag:"Game", rolling:94,
    prin:[5,9,3,10],
    org:"30x24 pitch, mini goals. 4v4, no keepers. Rolling subs every 3 minutes.\nLet it flow - coach within the game rather than stopping it.",
    pts:"Width and depth when we have it\nFirst forward pass when it is on\nPressing as a unit\nPlayers solving it themselves without being told",
    questions:"What did you see just before you played that pass?\nHow could we make more space for ourselves?\nWhat is working, and what needs changing?",
    scoring:"Normal goals count 1. A goal after 5+ passes counts 2. A goal from a first-time finish counts 2.",
    diff:"Easier: add a neutral, widen the pitch.\nHarder: two-touch, or halve the pitch width.",
    items:[
      MG(96,320,90), MG(904,320,-90),
      P("a",300,180,""), P("a",300,460,""), P("a",440,320,""), P("a",190,320,""),
      P("b",700,180,""), P("b",700,460,""), P("b",560,320,""), P("b",812,320,""),
      B(470,320),
      A("pass",470,300,690,190), A("run",320,470,500,520)
    ]
  },
  {
    name:"Finishing Waves", fit:["finishing","dribbling"], mins:18, pitch:"third", tag:"Finishing", rolling:88,
    prin:[1,5,10,9],
    org:"Two lines wide of the box, each with a ball. Server plays in, attacker takes one touch and finishes.\nNext wave goes the moment the ball leaves the last one - keeper stays live.",
    pts:"Shot inside 2 touches\nHead up to find the keeper's position\nLaces through the middle of the ball\nFollow the shot in for rebounds",
    questions:"Where was the keeper before you struck it?\nWhat told you to place it rather than hit it?\nWhich finish felt most repeatable?",
    scoring:"1 point on target, 2 for a goal, 3 for a first-time finish. Best of 10 per pair.",
    diff:"Easier: start closer, no keeper pressure.\nHarder: defender recovering from behind, or one touch only.",
    items:[
      G(954,320,-90), P("g",900,320,"1"),
      P("a",560,150,""), B(590,150), P("a",560,490,""), B(590,490),
      P("a",700,240,""), P("a",700,410,""),
      A("pass",600,158,690,232), A("shot",720,250,930,300),
      A("pass",600,482,690,418), A("shot",720,405,930,345),
      C(520,150), C(520,490)
    ]
  },
  {
    name:"Receiving to Turn", fit:["receiving","passing"], mins:16, pitch:"area", tag:"Receiving", rolling:86,
    prin:[2,3,6,1],
    org:"20x20 area, players in threes. Server, receiver in the middle, defender behind the receiver.\nReceiver checks away, receives on the half turn and plays out the other side. Rotate every 90 seconds.",
    pts:"Scan over the shoulder before it arrives\nFirst touch out of the feet, away from the defender\nBody open, not square to the passer\nHead up immediately after the touch",
    questions:"What did you see behind you before you received?\nWhich foot should take the first touch, and why?\nHow do you make the defender commit early?",
    scoring:"1 point for every clean turn and pass out. Lose it and the defender takes over.",
    diff:"Easier: defender passive.\nHarder: two touches maximum, or a second defender.",
    items:[
      C(180,140), C(820,140), C(180,500), C(820,500),
      P("a",210,320,"S"), B(245,320),
      P("a",500,320,""), P("b",560,320,""),
      P("a",800,320,"T"),
      A("pass",265,320,470,320), A("run",500,270,470,215),
      A("pass",530,300,775,315),
      T(500,150,"Check away, then receive")
    ]
  },
  {
    name:"Defending 1v1 Channels", fit:["defending","duels"], mins:16, pitch:"area", tag:"Defending", rolling:82,
    prin:[3,6,10,5],
    org:"Three channels. Attacker starts with the ball, defender closes from the gate.\nDefender wins by forcing them out or winning it cleanly. Swap every rep.",
    pts:"Close the ground fast, then slow down\nSide-on, showing them one way\nStay on your feet, do not dive in\nWin it and play out, do not just clear it",
    questions:"Which way did you want to send them, and did you?\nWhen do you go to win it rather than delay?\nWhat happens if you rush the last two steps?",
    scoring:"Defender 2 points for winning it, 1 for forcing them out. Attacker 2 for getting through.",
    diff:"Easier: bigger channel, defender starts closer.\nHarder: attacker gets a head start, or 2v1.",
    items:[
      C(180,110), C(820,110), C(180,290), C(820,290), C(180,470), C(820,470), C(180,580), C(820,580),
      P("a",700,190,""), B(672,190), P("b",380,190,""),
      P("a",700,380,""), B(672,380), P("b",380,380,""),
      P("a",700,520,""), P("b",380,520,""),
      A("run",420,190,600,190), A("dribble",650,385,470,400)
    ]
  },
  {
    name:"Shielding Under Pressure", fit:["shielding","dribbling"], mins:14, pitch:"area", tag:"Ball retention", rolling:90,
    prin:[1,10,4,9],
    org:"15x15 area, a ball each for half the group. Ball carriers keep possession under light pressure.\nDefenders try to knock balls out. Swap roles every 90 seconds.",
    pts:"Big body between defender and ball\nArm across, forearm up, staying legal\nHead up scanning for the way out\nTurn out only when the pressure eases",
    questions:"Where should your body be before they arrive?\nWhat tells you the moment to turn away?\nHow do you keep the ball furthest from them?",
    scoring:"Keep it for 20 seconds under pressure = 1 point. Losing it gives the point away.",
    diff:"Easier: bigger area, one defender fewer.\nHarder: shrink the area, defenders work in pairs.",
    items:[
      P("a",300,220,""), B(272,228), P("b",360,200,""),
      P("a",560,180,""), B(588,190), P("b",620,165,""),
      P("a",380,450,""), B(352,458), P("b",440,470,""),
      P("a",680,420,""), B(708,430), P("b",740,400,""),
      C(180,120), C(820,120), C(180,540), C(820,540),
      T(500,90,"Body between, head up")
    ]
  },
  {
    name:"Support Angles 3v1", fit:["passing","possession"], mins:14, pitch:"area", tag:"Passing", rolling:88,
    prin:[2,3,6,8],
    org:"12x12 grids, 3v1 in each. Three attackers keep the ball, one defender presses.\nAttackers must move after every pass - no standing still.",
    pts:"Angle of support, never in the defender's shadow\nPass to the far foot\nMove the moment you have passed\nCommunicate early and clearly",
    questions:"Where should you stand so the passer has two options?\nWhat makes the angle bad?\nHow quickly can you move after passing?",
    scoring:"8 passes in a row = 1 point. Defender wins it and swaps with whoever lost it.",
    diff:"Easier: bigger grid, unlimited touches.\nHarder: two touches, then one.",
    items:[
      C(220,160), C(560,160), C(560,480), C(220,480),
      P("a",250,200,""), B(285,215), P("a",530,200,""), P("a",390,460,""),
      P("b",400,300,""),
      A("pass",310,215,505,205), A("run",250,240,300,330),
      C(640,160), C(940,160), C(640,480), C(940,480),
      P("a",670,200,""), B(700,215), P("a",910,210,""), P("a",790,460,""),
      P("b",790,300,"")
    ]
  }
,
  {
    name:"2v2 Continuous Duels", fit:["duels","dribbling"], mins:15, pitch:"area", tag:"Duels", rolling:86,
    prin:[1,5,10,4],
    org:"20x20 area, mini goal at each end. 2v2.\nAs soon as a goal goes in or the ball leaves, the next pair enters immediately from the side with a new ball.\nWaves keep coming - nobody stands still.",
    pts:"Immediate intensity from the first touch\nCombining with your partner under pressure\nRecovering quickly when the next wave starts\nPlayers still trying skills when tired",
    questions:"When do you go alone and when do you use your partner?\nHow do you defend two players with two?\nWhat changes when you are tired?",
    scoring:"Pair keeps playing while they keep winning. Three wins in a row = champion pair.",
    diff:"Easier: bigger area, longer rest between waves.\nHarder: smaller area, waves every 30 seconds.",
    items:[
      MG(120,320,90), MG(880,320,-90),
      P("a",370,250,""), P("a",370,400,""), B(400,320),
      P("b",630,250,""), P("b",630,400,""),
      P("a",500,90,""), B(530,90), P("b",500,560,""), B(530,560),
      A("dribble",420,320,600,300), A("run",380,410,520,470),
      T(500,45,"Next wave waiting")
    ]
  }
];}

const QUICK = {
  parts:["Ball Mastery Arrival","Rondo 5v2","Small-Sided Game"],
  alt:  ["Ball Mastery Arrival","1v1 Creativity Zone","Four Goal Game"]
};


/* Which practice themes suit the curriculum block currently selected.
   Read from the block's own wording so it stays true to the curriculum. */
function blockThemes(){
  const q = curr();
  const txt = (q.b.title + " " + q.b.tech + " " + q.b.tact + " " + q.m.focus).toLowerCase();
  const hit = (re) => re.test(txt);
  const out = [];
  if(hit(/dribbl|turning|feint|scissor|stepover|ball mastery|manipulat|running with/)) out.push("dribbling");
  if(hit(/shield|protect/))                       out.push("shielding");
  if(hit(/1v1|duel|isolat/))                      out.push("duels");
  if(hit(/shoot|finish|striking|goal-scoring/))   out.push("finishing");
  if(hit(/receiv|first touch|half-turn|control/)) out.push("receiving");
  if(hit(/pass|support|angle|rondo|combinat/))    out.push("passing");
  if(hit(/possess|overload|compact/))             out.push("possession");
  if(hit(/transition|counter|regain|winning|losing/)) out.push("transition");
  if(hit(/defend|jockey|press|tackl|delay/))      out.push("defending");
  if(hit(/scan|decision|awareness|shape|width|role/)) out.push("decisions");
  return out;
}

/* ============================================================
   rendering
   ============================================================ */
const $ = id => document.getElementById(id);
const board = $("board");

function render(){
  board.innerHTML = drillSVG(drill(), sel);
  board.classList.toggle("placing", !!armed && armed.kind === "el");
  board.classList.toggle("drawing", !!armed && armed.kind === "arrow");
  renderCards();
  renderSel();
  renderCheck();
  $("totalMins").textContent = S.drills.reduce((a,d) => a + (+d.mins||0), 0);
}

function renderCards(){
  const c = $("cards");
  c.innerHTML = S.drills.map((d,i) =>
    `<button class="card" data-i="${i}" aria-current="${i===cur}">
      <div class="thumb">${thumbSVG(d)}</div>
      <div class="row"><span class="n">${i+1}</span>
        <span class="nm">${esc(d.name)}</span>
        <span class="mins">${+d.mins||0}'</span></div>
    </button>`).join("") +
    `<button class="addcard" id="addDrill">\uFF0B Add practice</button>`;

  c.querySelectorAll(".card").forEach(b => b.onclick = () => {
    cur = +b.dataset.i; sel = null; syncFields(); render();
  });
  $("addDrill").onclick = () => {
    snap(); S.drills.push(blankDrill("Drill " + (S.drills.length+1)));
    cur = S.drills.length-1; sel = null; syncFields(); render(); save();
  };
}

function renderSel(){
  const body = $("selBody");
  const it = drill().items.find(i => i.id === sel);
  if(!it){
    body.innerHTML = `<p class="sel-none">Nothing selected.<br/>Click an item on the pitch to change its kit, size or angle.</p>`;
    return;
  }
  const names = {player:"Player", ball:"Ball", cone:"Cone", disc:"Marker disc", mann:"Mannequin",
                 goal:"Full goal", minigoal:"Mini goal", zone:"Zone", text:"Label", arrow:"Arrow"};
  const sw = it.type === "player" ? (KITS[it.team]||KITS.a).fill
           : it.type === "arrow" ? (ARROWS[it.style]||ARROWS.run).stroke : "var(--slate)";

  let h = `<div class="sel-head"><span class="swatch" style="background:${sw}"></span>
             <b>${names[it.type]||it.type}</b></div><div class="insp-body">`;

  if(it.type === "player"){
    h += `<div class="ctl-row"><span>Kit</span><div class="kits">` +
      Object.keys(KITS).map(k =>
        `<button class="kit" data-kit="${k}" aria-pressed="${it.team===k}"
           style="background:${KITS[k].fill}" title="${KITS[k].name}"></button>`).join("") +
      `</div></div>
      <div class="field"><label for="pLab">Shirt number or letter</label>
        <input id="pLab" value="${esc(it.label||"")}" maxlength="3" placeholder="optional"/></div>`;
  }
  if(it.type === "text"){
    h += `<div class="field"><label for="tTxt">Label text</label>
            <input id="tTxt" value="${esc(it.text||"")}"/></div>`;
  }
  if(it.type === "arrow"){
    h += `<div class="ctl-row"><span>Type</span><div class="seg">` +
      Object.keys(ARROWS).map(k =>
        `<button data-astyle="${k}" aria-pressed="${it.style===k}">${ARROWS[k].label}</button>`).join("") +
      `</div></div>`;
  } else {
    h += `<div class="ctl-row"><span>Size</span>
            <div class="stepper"><button data-act="s-">\u2212</button><button data-act="s+">\uFF0B</button></div>
          </div>`;
    if(it.type !== "ball"){
      h += `<div class="ctl-row"><span>Angle</span>
              <div class="stepper"><button data-act="r-">\u27F2</button><button data-act="r+">\u27F3</button></div>
            </div>`;
    }
  }
  h += `<button class="btn danger" data-act="del" style="width:100%;justify-content:center">Remove item</button></div>`;
  body.innerHTML = h;

  body.querySelectorAll("[data-kit]").forEach(b => b.onclick = () => {
    snap(); it.team = b.dataset.kit; render(); save();
  });
  body.querySelectorAll("[data-astyle]").forEach(b => b.onclick = () => {
    snap(); it.style = b.dataset.astyle; render(); save();
  });
  const lab = $("pLab");
  if(lab) lab.oninput = () => { it.label = lab.value; board.innerHTML = drillSVG(drill(), sel); save(); };
  const txt = $("tTxt");
  if(txt) txt.oninput = () => { it.text = txt.value; board.innerHTML = drillSVG(drill(), sel); save(); };

  body.querySelectorAll("[data-act]").forEach(b => b.onclick = () => {
    snap();
    const a = b.dataset.act;
    if(a === "s+") it.s = Math.min(2.6, (it.s||1) + .15);
    if(a === "s-") it.s = Math.max(.45, (it.s||1) - .15);
    if(a === "r+") it.r = ((it.r||0) + 15) % 360;
    if(a === "r-") it.r = ((it.r||0) - 15) % 360;
    if(a === "del"){ drill().items = drill().items.filter(x => x.id !== it.id); sel = null; }
    render(); save();
  });
}

/* ============================================================
   palette
   ============================================================ */
function icon(type, team){
  const box = 26;
  const fake = {id:"x", type, team, x:box/2, y:box/2, s:.62, r:0, label:"", w:20, h:14,
                x1:4, y1:20, x2:22, y2:6, style:type === "arrow" ? team : "run"};
  return `<svg width="26" height="26" viewBox="0 0 ${box} ${box}" aria-hidden="true">
    <g transform="scale(1)">${itemSVG(fake,false)}</g></svg>`;
}
function arrowIcon(style){
  const cfg = ARROWS[style];
  const d = style === "dribble" ? wavy(4,20,30,8) : "M4,20 L30,8";
  return `<svg width="34" height="26" viewBox="0 0 36 26" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${cfg.stroke}" stroke-width="${cfg.w*0.75}" stroke-linecap="round"
      ${cfg.dash?`stroke-dasharray="9 6"`:""} marker-end="url(#${cfg.head})"/></svg>`;
}

function buildPalette(){
  const mk = (html, label, spec) =>
    `<button class="tool" data-spec='${JSON.stringify(spec)}' title="${label}">${html}<em>${label}</em></button>`;

  $("palPlayers").innerHTML = Object.keys(KITS).map(k =>
    mk(icon("player",k), KITS[k].name, {kind:"el", type:"player", team:k})).join("");

  $("palKit").innerHTML =
    mk(icon("ball"),     "Ball",      {kind:"el", type:"ball"}) +
    mk(icon("cone"),     "Cone",      {kind:"el", type:"cone"}) +
    mk(icon("disc"),     "Disc",      {kind:"el", type:"disc"}) +
    mk(icon("mann"),     "Mannequin", {kind:"el", type:"mann"}) +
    mk(icon("minigoal"), "Mini goal", {kind:"el", type:"minigoal"}) +
    mk(icon("goal"),     "Full goal", {kind:"el", type:"goal"}) +
    mk(`<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <rect x="3" y="6" width="20" height="14" rx="2" fill="rgba(255,232,120,.3)"
            stroke="#C9A93B" stroke-width="2" stroke-dasharray="4 3"/></svg>`, "Zone", {kind:"el", type:"zone"}) +
    mk(`<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <text x="13" y="19" text-anchor="middle" font-size="17" font-weight="700"
            fill="var(--ink)" font-family="var(--sans)">T</text></svg>`, "Label", {kind:"el", type:"text"});

  $("palArrows").innerHTML = Object.keys(ARROWS).map(k =>
    `<button class="tool wide-t" data-spec='${JSON.stringify({kind:"arrow", style:k})}'
       title="${ARROWS[k].label}">${arrowIcon(k)}<em>${ARROWS[k].label}</em></button>`).join("");

  document.querySelectorAll(".tool[data-spec]").forEach(b => b.onclick = () => {
    const spec = JSON.parse(b.dataset.spec);
    const same = armed && JSON.stringify(armed) === JSON.stringify(spec);
    armed = same ? null : spec;
    sel = null;
    paintTools();
    render();
  });
  $("toolSelect").onclick = () => { armed = null; paintTools(); render(); };

  $("pitchSeg").innerHTML = PITCHES.map(p =>
    `<button data-p="${p.id}">${p.label}</button>`).join("");
  $("pitchSeg").querySelectorAll("button").forEach(b => b.onclick = () => {
    snap(); drill().pitch = b.dataset.p; paintTools(); render(); save();
  });
}
function paintTools(){
  document.querySelectorAll(".tool[data-spec]").forEach(b => {
    const same = armed && JSON.stringify(armed) === b.dataset.spec;
    b.setAttribute("aria-pressed", same ? "true" : "false");
  });
  $("toolSelect").setAttribute("aria-pressed", armed ? "false" : "true");
  $("pitchSeg").querySelectorAll("button").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.p === drill().pitch ? "true" : "false"));
}

/* ============================================================
   pitch interaction
   ============================================================ */
function pt(e){
  const m = board.getScreenCTM();
  if(!m) return {x:0, y:0};
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return {x: Math.max(8, Math.min(W-8, p.x)), y: Math.max(8, Math.min(H-8, p.y))};
}
let drag = null;

board.addEventListener("pointerdown", e => {
  const p = pt(e);
  const hit = e.target.closest(".it");

  // draw a new arrow
  if(armed && armed.kind === "arrow"){
    snap();
    const a = A(armed.style, p.x, p.y, p.x+1, p.y+1);
    drill().items.push(a);
    drag = {mode:"arrow-end", id:a.id};
    try{ board.setPointerCapture(e.pointerId); }catch(_){}
    render();
    return;
  }

  // place a new element
  if(armed && armed.kind === "el" && !hit){
    snap();
    const t = armed.type;
    let it;
    if(t === "player")        it = P(armed.team, p.x, p.y, "");
    else if(t === "zone")     it = Z(p.x, p.y, 240, 170);
    else if(t === "text")     it = T(p.x, p.y, "Label");
    else if(t === "goal")     it = G(p.x, p.y, 0);
    else if(t === "minigoal") it = MG(p.x, p.y, 0);
    else it = {id:nid(), type:t, x:p.x, y:p.y, s:1, r:0};
    drill().items.push(it);
    sel = it.id;
    drag = {mode:"move", id:it.id, dx:0, dy:0};
    try{ board.setPointerCapture(e.pointerId); }catch(_){}
    render(); save();
    return;
  }

  // select / move existing
  if(hit){
    const id = hit.dataset.id;
    const it = drill().items.find(x => x.id === id);
    sel = id;
    snap();
    if(it.type === "arrow"){
      const dStart = Math.hypot(p.x-it.x1, p.y-it.y1);
      const dEnd   = Math.hypot(p.x-it.x2, p.y-it.y2);
      drag = (dStart < 26 || dEnd < 26)
        ? {mode: dEnd <= dStart ? "arrow-end" : "arrow-start", id}
        : {mode:"arrow-move", id, ox:p.x, oy:p.y};
    } else {
      drag = {mode:"move", id, dx: it.x - p.x, dy: it.y - p.y};
    }
    try{ board.setPointerCapture(e.pointerId); }catch(_){}
    render();
    return;
  }

  sel = null;
  render();
});

board.addEventListener("pointermove", e => {
  if(!drag) return;
  const p = pt(e);
  const it = drill().items.find(x => x.id === drag.id);
  if(!it){ drag = null; return; }

  if(drag.mode === "move"){ it.x = p.x + drag.dx; it.y = p.y + drag.dy; }
  else if(drag.mode === "arrow-end"){ it.x2 = p.x; it.y2 = p.y; }
  else if(drag.mode === "arrow-start"){ it.x1 = p.x; it.y1 = p.y; }
  else if(drag.mode === "arrow-move"){
    const ddx = p.x - drag.ox, ddy = p.y - drag.oy;
    it.x1 += ddx; it.y1 += ddy; it.x2 += ddx; it.y2 += ddy;
    drag.ox = p.x; drag.oy = p.y;
  }
  board.innerHTML = drillSVG(drill(), sel);
});

board.addEventListener("pointerup", e => {
  if(!drag) return;
  const it = drill().items.find(x => x.id === drag.id);
  // a tap rather than a drag leaves a zero-length arrow \u2014 give it a usable default
  if(it && it.type === "arrow" && Math.hypot(it.x2-it.x1, it.y2-it.y1) < 12){
    it.x2 = Math.min(W-20, it.x1 + 130); it.y2 = it.y1;
  }
  drag = null;
  try{ board.releasePointerCapture(e.pointerId); }catch(_){}
  render(); save();
});

/* ============================================================
   undo / storage
   ============================================================ */
function snap(){
  undoStack.push(JSON.stringify(S.drills));
  if(undoStack.length > 60) undoStack.shift();
}
function undo(){
  if(!undoStack.length) return toast("Nothing left to undo");
  S.drills = JSON.parse(undoStack.pop());
  if(cur >= S.drills.length) cur = S.drills.length - 1;
  sel = null; syncFields(); render(); save();
}

const KEY = "academy.sessionplanner.v1";
function save(){
  if(typeof HOOKS.onSave === "function"){ try{ HOOKS.onSave(S); }catch(_){} }
  try{
    const all = readAll();
    const i = all.findIndex(x => x.id === S.id);
    if(i >= 0) all[i] = S; else all.push(S);
    localStorage.setItem(KEY, JSON.stringify({sessions: all, last: S.id}));
  }catch(_){}
}
function readAll(){
  try{
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return Array.isArray(raw.sessions) ? raw.sessions : [];
  }catch(_){ return []; }
}

/* ============================================================
   fields
   ============================================================ */
function syncFields(){
  const d = upgrade(drill());
  applyDerived();
  renderAges();
  renderDays();
  $("mTitle").value = S.title; $("mAge").value = S.age;
  $("mMonth").value = S.month; $("mBlock").value = S.block;
  $("mDate").value  = S.date;  $("mCoach").value = S.coach;
  $("mDay").value = S.day;

  // when the position is derived and overrides are switched off, these are read-only
  const lockPos = CFG.autoPosition && !CFG.allowOverride;
  ["mMonth","mBlock","mDay"].forEach(id => { $(id).disabled = lockPos; });
  $("dMins").disabled = !!CFG.lockDurations;

  renderCurric();
  $("dName").value = d.name; $("dMins").value = d.mins;
  $("dOrg").value  = d.org;  $("dPts").value = d.pts;
  $("dQ").value = d.questions; $("dScore").value = d.scoring; $("dDiff").value = d.diff;
  $("dRoll").value = d.rolling; $("rollVal").textContent = d.rolling;
  renderPrin();
  const bl = $("brandLine");
  if(document.activeElement !== bl) bl.textContent = S.academy || CFG.club || "LVFC";
}

function renderAges(){
  const cur0 = S.age;
  $("mAge").innerHTML = CFG.ages.map(a =>
    `<option value="${a}">${esc(CURRIC[a].label)}</option>`).join("");
  if(CFG.ages.indexOf(cur0) < 0) S.age = CFG.ages[0];
  $("mAge").value = S.age;
}

function renderDays(){
  const ds = dayset(S.age);
  const allowed = Object.keys(ds).filter(k => CFG.days.indexOf(k) >= 0);
  const use = allowed.length ? allowed : Object.keys(ds);
  $("mDay").innerHTML = use.map(k =>
    `<option value="${k}">${ds[k].short} - ${esc(ds[k].name)}</option>`).join("");
  if(use.indexOf(S.day) < 0) S.day = use[0];
  $("mDay").value = S.day;
}

function renderCurric(){
  const q = curr();
  const mins = q.d.blocks.reduce((a,b) => a + b[1], 0);
  const dv = derive(S.date);
  let src = "";
  if(CFG.autoPosition && dv){
    const wd = DAYNAMES[dv.weekday];
    src = dv.day
      ? `${wd} ${esc(S.date)} falls in month ${dv.month}, ${dv.block === "w12" ? "weeks 1 &amp; 2" : "weeks 3 &amp; 4"}`
      : `${wd} ${esc(S.date)} is not a session day - pick the session manually`;
    if(dv.day && CFG.days.indexOf(dv.day) < 0) src += ` &middot; ${dayset(S.age)[dv.day].short} is switched off for this club`;
  }
  $("curricRead").innerHTML =
    (src ? `<div class="cr derived"><b>From the date</b><span>${src}</span></div>` : "") +
    `<div class="cr hero"><b>Month ${q.m.n} theme</b><span>${esc(q.m.title)}</span></div>
     <div class="cr"><b>${esc(q.b.wk)}</b><span>${esc(q.b.title)}</span></div>
     <div class="cr"><b>Technical</b><span>${esc(q.b.tech)}</span></div>
     <div class="cr"><b>Tactical</b><span>${esc(q.b.tact)}</span></div>
     <div class="cr"><b>Format</b><span>${esc(q.b.fmt)}</span></div>
     <div class="cr"><b>Month format</b><span>${esc(q.m.format)}</span></div>
     <div class="cr"><b>Key theme</b><span>${esc(q.m.theme)}</span></div>
     <div class="cr"><b>${esc(q.d.short)} shape</b><span>${
        q.d.blocks.map(b => b[1] + "' " + esc(b[0])).join(" &middot; ")} &middot; ${mins} min</span></div>`;
}

/* builds the session the curriculum prescribes for this point in the cycle */
function buildSession(){
  const q = curr();
  snap();
  S.drills = q.d.blocks.map(([name, mins]) => {
    const d = blankDrill(name);
    const arrival = /Gamification|Arrival/i.test(name);
    d.mins = mins;
    // an arrival activity is never the match format - it is a ball each, no queues
    d.org = arrival
      ? "Ball each, free area. No lines and no waiting - late arrivals join straight in.\nCoach calls a "
        + q.b.title.toLowerCase() + " challenge every 60-90 seconds."
      : q.b.fmt + "\n" + q.m.format;
    d.pts = q.b.tech;
    d.questions = "";
    d.scoring = "";
    d.diff = "";
    d.rolling = /Gamification|Arrival/i.test(name) ? 90
              : /Match|Festival|SSG/i.test(name)   ? 88 : 75;
    d.prin = /Gamification|Arrival/i.test(name) ? [1,9,4]
           : /Match|Festival|SSG/i.test(name)   ? [3,5,6,9] : [2,3,1];
    d.pitch = /Match|Festival/i.test(name) ? "full" : "area";

    if(arrival){ d.pts = "Every player on a ball from the first minute\nHead up while moving\nBravery to try it badly first time";
                 d.questions = "Which surface of the foot gives you most control?\nWhat can you try that you have never tried?";
                 d.scoring = "Beat your own count in 30 seconds, then go again."; }
    else if(/Technical/i.test(name)) { d.pts = q.b.tech; d.questions = "What did that touch let you do next?"; }
    else if(/Tactical|Development/i.test(name)) { d.pts = q.b.tact; d.questions = "What did you see before you decided?"; }
    else if(/Match|Festival|SSG/i.test(name))   { d.pts = q.b.tact;
      d.scoring = "Conditioned rule that rewards the weekly theme: " + q.b.title + "."; }
    return d;
  });
  S.title = q.c.label + " " + q.b.title + " - " + q.d.short;
  cur = 0; sel = null; armed = null;
  syncFields(); paintTools(); render(); save();
  toast("Built " + q.d.short + " - " + q.d.blocks.reduce((a,b)=>a+b[1],0) + " min from the curriculum");
}

function renderPrin(){
  const d = drill();
  $("dPrin").innerHTML = PRIN.map(p =>
    `<button class="chip" data-p="${p.id}" aria-pressed="${d.prin.indexOf(p.id) >= 0}"
       title="${p.name} - ${p.line}">${p.short}</button>`).join("");
  $("dPrin").querySelectorAll(".chip").forEach(b => b.onclick = () => {
    const id = +b.dataset.p, i = d.prin.indexOf(id);
    if(i >= 0) d.prin.splice(i,1); else d.prin.push(id);
    renderPrin(); renderCheck(); save();
  });
}

/* ---- the methodology made measurable ---- */
function analyse(){
  const ds = S.drills.map(upgrade);
  const total = ds.reduce((a,d) => a + (+d.mins||0), 0) || 1;

  // weighted ball rolling time across the session
  const roll = Math.round(ds.reduce((a,d) => a + (+d.rolling||0) * (+d.mins||0), 0) / total);

  // Players per ball, read straight off the diagram - but only for practices that claim
  // principle 1 (Maximum Ball Contact). A 4v4 game on one ball is football, not queuing.
  let worst = 0, worstName = "";
  ds.filter(d => d.prin.indexOf(1) >= 0).forEach(d => {
    const pl = d.items.filter(i => i.type === "player" && i.team !== "g").length;
    const bl = d.items.filter(i => i.type === "ball").length;
    if(!pl) return;
    const r = bl ? pl / bl : 99;
    if(r > worst){ worst = r; worstName = d.name; }
  });

  const scored = ds.filter(d => d.scoring.trim()).length;
  const diffed = ds.filter(d => d.diff.trim()).length;
  const asked  = ds.filter(d => d.questions.trim()).length;
  const covered = new Set(); ds.forEach(d => d.prin.forEach(x => covered.add(x)));

  return {total, roll, worst, worstName, scored, diffed, asked, n:ds.length, covered:covered.size};
}

function renderCheck(){
  const a = analyse();
  const row = (ok, label, val, note) =>
    `<div class="chk ${ok?"pass":"warn"}"><span class="dot"></span>
       <span class="cx"><b>${label}</b><em>${note}</em></span><span class="val">${val}</span></div>`;

  let h = "";
  h += row(a.roll >= 70, "Ball rolling time", a.roll + "%",
       a.roll >= 70 ? "Meets the 70% target." : "Below the 70% target - cut standing time.");

  const ppb = a.worst === 0 ? "n/a" : a.worst >= 99 ? "no ball" : (Math.round(a.worst*10)/10) + ":1";
  h += row(a.worst <= 6, "Ball share", ppb,
       a.worst === 0 ? "No practice is tagged Ball contact yet."
       : a.worst >= 99 ? "A Ball contact practice has no ball on the diagram."
       : a.worst <= 6 ? "Ball contact practices give frequent touches."
       : "Too many players per ball in " + esc(a.worstName) + " - few touches each.");

  h += row(a.scored === a.n, "Scoring systems", a.scored + "/" + a.n,
       a.scored === a.n ? "Every practice competes." : "Add a way to compete and score.");

  h += row(a.diffed === a.n, "Differentiation", a.diffed + "/" + a.n,
       a.diffed === a.n ? "Every practice can flex." : "Note an easier and harder version.");

  h += row(a.asked === a.n, "Guided questions", a.asked + "/" + a.n,
       a.asked === a.n ? "Players are led to work it out." : "Add questions rather than instructions.");

  h += row(a.covered >= 6, "Principles covered", a.covered + "/10",
       a.covered >= 6 ? "Good spread across the methodology." : "Tag which principles each practice serves.");

  $("checkBody").innerHTML = h;
}

function bindFields(){
  const bind = (id, fn, redraw) => {
    $(id).addEventListener("input", () => { fn($(id).value); save(); if(redraw) redraw(); });
  };
  bind("mTitle", v => S.title = v);
  bind("mAge",   v => { S.age = v; renderDays(); renderCurric(); });
  bind("mMonth", v => { S.month = +v; renderCurric(); });
  bind("mBlock", v => { S.block = v; renderCurric(); });
  bind("mDay",   v => { S.day = v; renderCurric(); });
  bind("mDate",  v => { S.date = v; applyDerived(); syncFields(); renderCurric(); });
  bind("mCoach", v => S.coach = v);
  bind("dName",  v => drill().name = v, renderCards);
  bind("dMins",  v => { drill().mins = Math.max(0, +v || 0);
                        $("totalMins").textContent = S.drills.reduce((a,d)=>a+(+d.mins||0),0);
                        renderCards(); renderCheck(); });
  bind("dOrg",   v => drill().org = v);
  bind("dPts",   v => drill().pts = v);
  bind("dQ",     v => drill().questions = v, renderCheck);
  bind("dScore", v => drill().scoring = v, renderCheck);
  bind("dDiff",  v => drill().diff = v, renderCheck);
  bind("dRoll",  v => { drill().rolling = +v; $("rollVal").textContent = v; }, renderCheck);

  const bl = $("brandLine");
  bl.addEventListener("input", () => { S.academy = bl.textContent.trim(); save(); });
  bl.addEventListener("blur",  () => {
    if(!bl.textContent.trim()){ bl.textContent = "LVFC"; S.academy = "LVFC"; save(); }
  });
  bl.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); bl.blur(); } });
}

/* ============================================================
   modal + library
   ============================================================ */
function openModal(title, sub, html){
  $("modalTitle").textContent = title;
  $("modalSub").textContent = sub;
  $("modalBody").innerHTML = html;
  $("scrim").hidden = false;
}
const closeModal = () => $("scrim").hidden = true;

function libraryHTML(){
  const q = curr();
  const mins = q.d.blocks.reduce((a,b) => a + b[1], 0);
  const themes = blockThemes();
  const allowed = LIB().map((t,i) => [t,i])
    .filter(([t]) => !CFG.practices || CFG.practices.indexOf(t.name) >= 0);

  const score = (t) => (t.fit || []).filter(f => themes.indexOf(f) >= 0).length;
  const fits    = allowed.filter(([t]) => score(t) > 0)
                         .sort((a,b) => score(b[0]) - score(a[0]));
  const others  = allowed.filter(([t]) => score(t) === 0);

  const card = ([t,i]) => `<button class="tcard" data-lib="${i}">
      <div class="thumb">${thumbSVG({pitch:t.pitch, items:t.items})}</div>
      <div class="tb"><b>${esc(t.name)}</b>
        <em>${esc(t.tag)} &middot; ${t.mins} min &middot; ${t.rolling}% rolling</em>
        <div class="chips" style="margin-top:6px">${
          t.prin.slice(0,3).map(id => `<span class="chip" aria-pressed="false"
            style="cursor:default">${PRINBY[id].short}</span>`).join("")}</div>
      </div>
    </button>`;

  return `<div class="starts">
    <button class="start" data-quick="1">
      <span class="ic"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
        stroke-width="1.8" aria-hidden="true"><path d="M8.6 1.6 3 9h4l-.6 5.4L13 7H9z" stroke-linejoin="round"/></svg></span>
      <span><b>Build the ${esc(q.d.short)} session</b><em>${esc(q.c.label)}, month ${q.m.n},
        ${esc(q.b.wk.toLowerCase())} &mdash; ${esc(q.b.title)}. ${mins} minutes in
        ${q.d.blocks.length} blocks, straight from the curriculum.</em></span>
    </button>
    <button class="start" data-blank="1">
      <span class="ic"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
        stroke-width="1.8" aria-hidden="true"><path d="M8 3.4v9.2M3.4 8h9.2" stroke-linecap="round"/></svg></span>
      <span><b>Start from blank</b><em>An empty pitch. Place players and equipment yourself.</em></span>
    </button>
  </div>` +

  (fits.length ? `<p class="pal-title" style="margin:0 0 9px 2px">
      Suits this week &mdash; ${esc(q.b.title)}</p>
    <div class="tgrid">${fits.map(card).join("")}</div>` : "") +

  (others.length ? `<p class="pal-title" style="margin:${fits.length ? "18px" : "0"} 0 9px 2px">
      ${fits.length ? "Everything else" : "Practices"} &mdash; all game-based, none cone-only</p>
    <div class="tgrid">${others.map(card).join("")}</div>` : "");
}

function adminHTML(){
  const chk = (k,on,label,note) =>
    `<label class="opt"><input type="checkbox" data-cfg="${k}" ${on?"checked":""}/>
      <span><b>${label}</b><em>${note}</em></span></label>`;
  const dayLabels = {"mon-thu":"Mon / Thu","tue-fri":"Tue / Fri","wed-sat":"Wed / Sat"};
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];

  return `<div class="admin">
    <div class="asec">
      <p class="pal-title">Age groups coaches may plan for</p>
      <div class="opts">${Object.keys(CURRIC).map(a =>
        `<label class="opt"><input type="checkbox" data-age="${a}" ${CFG.ages.indexOf(a)>=0?"checked":""}/>
          <span><b>${esc(CURRIC[a].label)}</b><em>${esc(CURRIC[a].stage)}</em></span></label>`).join("")}</div>
    </div>

    <div class="asec">
      <p class="pal-title">Sessions the club runs each week</p>
      <div class="opts">${Object.keys(DAYS).map(d =>
        `<label class="opt"><input type="checkbox" data-day="${d}" ${CFG.days.indexOf(d)>=0?"checked":""}/>
          <span><b>${dayLabels[d]}</b><em>${esc(DAYS[d].name)}</em></span></label>`).join("")}</div>
    </div>

    <div class="asec">
      <p class="pal-title">Curriculum position</p>
      <div class="field" style="max-width:260px;margin-bottom:9px">
        <label for="cfgAnchor">Month 1 of each quarter starts in</label>
        <select id="cfgAnchor">${months.map((m,i) =>
          `<option value="${i+1}" ${CFG.quarterAnchor===i+1?"selected":""}>${m}</option>`).join("")}</select>
      </div>
      <div class="opts">
        ${chk("autoPosition", CFG.autoPosition, "Set position from the date",
              "Month, weeks and session day are read from the session date.")}
        ${chk("allowOverride", CFG.allowOverride, "Let coaches override it",
              "Turn off to lock every coach to the derived position.")}
      </div>
    </div>

    <div class="asec">
      <p class="pal-title">Planning rules</p>
      <div class="opts">
        ${chk("lockDurations", CFG.lockDurations, "Lock block durations",
              "Coaches cannot change the minutes the curriculum sets.")}
        ${chk("requireFields", CFG.requireFields, "Require scoring and differentiation",
              "A session cannot be printed until every block has both.")}
      </div>
    </div>

    <div class="asec">
      <p class="pal-title">Practices in the coach library</p>
      <div class="opts">${LIB().map(t =>
        `<label class="opt"><input type="checkbox" data-prac="${esc(t.name)}"
          ${(!CFG.practices || CFG.practices.indexOf(t.name)>=0)?"checked":""}/>
          <span><b>${esc(t.name)}</b><em>${esc(t.tag)} &middot; ${t.mins} min</em></span></label>`).join("")}</div>
    </div>

    <div class="asec arow">
      <button class="btn primary" id="cfgExport">Export coach edition</button>
      <button class="btn" id="cfgReset">Reset to defaults</button>
      <span class="ahint">The coach edition is a copy of this file with these settings baked in and
        locked. Send it to your coaches - they get exactly these options and cannot change them.</span>
    </div>
  </div>`;
}

function wireAdmin(){
  const b = $("modalBody");
  b.querySelectorAll("[data-cfg]").forEach(el => el.onchange = () => {
    CFG[el.dataset.cfg] = el.checked; saveCfg(); syncFields(); render();
  });
  b.querySelectorAll("[data-age]").forEach(el => el.onchange = () => {
    const a = el.dataset.age, i = CFG.ages.indexOf(a);
    if(el.checked && i < 0) CFG.ages.push(a);
    if(!el.checked && i >= 0) CFG.ages.splice(i,1);
    if(!CFG.ages.length){ CFG.ages.push(a); el.checked = true; toast("Keep at least one age group"); }
    CFG.ages.sort((x,y) => Object.keys(CURRIC).indexOf(x) - Object.keys(CURRIC).indexOf(y));
    saveCfg(); syncFields(); render();
  });
  b.querySelectorAll("[data-day]").forEach(el => el.onchange = () => {
    const d = el.dataset.day, i = CFG.days.indexOf(d);
    if(el.checked && i < 0) CFG.days.push(d);
    if(!el.checked && i >= 0) CFG.days.splice(i,1);
    if(!CFG.days.length){ CFG.days.push(d); el.checked = true; toast("Keep at least one session day"); }
    saveCfg(); syncFields(); render();
  });
  b.querySelectorAll("[data-prac]").forEach(el => el.onchange = () => {
    const all = LIB().map(t => t.name);
    const on = [...b.querySelectorAll("[data-prac]")].filter(x => x.checked).map(x => x.dataset.prac);
    if(!on.length){ el.checked = true; toast("Keep at least one practice"); return; }
    CFG.practices = on.length === all.length ? null : on;
    saveCfg();
  });
  const an = $("cfgAnchor");
  if(an) an.onchange = () => { CFG.quarterAnchor = +an.value; saveCfg(); syncFields(); renderCurric(); };
  const rs = $("cfgReset");
  if(rs) rs.onclick = () => {
    CFG = Object.assign({}, CFG_DEFAULT); saveCfg(); syncFields(); render();
    openModal("Club setup", "Choose exactly what your coaches can pick.", adminHTML()); wireAdmin();
    toast("Settings reset");
  };
  const ex = $("cfgExport");
  if(ex) ex.onclick = exportCoachEdition;
}

/* Writes a copy of this page with the current settings baked in and locked. */
function exportCoachEdition(){
  const board0 = $("board").innerHTML, print0 = $("print").innerHTML,
        cards0 = $("cards").innerHTML, body0 = $("modalBody").innerHTML,
        hid0 = $("scrim").hidden;
  try{
    // strip volatile DOM so the exported file is the clean app, not this session's render
    $("board").innerHTML = ""; $("print").innerHTML = ""; $("cards").innerHTML = "";
    $("modalBody").innerHTML = ""; $("scrim").hidden = true;
    const cfgEl = document.getElementById("lvfcCfg");
    cfgEl.textContent = JSON.stringify(Object.assign({}, CFG, {locked:true}), null, 2);

    const html = "<!doctype html>\n" + document.documentElement.outerHTML;
    const blob = new Blob([html], {type:"text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (CFG.club || "LVFC").replace(/[^\w-]+/g,"-") + "-Session-Planner-Coach-Edition.html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    cfgEl.textContent = JSON.stringify(CFG, null, 2);
    toast("Coach edition downloaded");
  }catch(err){
    toast("Could not export: " + err.message);
  }finally{
    $("board").innerHTML = board0; $("print").innerHTML = print0;
    $("cards").innerHTML = cards0; $("modalBody").innerHTML = body0; $("scrim").hidden = hid0;
    render();
    if(!hid0) wireAdmin();
  }
}

function methodHTML(){
  return `<div class="mlist">` + PRIN.map(p =>
    `<div class="mrow"><span class="mn">${p.id}</span>
      <span><b>${p.name}</b><em>${p.line}</em></span></div>`).join("") + `</div>
    <p style="margin:14px 0 0;font-size:12px;color:var(--slate);line-height:1.6">
      From the LVFC Coaching Methodology. The objective is not to complete practices, but to develop
      adaptable, intelligent, confident and expressive footballers. Every practice in the library is
      game-based &mdash; the methodology rules out robotic cone-only practices.</p>`;
}

function fromLib(t){
  return {id:nid(), name:t.name, mins:t.mins, pitch:t.pitch,
          org:t.org, pts:t.pts, questions:t.questions, scoring:t.scoring, diff:t.diff,
          prin:t.prin.slice(), rolling:t.rolling,
          items: JSON.parse(JSON.stringify(t.items)).map(it => ({...it, id:nid()}))};
}

function wireLibrary(){
  const b = $("modalBody");
  b.querySelectorAll("[data-lib]").forEach(el => el.onclick = () => {
    snap();
    const t = LIB()[+el.dataset.lib];
    if(S.drills.length === 1 && !S.drills[0].items.length) S.drills = [];
    S.drills.push(fromLib(t));
    cur = S.drills.length - 1;
    sel = null; armed = null;
    closeModal(); syncFields(); paintTools(); render(); save();
    toast(`Added \u201C${t.name}\u201D`);
  });
  const q = b.querySelector("[data-quick]");
  if(q) q.onclick = () => { closeModal(); buildSession(); };
  const bl = b.querySelector("[data-blank]");
  if(bl) bl.onclick = () => {
    snap();
    S.drills = [blankDrill("Warm-up")];
    cur = 0; sel = null; armed = null;
    closeModal(); syncFields(); paintTools(); render(); save();
  };
}

function openLoad(){
  const all = readAll();
  if(!all.length){ toast("No saved sessions yet"); return; }
  const html = `<div class="tgrid">` + all.slice().reverse().map(s => {
    const mins = s.drills.reduce((a,d) => a + (+d.mins||0), 0);
    return `<button class="tcard" data-open="${s.id}">
      <div class="thumb">${thumbSVG(s.drills[0] || {pitch:"area", items:[]})}</div>
      <div class="tb"><b>${esc(s.title || "Untitled session")}</b>
        <em>${esc(s.age)} \u00B7 ${esc(s.date)} \u00B7 ${s.drills.length} drills \u00B7 ${mins} min</em></div>
    </button>`;
  }).join("") + `</div>`;
  openModal("Open a session", "Everything you've saved on this device.", html);
  $("modalBody").querySelectorAll("[data-open]").forEach(el => el.onclick = () => {
    const found = readAll().find(x => x.id === el.dataset.open);
    if(!found) return;
    S = found; S.drills.forEach(upgrade); cur = 0; sel = null; armed = null; undoStack = [];
    closeModal(); syncFields(); paintTools(); render();
  });
}

/* ============================================================
   print
   ============================================================ */
function buildPrint(){
  const a = analyse();
  const para = t => esc(t || "-").replace(/\n/g, "<br/>");
  const club = esc(S.academy || "LVFC");

  let h = `<div class="p-head">
      <div><h1>${esc(S.title || "Training session")}</h1>
        <div class="sub">${club} &middot; ${esc(S.age)} &middot; ${esc(S.date)}${S.coach ? " &middot; " + esc(S.coach) : ""}</div>
      </div><div class="tot">${a.total} min</div></div>`;

  const q = curr();
  h += `<div class="p-focus"><b>Curriculum</b>
      ${esc(q.c.label)} &middot; ${esc(q.c.stage)} &middot; Month ${q.m.n}: ${esc(q.m.title)} &middot;
      ${esc(q.b.wk)}: ${esc(q.b.title)} &middot; ${esc(q.d.short)} ${esc(q.d.name)}<br/>
      <b style="margin-top:5px">Technical</b>${esc(q.b.tech)}
      <b style="margin-top:5px">Tactical</b>${esc(q.b.tact)}
      <b style="margin-top:5px">Format</b>${esc(q.b.fmt)}</div>`;

  h += `<div class="p-focus"><b>Methodology check</b>
      Ball rolling time ${a.roll}% (target 70%) &middot;
      scoring systems ${a.scored}/${a.n} &middot;
      differentiation ${a.diffed}/${a.n} &middot;
      guided questions ${a.asked}/${a.n} &middot;
      ${a.covered}/10 principles covered</div>`;

  h += S.drills.map(upgrade).map((d,i) => `<div class="p-drill">
      <div class="p-dh"><span class="n">${i+1}</span><h3>${esc(d.name)}</h3>
        <span class="m">${+d.mins||0} min</span></div>
      <div class="p-body">
        <svg viewBox="0 0 ${W} ${H}">${drillSVG(d,null)}</svg>
        <div class="p-txt">
          <h4>Organisation</h4><p>${para(d.org)}</p>
          ${d.scoring ? `<h4>Scoring</h4><p>${para(d.scoring)}</p>` : ""}
          <h4>What I'm looking for</h4><p>${para(d.pts)}</p>
          ${d.questions ? `<h4>Guided questions</h4><p>${para(d.questions)}</p>` : ""}
          ${d.diff ? `<h4>Differentiation</h4><p>${para(d.diff)}</p>` : ""}
          ${d.prin.length ? `<h4>Principles</h4><p>${d.prin.map(x => PRINBY[x].short).join(", ")}
             &middot; ${d.rolling}% ball rolling</p>` : ""}
        </div>
      </div></div>`).join("");

  h += `<div class="p-foot"><span>${club} Coaching Methodology &middot; session plan</span>
        <span>${S.drills.length} practices &middot; ${a.total} minutes</span></div>`;
  $("print").innerHTML = h;
}

/* ============================================================
   misc
   ============================================================ */
let tt;
function toast(msg){
  const el = $("toast");
  el.textContent = msg; el.classList.add("on");
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove("on"), 2200);
}

function wireChrome(){
  $("btnTemplates").onclick = () => {
    openModal("Practice library", "Pick a practice \u2014 it drops in fully set up, with coaching points already written.", libraryHTML());
    wireLibrary();
  };
  $("btnBuild").onclick = buildSession;
  $("btnSetup").onclick = () => {
    if(CFG.locked){
      openModal("Club setup", "This is a coach edition - settings are fixed by the club.",
        `<p style="font-size:13px;line-height:1.6;color:var(--slate);margin:0">
          This copy was issued by ${esc(CFG.club || "the club")} with fixed options:
          <b>${CFG.ages.map(a => esc(CURRIC[a].label)).join(", ")}</b>,
          sessions <b>${CFG.days.join(", ")}</b>,
          position ${CFG.autoPosition ? "set from the date" : "chosen manually"}${
            CFG.autoPosition && !CFG.allowOverride ? " and locked" : ""}.
          Ask your Head of Coaching for a different edition.</p>`);
      return;
    }
    openModal("Club setup", "Choose exactly what your coaches can pick.", adminHTML());
    wireAdmin();
  };
  $("btnMethod").onclick = () =>
    openModal("LVFC Coaching Methodology",
      "The ten principles every session is planned against.", methodHTML());
  $("btnCloseModal").onclick = closeModal;
  $("scrim").onclick = e => { if(e.target === $("scrim")) closeModal(); };
  $("btnLoad").onclick = openLoad;
  $("btnSave").onclick = () => { save(); toast("Session saved"); };
  $("btnPrint").onclick = () => {
    if(CFG.requireFields){
      const bad = S.drills.map(upgrade)
        .filter(d => !d.scoring.trim() || !d.diff.trim())
        .map(d => d.name);
      if(bad.length){
        toast("Add scoring and differentiation first: " + bad.join(", "));
        return;
      }
    }
    buildPrint(); setTimeout(() => window.print(), 60);
  };
  $("btnUndo").onclick = undo;
  $("btnClear").onclick = () => {
    if(!drill().items.length) return;
    snap(); drill().items = []; sel = null; render(); save(); toast("Pitch cleared \u2014 undo if that was a mistake");
  };
  $("btnDup").onclick = () => {
    snap();
    const d = JSON.parse(JSON.stringify(drill()));
    d.id = nid(); d.name += " (copy)";
    d.items = d.items.map(it => ({...it, id:nid()}));
    S.drills.splice(cur+1, 0, d); cur++;
    syncFields(); render(); save();
  };
  $("btnDelDrill").onclick = () => {
    if(S.drills.length === 1) return toast("A session needs at least one drill");
    snap(); S.drills.splice(cur,1);
    cur = Math.max(0, cur-1); sel = null; syncFields(); render(); save();
  };
  const move = dir => {
    const j = cur + dir;
    if(j < 0 || j >= S.drills.length) return;
    snap();
    [S.drills[cur], S.drills[j]] = [S.drills[j], S.drills[cur]];
    cur = j; render(); save();
  };
  $("btnLeft").onclick  = () => move(-1);
  $("btnRight").onclick = () => move(1);

  window.addEventListener("beforeprint", buildPrint);

  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if((e.key === "Delete" || e.key === "Backspace") && sel && !typing){
      e.preventDefault(); snap();
      drill().items = drill().items.filter(x => x.id !== sel);
      sel = null; render(); save();
    }
    if(e.key === "Escape"){
      if(!$("scrim").hidden) closeModal();
      else { sel = null; armed = null; paintTools(); render(); }
    }
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing){ e.preventDefault(); undo(); }
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s"){ e.preventDefault(); save(); toast("Session saved"); }
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p"){ buildPrint(); }
  });
}

/* ============================================================
   boot
   ============================================================ */
function init(){
  const all = readAll();
  let stored = null;
  try{
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    stored = all.find(x => x.id === raw.last) || all[all.length-1] || null;
  }catch(_){}

  loadCfg();
  S = stored || blankSession();
  S.drills.forEach(upgrade);
  if(!CURRIC[S.age]) S.age = "U10";
  if(!S.month) S.month = 1;
  if(!S.block) S.block = "w12";
  if(!S.day || !dayset(S.age)[S.day]) S.day = "mon-thu";
  buildPalette();
  bindFields();
  wireChrome();
  syncFields();
  paintTools();
  render();

  if(!stored){
    openModal("Start a session", "Two ways in \u2014 build a full session in one click, or start from a blank pitch.", libraryHTML());
    wireLibrary();
  }
}

/* ---- interface for the cloud layer (auth, sync, club settings) ---- */
const HOOKS = { onSave:null, onCfgSaved:null };
window.Planner = {
  hooks: HOOKS,
  render, syncFields, save, toast, openModal, closeModal,
  libraryHTML, wireLibrary, adminHTML, wireAdmin, methodHTML,
  blankSession, upgrade, thumbSVG, drillSVG, buildPrint,
  getS:   () => S,
  setS:   (x) => { S = upgradeSession(x); cur = 0; sel = null; undoStack = []; syncFields(); render(); },
  getCFG: () => CFG,
  setCFG: (c) => { CFG = Object.assign({}, CFG_DEFAULT, c || {}); syncFields(); render(); },
  reset:  () => { S = blankSession(); cur = 0; sel = null; undoStack = []; syncFields(); render(); }
};
function upgradeSession(x){
  const s = Object.assign(blankSession(), x || {});
  if(!Array.isArray(s.drills) || !s.drills.length) s.drills = [blankDrill("Gamification")];
  s.drills.forEach(upgrade);
  if(!CURRIC[s.age]) s.age = CFG.ages[0] || "U10";
  return s;
}

init();

})();
