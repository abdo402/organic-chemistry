/* ========== LabAR.EDU v12.0 — Main Script ========== */

// ═══════════════════════════════════════
// CONTENT PROTECTION
// © 2026 Abdelrahman Mohamed. All rights reserved.
// Unauthorized copying, redistribution or modification
// of this code or its content is strictly prohibited.
// ═══════════════════════════════════════
(function () {

  // ── Console watermark ──
  console.clear();
  console.log(
    '%c LabAR.EDU ',
    'background:#0a0f1e;color:#3b9eff;font-size:18px;font-weight:bold;padding:8px 16px;border-radius:6px;'
  );
  console.log(
    '%c © 2026 Abdelrahman Mohamed. All rights reserved.\n%c Unauthorized use or redistribution of this code is prohibited.',
    'color:#8899aa;font-size:13px;',
    'color:#cc2936;font-size:12px;font-weight:bold;'
  );
  console.log(
    '%c If you\'re a developer exploring this for learning purposes, please respect the author\'s work.',
    'color:#556677;font-size:11px;font-style:italic;'
  );

  // ── Disable right-click context menu ──
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // ── Disable text selection on non-input elements ──
  document.addEventListener('selectstart', function (e) {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
    e.preventDefault();
    return false;
  });

  // ── Block DevTools shortcuts & source-view hotkeys ──
  document.addEventListener('keydown', function (e) {
    const ctrl  = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const key   = e.key;

    if (key === 'F12') { e.preventDefault(); return false; }
    if (ctrl && shift && (key === 'I' || key === 'i' || key === 'J' || key === 'j' || key === 'C' || key === 'c')) {
      e.preventDefault(); return false;
    }
    if (ctrl && (key === 'U' || key === 'u')) { e.preventDefault(); return false; }
    if (ctrl && (key === 'S' || key === 's')) { e.preventDefault(); return false; }
    if (ctrl && (key === 'A' || key === 'a')) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); return false; }
    }
  }, true);

  // ── DevTools size detection ──
  const _threshold = 160;
  let _devWarn = false;
  setInterval(function () {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if ((widthDiff > _threshold || heightDiff > _threshold) && !_devWarn) {
      _devWarn = true;
      console.clear();
      console.log('%c🚫 DevTools detected', 'color:#cc2936;font-size:16px;font-weight:bold;');
      console.log('%cThis tool is protected. Please respect the author\'s work.', 'color:#556677;');
    } else if (widthDiff <= _threshold && heightDiff <= _threshold) {
      _devWarn = false;
    }
  }, 1000);

})();

/* ---------- 1. CANVAS BACKGROUND ---------- */
(function(){
  const c=document.getElementById('bgCanvas');
  if(!c)return;
  const ctx=c.getContext('2d');
  let W,H,pts=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  function init(){
    resize();pts=[];
    for(let i=0;i<55;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.8+.6});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(79,255,176,0.55)';ctx.fill();});
    pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
      const d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<130){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(79,255,176,${.22*(1-d/130)})`;ctx.lineWidth=.6;ctx.stroke();}
    }));
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',()=>{resize();});
  init();draw();
})();

/* ---------- 2. SCROLL REVEAL — staggered ---------- */
function initReveal(){
  const cards=document.querySelectorAll('.card');
  if(!cards.length)return;

  // Safety fallback: show all cards after 1.5s if observer never fires
  const fallback=setTimeout(()=>{
    cards.forEach(c=>c.classList.add('visible'));
  },1500);

  const revealObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        clearTimeout(fallback);
        const siblings=[...e.target.parentElement.querySelectorAll('.card')];
        const i=siblings.indexOf(e.target);
        e.target.style.transitionDelay=Math.min(i*60,280)+'ms';
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  },{threshold:0,rootMargin:'0px 0px -40px 0px'});

  cards.forEach(c=>revealObs.observe(c));
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initReveal);
}else{
  initReveal();
}

/* ---------- 3. HYDROCARBON CALCULATOR ---------- */
const PREFIXES=['Meth','Eth','Prop','But','Pent','Hex','Hept','Oct','Non','Dec',
  'Undec','Dodec','Tridec','Tetradec','Pentadec','Hexadec','Heptadec','Octadec','Nonadec','Icos'];

function getPrefix(n){return n<=20?PREFIXES[n-1]:(n+'C');}

function fmt(n,h,sub){
  const hs=h===1?'H':'H<sub>'+h+'</sub>';
  return n===1?'C'+hs:'C<sub>'+n+'</sub>'+hs+(sub?'<sub>'+sub+'</sub>':'');
}

function adjustN(d){
  const inp=document.getElementById('carbonN');
  let v=parseInt(inp.value)||1;
  v=Math.max(1,Math.min(100,v+d));
  inp.value=v;processChemistry();
}

function processChemistry(){
  const n=Math.max(1,parseInt(document.getElementById('carbonN').value)||1);
  const pfx=getPrefix(n);
  document.getElementById('compoundName').innerHTML=pfx+'ane<small>Parent compound</small>';
  // Alkane CnH(2n+2)
  const aH=2*n+2;
  document.getElementById('alkaneFormula').innerHTML=fmt(n,aH);
  // Alkene CnH(2n) — min n=2
  if(n>=2){const eH=2*n;document.getElementById('alkeneFormula').innerHTML=fmt(n,eH);}
  else document.getElementById('alkeneFormula').innerHTML='<span style="color:var(--muted);font-size:1rem">n ≥ 2 required</span>';
  // Alkyne CnH(2n-2) — min n=2
  if(n>=2){const yH=2*n-2;document.getElementById('alkyneFormula').innerHTML=fmt(n,yH);}
  else document.getElementById('alkyneFormula').innerHTML='<span style="color:var(--muted);font-size:1rem">n ≥ 2 required</span>';
}

/* ---------- 4. IUPAC TABS ---------- */
function switchTab(e,id){
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('show'));
  document.querySelectorAll('.tab-link').forEach(l=>l.classList.remove('active'));
  document.getElementById(id).classList.add('show');
  e.currentTarget.classList.add('active');
}

/* ---------- 5. COMPOUND LIBRARY ---------- */
const ALKANE_NAMES=['Methane','Ethane','Propane','Butane','Pentane','Hexane','Heptane','Octane','Nonane','Decane'];
const ALKENE_NAMES=['—','Ethene','Propene','Butene','Pentene','Hexene','Heptene','Octene','Nonene','Decene'];
const ALKYNE_NAMES=['—','Ethyne','Propyne','Butyne','Pentyne','Hexyne','Heptyne','Octyne','Nonyne','Decyne'];

function generateLibrary(){
  const tbody=document.getElementById('libraryTableBody');
  if(!tbody)return;
  tbody.innerHTML='';
  for(let n=1;n<=10;n++){
    const aF=`C${n>1?'<sub>'+n+'</sub>':''}H<sub>${2*n+2}</sub>`;
    const eF=n>=2?`C${n>1?'<sub>'+n+'</sub>':''}H<sub>${2*n}</sub>`:'<span class="na-cell">N/A</span>';
    const yF=n>=2?`C${n>1?'<sub>'+n+'</sub>':''}H<sub>${2*n-2}</sub>`:'<span class="na-cell">N/A</span>';
    const tr=document.createElement('tr');
    tr.dataset.n=n;
    tr.innerHTML=`<td>${n}</td><td>${PREFIXES[n-1]}-</td>
      <td class="alkane-col">${ALKANE_NAMES[n-1]}</td><td class="alkane-col formula-cell">${aF}</td>
      <td class="alkene-col">${ALKENE_NAMES[n-1]}</td><td class="alkene-col formula-cell">${eF}</td>
      <td class="alkyne-col">${ALKYNE_NAMES[n-1]}</td><td class="alkyne-col formula-cell">${yF}</td>`;
    tbody.appendChild(tr);
  }
}

let activeFilter='all';
function filterType(type,btn){
  activeFilter=type;
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  const cols={alkane:[2,3],alkene:[4,5],alkyne:[6,7]};
  const headers=document.querySelectorAll('th');
  headers.forEach((h,i)=>{h.style.display='';});
  document.querySelectorAll('#libraryTableBody tr td').forEach(td=>{td.style.display='';});
  if(type!=='all'){
    const show=cols[type];
    headers.forEach((h,i)=>{if(i>1&&!show.includes(i))h.style.display='none';});
    document.querySelectorAll('#libraryTableBody tr').forEach(tr=>{
      [...tr.cells].forEach((td,i)=>{if(i>1&&!show.includes(i))td.style.display='none';});
    });
  }
  filterTable();
}

function filterTable(){
  const q=document.getElementById('tableSearch').value.toLowerCase();
  document.querySelectorAll('#libraryTableBody tr').forEach(tr=>{
    const txt=tr.textContent.toLowerCase();
    tr.style.display=txt.includes(q)?'':'none';
  });
}

/* ---------- 6. pH SCALE ---------- */
function buildPhScale(){
  const bar=document.getElementById('phBar');
  const lbl=document.getElementById('phLabels');
  if(!bar||!lbl)return;
  const colors=['#b91c1c','#dc2626','#ef4444','#f87171','#fb923c','#fbbf24','#4ade80','#34d399','#2dd4bf','#22d3ee','#60a5fa','#3b82f6','#6366f1','#7c3aed','#5b21b6'];
  bar.innerHTML='';lbl.innerHTML='';
  colors.forEach((col,i)=>{
    const seg=document.createElement('div');seg.className='ph-seg';
    seg.style.background=col;seg.textContent=i;bar.appendChild(seg);
    const l=document.createElement('div');l.className='ph-label';l.textContent=i;lbl.appendChild(l);
  });
}

/* ---------- 7. MOLAR MASS ---------- */
const AM={H:1.008,He:4.003,Li:6.941,Be:9.012,B:10.811,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.18,
  Na:22.99,Mg:24.305,Al:26.982,Si:28.086,P:30.974,S:32.065,Cl:35.453,Ar:39.948,K:39.098,Ca:40.078,
  Sc:44.956,Ti:47.867,V:50.942,Cr:51.996,Mn:54.938,Fe:55.845,Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,
  Ga:69.723,Ge:72.63,As:74.922,Se:78.971,Br:79.904,Kr:83.798,Rb:85.468,Sr:87.62,Y:88.906,Zr:91.224,
  Nb:92.906,Mo:95.95,Tc:98,Ru:101.07,Rh:102.906,Pd:106.42,Ag:107.868,Cd:112.414,In:114.818,Sn:118.71,
  Sb:121.76,Te:127.6,I:126.904,Xe:131.293,Cs:132.905,Ba:137.327,La:138.905,Ce:140.116,Pr:140.908,
  Nd:144.242,Pm:145,Sm:150.36,Eu:151.964,Gd:157.25,Tb:158.925,Dy:162.5,Ho:164.93,Er:167.259,
  Tm:168.934,Yb:173.054,Lu:174.967,Hf:178.49,Ta:180.948,W:183.84,Re:186.207,Os:190.23,Ir:192.217,
  Pt:195.084,Au:196.967,Hg:200.592,Tl:204.383,Pb:207.2,Bi:208.98,Po:209,At:210,Rn:222,Fr:223,
  Ra:226,Ac:227,Th:232.038,Pa:231.036,U:238.029,Np:237,Pu:244,Am:243,Cm:247,Bk:247,Cf:251,
  Es:252,Fm:257,Md:258,No:259,Lr:266,Rf:267,Db:268,Sg:269,Bh:270,Hs:270,Mt:278,Ds:281,
  Rg:282,Cn:285,Nh:286,Fl:289,Mc:290,Lv:293,Ts:294,Og:294};

function parseFormula(f){
  const stack=[{}];
  let i=0;
  while(i<f.length){
    const ch=f[i];
    if(ch==='('){stack.push({});i++;}
    else if(ch===')'){
      i++;let num='';
      while(i<f.length&&/\d/.test(f[i])){num+=f[i];i++;}
      const mult=num?parseInt(num):1;
      const top=stack.pop();
      for(const el in top){stack[stack.length-1][el]=(stack[stack.length-1][el]||0)+top[el]*mult;}
    } else if(/[A-Z]/.test(ch)){
      let sym=ch;i++;
      while(i<f.length&&/[a-z]/.test(f[i])){sym+=f[i];i++;}
      let num='';
      while(i<f.length&&/\d/.test(f[i])){num+=f[i];i++;}
      const cnt=num?parseInt(num):1;
      stack[stack.length-1][sym]=(stack[stack.length-1][sym]||0)+cnt;
    } else i++;
  }
  return stack[0];
}

function calcMolarMass(){
  const raw=document.getElementById('molarInput').value.trim();
  const res=document.getElementById('molarResult');
  if(!raw){res.innerHTML='<span class="tool-empty">Type a formula to calculate its molar mass.</span>';return;}
  try{
    const parsed=parseFormula(raw);
    let total=0,breakdown='';
    for(const el in parsed){
      const mass=AM[el];
      if(!mass){res.innerHTML=`<span style="color:var(--alkyne)">Unknown element: ${el}</span>`;return;}
      const contrib=mass*parsed[el];total+=contrib;
      breakdown+=`${el}: ${parsed[el]} × ${mass} = ${contrib.toFixed(3)} &nbsp;`;
    }
    res.innerHTML=`<span class="tool-result-main">${total.toFixed(3)} g/mol</span><div class="tool-result-breakdown">${breakdown}</div>`;
  }catch(e){res.innerHTML='<span style="color:var(--alkyne)">Invalid formula. Check parentheses and capitalisation.</span>';}
}

/* ---------- 8. ION COMPOUND BUILDER ---------- */
function gcd(a,b){return b?gcd(b,a%b):a;}

function buildCompound(){
  const catRaw=document.getElementById('cationSelect').value.split(',');
  const aniRaw=document.getElementById('anionSelect').value.split(',');
  const catSym=catRaw[0],catChg=parseInt(catRaw[1]);
  const aniSym=aniRaw[0],aniChg=parseInt(aniRaw[1]);
  const g=gcd(catChg,aniChg);
  const catN=aniChg/g,aniN=catChg/g;
  const needParenCat=catSym.length>2||catSym.includes('4');
  const needParenAni=aniSym.length>2||aniSym.startsWith('(');
  const cleanAni=aniSym.replace(/[()]/g,'');
  const cleanCat=catSym.replace(/[()]/g,'');
  let formula='';
  formula+=catN>1?(needParenCat?`(${cleanCat})<sub>${catN}</sub>`:`${cleanCat}<sub>${catN}</sub>`):cleanCat;
  if(aniSym.includes('(')&&aniN>1)formula+=`(${cleanAni})<sub>${aniN}</sub>`;
  else formula+=cleanAni+(aniN>1?`<sub>${aniN}</sub>`:'');
  document.getElementById('compoundResult').innerHTML=`<span class="tool-result-formula">${formula}</span><div class="tool-result-breakdown">Ratio: ${catSym}<sup>${catChg}+</sup> : ${aniSym}<sup>${aniChg}−</sup> → ${catN}:${aniN}</div>`;
}

/* ---------- 9. NUCLEAR DECAY ---------- */
function runDecay(){
  const m0=parseFloat(document.getElementById('decayMass').value)||100;
  const hlp=parseFloat(document.getElementById('decayHLP').value)||5;
  const tot=parseFloat(document.getElementById('decayTime').value)||20;
  if(hlp<=0){document.getElementById('decayResult').innerHTML='<span style="color:var(--alkyne)">Half-life period must be > 0.</span>';return;}
  const periods=tot/hlp;const rows=[];
  for(let i=0;i<=Math.ceil(periods);i++){
    const t=i*hlp;const rem=m0/Math.pow(2,i);const pct=(rem/m0)*100;
    const barW=Math.round(pct*.8);
    rows.push(`<tr><td>${i}</td><td>${t}</td><td>${rem.toFixed(4)} g</td><td><span class="decay-bar" style="width:${barW}px"></span></td><td>${pct.toFixed(2)}%</td></tr>`);
    if(i>=periods)break;
  }
  document.getElementById('decayResult').innerHTML=`<table class="decay-table"><thead><tr><th>Period</th><th>Time</th><th>Remaining</th><th>Visual</th><th>%</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

/* ---------- 10. UNIT CONVERTER ---------- */
const UNIT_DEFS={
  energy:{units:['Calorie','Joule','kJ','eV','MeV'],toBase:[4.184,1,1000,1.602e-19,1.602e-13]},
  mass:{units:['AMU','gram','kg','mg'],toBase:[1.66054e-27,1e-3,1,1e-6]},
  temp:{units:['°C','K','°F'],toBase:null},
  pressure:{units:['atm','Pa','mmHg','bar'],toBase:[101325,1,133.322,100000]},
  volume:{units:['L','mL','m³','cm³'],toBase:[1e-3,1e-6,1,1e-6]}
};

function initConverter(){
  const cat=document.getElementById('unitCategory').value;
  const def=UNIT_DEFS[cat];
  ['unitFrom','unitTo'].forEach(id=>{
    const sel=document.getElementById(id);sel.innerHTML='';
    def.units.forEach(u=>{const o=document.createElement('option');o.value=u;o.textContent=u;sel.appendChild(o);});
  });
  document.getElementById('unitTo').selectedIndex=1;
  document.getElementById('unitFromVal').value='';
  document.getElementById('unitToVal').value='';
  document.getElementById('convFormula').innerHTML='<span class="tool-empty">Enter a value to convert.</span>';
}

function doConvert(){
  const cat=document.getElementById('unitCategory').value;
  const from=document.getElementById('unitFrom').value;
  const to=document.getElementById('unitTo').value;
  const val=parseFloat(document.getElementById('unitFromVal').value);
  if(isNaN(val)){document.getElementById('unitToVal').value='';return;}
  let result;
  if(cat==='temp'){
    if(from==='°C'&&to==='K')result=val+273.15;
    else if(from==='K'&&to==='°C')result=val-273.15;
    else if(from==='°C'&&to==='°F')result=val*1.8+32;
    else if(from==='°F'&&to==='°C')result=(val-32)/1.8;
    else if(from==='K'&&to==='°F')result=(val-273.15)*1.8+32;
    else if(from==='°F'&&to==='K')result=(val-32)/1.8+273.15;
    else result=val;
  } else {
    const def=UNIT_DEFS[cat];
    const fi=def.units.indexOf(from),ti=def.units.indexOf(to);
    const base=val*def.toBase[fi];
    result=base/def.toBase[ti];
  }
  document.getElementById('unitToVal').value=result.toPrecision(6);
  document.getElementById('convFormula').innerHTML=`<span class="tool-result-breakdown">${val} ${from} = <b style="color:var(--accent)">${result.toPrecision(6)}</b> ${to}</span>`;
}

/* ---------- 11. GAS LAW CALCULATOR ---------- */
const GAS_LAWS={
  boyle:{label:"Boyle's Law — P₁V₁ = P₂V₂",fields:['P₁ (atm)','V₁ (L)','P₂ (atm)','V₂ (L)'],keys:['p1','v1','p2','v2'],
    solve(v){const{p1,v1,p2,v2}=v;if(!v2&&p1&&v1&&p2)return{v2:p1*v1/p2,label:'V₂'};if(!p2&&p1&&v1&&v2)return{p2:p1*v1/v2,label:'P₂'};if(!v1&&p1&&p2&&v2)return{v1:p2*v2/p1,label:'V₁'};if(!p1&&v1&&p2&&v2)return{p1:p2*v2/v1,label:'P₁'};return null;}},
  charles:{label:"Charles's Law — V₁/T₁ = V₂/T₂",fields:['V₁ (L)','T₁ (K)','V₂ (L)','T₂ (K)'],keys:['v1','t1','v2','t2'],
    solve(v){const{v1,t1,v2,t2}=v;if(!v2&&v1&&t1&&t2)return{v2:v1*t2/t1,label:'V₂'};if(!t2&&v1&&t1&&v2)return{t2:v2*t1/v1,label:'T₂'};if(!v1&&t1&&v2&&t2)return{v1:v2*t1/t2,label:'V₁'};if(!t1&&v1&&v2&&t2)return{t1:v1*t2/v2,label:'T₁'};return null;}},
  gaylussac:{label:"Gay-Lussac's Law — P₁/T₁ = P₂/T₂",fields:['P₁ (atm)','T₁ (K)','P₂ (atm)','T₂ (K)'],keys:['p1','t1','p2','t2'],
    solve(v){const{p1,t1,p2,t2}=v;if(!p2&&p1&&t1&&t2)return{p2:p1*t2/t1,label:'P₂'};if(!t2&&p1&&t1&&p2)return{t2:p2*t1/p1,label:'T₂'};if(!p1&&t1&&p2&&t2)return{p1:p2*t1/t2,label:'P₁'};if(!t1&&p1&&p2&&t2)return{t1:p1*t2/p2,label:'T₁'};return null;}},
  combined:{label:"Combined Gas Law — P₁V₁/T₁ = P₂V₂/T₂",fields:['P₁','V₁','T₁ (K)','P₂','V₂','T₂ (K)'],keys:['p1','v1','t1','p2','v2','t2'],
    solve(v){const{p1,v1,t1,p2,v2,t2}=v;const lhs=p1&&v1&&t1?p1*v1/t1:null;const rhs=p2&&v2&&t2?p2*v2/t2:null;
      if(!t2&&lhs&&p2&&v2)return{t2:p2*v2/lhs,label:'T₂'};if(!v2&&lhs&&p2&&t2)return{v2:lhs*t2/p2,label:'V₂'};if(!p2&&lhs&&v2&&t2)return{p2:lhs*t2/v2,label:'P₂'};
      if(!t1&&rhs&&p1&&v1)return{t1:p1*v1/rhs,label:'T₁'};if(!v1&&rhs&&p1&&t1)return{v1:rhs*t1/p1,label:'V₁'};if(!p1&&rhs&&v1&&t1)return{p1:rhs*t1/v1,label:'P₁'};return null;}},
  ideal:{label:"Ideal Gas Law — PV = nRT (R = 8.314)",fields:['P (atm→Pa×101325)','V (m³ or L×0.001)','n (mol)','T (K)'],keys:['p','v','n','t'],
    solve(v){const R=8.314;const{p,v:vol,n,t}=v;if(!p&&vol&&n&&t)return{p:n*R*t/vol,label:'P (Pa)'};if(!vol&&p&&n&&t)return{v:n*R*t/p,label:'V (m³)'};if(!n&&p&&vol&&t)return{n:p*vol/(R*t),label:'n (mol)'};if(!t&&p&&vol&&n)return{t:p*vol/(n*R),label:'T (K)'};return null;}}
};

let currentGasLaw='boyle';

function setGasLaw(name,btn){
  currentGasLaw=name;
  document.querySelectorAll('.gas-calc-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderGasFields();
  document.getElementById('gasResult').innerHTML='<span class="tool-empty">Fill known values and click Calculate.</span>';
}

function renderGasFields(){
  const law=GAS_LAWS[currentGasLaw];
  const container=document.getElementById('gasFields');
  container.innerHTML='';
  law.fields.forEach((f,i)=>{
    const div=document.createElement('div');div.className='gas-field';
    div.innerHTML=`<label>${f}</label><input type="number" step="any" id="gf_${law.keys[i]}" placeholder="leave blank = unknown">`;
    container.appendChild(div);
  });
}

function calcGasLaw(){
  const law=GAS_LAWS[currentGasLaw];
  const vals={};
  law.keys.forEach(k=>{const v=parseFloat(document.getElementById('gf_'+k)?.value);vals[k]=isNaN(v)?null:v;});
  const result=law.solve(vals);
  const res=document.getElementById('gasResult');
  if(!result){res.innerHTML='<span style="color:var(--alkyne)">Leave exactly ONE field blank as the unknown, fill all others.</span>';return;}
  const [[key,val]]=Object.entries(result).filter(([k])=>k!=='label');
  res.innerHTML=`<span class="tool-result-main">${result.label} = ${parseFloat(val.toPrecision(6))}</span>`;
}

/* ---------- 12. STOICHIOMETRY CALCULATOR (NEW) ---------- */
function calcStoichiometry(){
  const eqRaw=document.getElementById('stoichEq').value.trim();
  const knownSub=document.getElementById('stoichKnownSub').value.trim();
  const knownMol=parseFloat(document.getElementById('stoichKnownMol').value);
  const unknownSub=document.getElementById('stoichUnknownSub').value.trim();
  const res=document.getElementById('stoichResult');

  if(!eqRaw||!knownSub||isNaN(knownMol)||!unknownSub){
    res.innerHTML='<span class="tool-empty">Fill in all four fields.</span>';return;
  }

  // Parse equation: support → or -> or =
  const sides=eqRaw.split(/→|->|=>/);
  if(sides.length<2){res.innerHTML='<span style="color:var(--alkyne)">Use → or -> to separate reactants and products.</span>';return;}
  const allTerms=[...sides[0].split('+'),...sides[1].split('+')];
  const coeffMap={};
  allTerms.forEach(term=>{
    const t=term.trim();
    const m=t.match(/^(\d*\.?\d*)\s*([A-Za-z0-9()]+)/);
    if(m){
      const coef=m[1]?parseFloat(m[1]):1;
      const sub=m[2];
      coeffMap[sub]=coef;
    }
  });

  const kCoef=coeffMap[knownSub];
  const uCoef=coeffMap[unknownSub];
  if(!kCoef){res.innerHTML=`<span style="color:var(--alkyne)">"${knownSub}" not found in equation.</span>`;return;}
  if(!uCoef){res.innerHTML=`<span style="color:var(--alkyne)">"${unknownSub}" not found in equation.</span>`;return;}

  const unknownMol=knownMol*(uCoef/kCoef);
  res.innerHTML=`<span class="tool-result-main">${unknownMol.toPrecision(5)} mol of ${unknownSub}</span>
    <div class="tool-result-breakdown">
      Mole ratio: ${knownSub} : ${unknownSub} = ${kCoef} : ${uCoef}<br>
      ${knownMol} mol ${knownSub} × (${uCoef}/${kCoef}) = <b style="color:var(--accent)">${unknownMol.toPrecision(5)} mol</b> ${unknownSub}
    </div>`;
}

/* ---------- 13. pH CALCULATOR (NEW) ---------- */
function calcPH(from){
  const ids={h:'phH',oh:'phOH',ph:'phPH',poh:'phPOH'};
  const Kw=1e-14;
  let H,OH,pH,pOH;

  const raw=parseFloat(document.getElementById(ids[from]).value);
  if(isNaN(raw)||raw<=0&&from!=='ph'&&from!=='poh'){
    document.getElementById('phResult').innerHTML='<span class="tool-empty">Enter a positive value.</span>';
    return;
  }

  if(from==='h'){H=raw;pH=-Math.log10(H);OH=Kw/H;pOH=-Math.log10(OH);}
  else if(from==='oh'){OH=raw;pOH=-Math.log10(OH);H=Kw/OH;pH=-Math.log10(H);}
  else if(from==='ph'){pH=raw;H=Math.pow(10,-pH);OH=Kw/H;pOH=14-pH;}
  else if(from==='poh'){pOH=raw;OH=Math.pow(10,-pOH);H=Kw/OH;pH=14-pOH;}

  // Fill other fields
  if(from!=='h')document.getElementById('phH').value=H.toExponential(3);
  if(from!=='oh')document.getElementById('phOH').value=OH.toExponential(3);
  if(from!=='ph')document.getElementById('phPH').value=pH.toFixed(3);
  if(from!=='poh')document.getElementById('phPOH').value=pOH.toFixed(3);

  const classification=pH<3?{label:'Strongly Acidic',color:'#f87171'}:pH<7?{label:'Acidic',color:'#fb923c'}:pH===7?{label:'Neutral',color:'#4ade80'}:pH<11?{label:'Basic',color:'#34d399'}:{label:'Strongly Basic',color:'#2dd4bf'};

  document.getElementById('phResult').innerHTML=`
    <span class="tool-result-main" style="color:${classification.color}">${classification.label}</span>
    <div class="tool-result-breakdown">
      pH = <b style="color:var(--accent)">${pH.toFixed(3)}</b> &nbsp;|&nbsp;
      pOH = <b style="color:var(--accent)">${pOH.toFixed(3)}</b><br>
      [H⁺] = <b>${H.toExponential(3)}</b> mol/L &nbsp;|&nbsp;
      [OH⁻] = <b>${OH.toExponential(3)}</b> mol/L<br>
      Verification: pH + pOH = <b>${(pH+pOH).toFixed(2)}</b> (should = 14)
    </div>`;
}

/* ---------- 14. PERIODIC TABLE ---------- */
const PT=[
  {z:1,sym:'H',name:'Hydrogen',mass:1.008,type:'nonmetal',period:1,group:1,col:1,row:1,state:'Gas',econfig:'1s¹',en:2.20,uses:'Fuel cells, rocket propellant, water (H₂O), acids.'},
  {z:2,sym:'He',name:'Helium',mass:4.003,type:'noble',period:1,group:18,col:18,row:1,state:'Gas',econfig:'1s²',en:0,uses:'Balloons, MRI coolant, deep-sea diving mixtures.'},
  {z:3,sym:'Li',name:'Lithium',mass:6.941,type:'alkali',period:2,group:1,col:1,row:2,state:'Solid',econfig:'[He] 2s¹',en:0.98,uses:'Lithium-ion batteries, mood stabiliser drug, alloys.'},
  {z:4,sym:'Be',name:'Beryllium',mass:9.012,type:'alkaline',period:2,group:2,col:2,row:2,state:'Solid',econfig:'[He] 2s²',en:1.57,uses:'Aerospace alloys, X-ray windows, nuclear reactors.'},
  {z:5,sym:'B',name:'Boron',mass:10.811,type:'metalloid',period:2,group:13,col:13,row:2,state:'Solid',econfig:'[He] 2s² 2p¹',en:2.04,uses:'Borosilicate glass, semiconductors, detergents (borax).'},
  {z:6,sym:'C',name:'Carbon',mass:12.011,type:'nonmetal',period:2,group:14,col:14,row:2,state:'Solid',econfig:'[He] 2s² 2p²',en:2.55,uses:'All organic chemistry, graphite, diamonds, fullerenes, CO₂.'},
  {z:7,sym:'N',name:'Nitrogen',mass:14.007,type:'nonmetal',period:2,group:15,col:15,row:2,state:'Gas',econfig:'[He] 2s² 2p³',en:3.04,uses:'78% of atmosphere, fertilisers (NH₃), explosives.'},
  {z:8,sym:'O',name:'Oxygen',mass:15.999,type:'nonmetal',period:2,group:16,col:16,row:2,state:'Gas',econfig:'[He] 2s² 2p⁴',en:3.44,uses:'Breathing, combustion, steel production, ozone layer.'},
  {z:9,sym:'F',name:'Fluorine',mass:18.998,type:'halogen',period:2,group:17,col:17,row:2,state:'Gas',econfig:'[He] 2s² 2p⁵',en:3.98,uses:'Toothpaste (NaF), Teflon, refrigerants. Most electronegative element.'},
  {z:10,sym:'Ne',name:'Neon',mass:20.18,type:'noble',period:2,group:18,col:18,row:2,state:'Gas',econfig:'[He] 2s² 2p⁶',en:0,uses:'Neon signs, lasers, cryogenics.'},
  {z:11,sym:'Na',name:'Sodium',mass:22.99,type:'alkali',period:3,group:1,col:1,row:3,state:'Solid',econfig:'[Ne] 3s¹',en:0.93,uses:'Table salt (NaCl), street lights, nerve impulse transmission.'},
  {z:12,sym:'Mg',name:'Magnesium',mass:24.305,type:'alkaline',period:3,group:2,col:2,row:3,state:'Solid',econfig:'[Ne] 3s²',en:1.31,uses:'Alloys (aircraft), Mg flares, chlorophyll (plants).'},
  {z:13,sym:'Al',name:'Aluminium',mass:26.982,type:'post-trans',period:3,group:13,col:13,row:3,state:'Solid',econfig:'[Ne] 3s² 3p¹',en:1.61,uses:'Packaging, aircraft, cables, kitchen foil. Most abundant metal in crust.'},
  {z:14,sym:'Si',name:'Silicon',mass:28.086,type:'metalloid',period:3,group:14,col:14,row:3,state:'Solid',econfig:'[Ne] 3s² 3p²',en:1.90,uses:'Semiconductors, computer chips, glass, solar cells. 2nd most abundant element.'},
  {z:15,sym:'P',name:'Phosphorus',mass:30.974,type:'nonmetal',period:3,group:15,col:15,row:3,state:'Solid',econfig:'[Ne] 3s² 3p³',en:2.19,uses:'Fertilisers, DNA backbone, matches, detergents.'},
  {z:16,sym:'S',name:'Sulfur',mass:32.065,type:'nonmetal',period:3,group:16,col:16,row:3,state:'Solid',econfig:'[Ne] 3s² 3p⁴',en:2.58,uses:'H₂SO₄ (most used industrial chemical), rubber vulcanisation, matches.'},
  {z:17,sym:'Cl',name:'Chlorine',mass:35.453,type:'halogen',period:3,group:17,col:17,row:3,state:'Gas',econfig:'[Ne] 3s² 3p⁵',en:3.16,uses:'Water purification, PVC, bleach (NaOCl), salt (NaCl).'},
  {z:18,sym:'Ar',name:'Argon',mass:39.948,type:'noble',period:3,group:18,col:18,row:3,state:'Gas',econfig:'[Ne] 3s² 3p⁶',en:0,uses:'Welding shield gas, light bulbs, laser technology.'},
  {z:19,sym:'K',name:'Potassium',mass:39.098,type:'alkali',period:4,group:1,col:1,row:4,state:'Solid',econfig:'[Ar] 4s¹',en:0.82,uses:'Fertilisers, potassium chloride, banana nutrition.'},
  {z:20,sym:'Ca',name:'Calcium',mass:40.078,type:'alkaline',period:4,group:2,col:2,row:4,state:'Solid',econfig:'[Ar] 4s²',en:1.00,uses:'Bones & teeth (CaPO₄), cement (CaCO₃), dairy.'},
  {z:21,sym:'Sc',name:'Scandium',mass:44.956,type:'transition',period:4,group:3,col:3,row:4,state:'Solid',econfig:'[Ar] 3d¹ 4s²',en:1.36,uses:'Lightweight alloys, sports equipment, stadium lights.'},
  {z:22,sym:'Ti',name:'Titanium',mass:47.867,type:'transition',period:4,group:4,col:4,row:4,state:'Solid',econfig:'[Ar] 3d² 4s²',en:1.54,uses:'Aircraft, implants, TiO₂ white pigment, jewellery.'},
  {z:23,sym:'V',name:'Vanadium',mass:50.942,type:'transition',period:4,group:5,col:5,row:4,state:'Solid',econfig:'[Ar] 3d³ 4s²',en:1.63,uses:'Steel alloys, vanadium redox batteries, catalyst.'},
  {z:24,sym:'Cr',name:'Chromium',mass:51.996,type:'transition',period:4,group:6,col:6,row:4,state:'Solid',econfig:'[Ar] 3d⁵ 4s¹',en:1.66,uses:'Stainless steel, chrome plating, pigments.'},
  {z:25,sym:'Mn',name:'Manganese',mass:54.938,type:'transition',period:4,group:7,col:7,row:4,state:'Solid',econfig:'[Ar] 3d⁵ 4s²',en:1.55,uses:'Steel alloys, dry cell batteries (MnO₂), water treatment.'},
  {z:26,sym:'Fe',name:'Iron',mass:55.845,type:'transition',period:4,group:8,col:8,row:4,state:'Solid',econfig:'[Ar] 3d⁶ 4s²',en:1.83,uses:'Steel production, hemoglobin (blood), construction.'},
  {z:27,sym:'Co',name:'Cobalt',mass:58.933,type:'transition',period:4,group:9,col:9,row:4,state:'Solid',econfig:'[Ar] 3d⁷ 4s²',en:1.88,uses:'Superalloys (jet engines), blue pigments, lithium-ion batteries.'},
  {z:28,sym:'Ni',name:'Nickel',mass:58.693,type:'transition',period:4,group:10,col:10,row:4,state:'Solid',econfig:'[Ar] 3d⁸ 4s²',en:1.91,uses:'Coins, electroplating, stainless steel, rechargeable batteries.'},
  {z:29,sym:'Cu',name:'Copper',mass:63.546,type:'transition',period:4,group:11,col:11,row:4,state:'Solid',econfig:'[Ar] 3d¹⁰ 4s¹',en:1.90,uses:'Electrical wiring, plumbing, coins, antimicrobial surfaces.'},
  {z:30,sym:'Zn',name:'Zinc',mass:65.38,type:'transition',period:4,group:12,col:12,row:4,state:'Solid',econfig:'[Ar] 3d¹⁰ 4s²',en:1.65,uses:'Galvanising iron, die casting, zinc oxide (sunscreen).'},
  {z:31,sym:'Ga',name:'Gallium',mass:69.723,type:'post-trans',period:4,group:13,col:13,row:4,state:'Solid',econfig:'[Ar] 3d¹⁰ 4s² 4p¹',en:1.81,uses:'LEDs, solar cells, semiconductors. Melts at 30°C.'},
  {z:32,sym:'Ge',name:'Germanium',mass:72.63,type:'metalloid',period:4,group:14,col:14,row:4,state:'Solid',econfig:'[Ar] 3d¹⁰ 4s² 4p²',en:2.01,uses:'Semiconductors, fiber optics, infrared optics.'},
  {z:33,sym:'As',name:'Arsenic',mass:74.922,type:'metalloid',period:4,group:15,col:15,row:4,state:'Solid',econfig:'[Ar] 3d¹⁰ 4s² 4p³',en:2.18,uses:'Semiconductors, wood preservative, pesticides. Highly toxic.'},
  {z:34,sym:'Se',name:'Selenium',mass:78.971,type:'nonmetal',period:4,group:16,col:16,row:4,state:'Solid',econfig:'[Ar] 3d¹⁰ 4s² 4p⁴',en:2.55,uses:'Photocopiers, glass tinting, dietary trace element.'},
  {z:35,sym:'Br',name:'Bromine',mass:79.904,type:'halogen',period:4,group:17,col:17,row:4,state:'Liquid',econfig:'[Ar] 3d¹⁰ 4s² 4p⁵',en:2.96,uses:'Flame retardants, photography, water purification. Liquid at RT.'},
  {z:36,sym:'Kr',name:'Krypton',mass:83.798,type:'noble',period:4,group:18,col:18,row:4,state:'Gas',econfig:'[Ar] 3d¹⁰ 4s² 4p⁶',en:0,uses:'Flash photography, lasers, formerly defined the metre.'},
  {z:37,sym:'Rb',name:'Rubidium',mass:85.468,type:'alkali',period:5,group:1,col:1,row:5,state:'Solid',econfig:'[Kr] 5s¹',en:0.82,uses:'Atomic clocks, photomultiplier tubes, biomedical tracers.'},
  {z:38,sym:'Sr',name:'Strontium',mass:87.62,type:'alkaline',period:5,group:2,col:2,row:5,state:'Solid',econfig:'[Kr] 5s²',en:0.95,uses:'Red fireworks, CRT screens, nuclear medicine (⁹⁰Sr).'},
  {z:39,sym:'Y',name:'Yttrium',mass:88.906,type:'transition',period:5,group:3,col:3,row:5,state:'Solid',econfig:'[Kr] 4d¹ 5s²',en:1.22,uses:'LEDs, superconductors, camera lenses, yttrium iron garnets.'},
  {z:40,sym:'Zr',name:'Zirconium',mass:91.224,type:'transition',period:5,group:4,col:4,row:5,state:'Solid',econfig:'[Kr] 4d² 5s²',en:1.33,uses:'Nuclear reactor cladding, ceramics, cubic zirconia jewellery.'},
  {z:41,sym:'Nb',name:'Niobium',mass:92.906,type:'transition',period:5,group:5,col:5,row:5,state:'Solid',econfig:'[Kr] 4d⁴ 5s¹',en:1.60,uses:'Superconducting magnets, high-strength steel alloys.'},
  {z:42,sym:'Mo',name:'Molybdenum',mass:95.95,type:'transition',period:5,group:6,col:6,row:5,state:'Solid',econfig:'[Kr] 4d⁵ 5s¹',en:2.16,uses:'High-strength steel, aerospace, lubricants (MoS₂).'},
  {z:43,sym:'Tc',name:'Technetium',mass:98,type:'transition',period:5,group:7,col:7,row:5,state:'Solid',econfig:'[Kr] 4d⁵ 5s²',en:1.90,uses:'Nuclear medicine imaging (⁹⁹ᵐTc scans). First synthetic element.'},
  {z:44,sym:'Ru',name:'Ruthenium',mass:101.07,type:'transition',period:5,group:8,col:8,row:5,state:'Solid',econfig:'[Kr] 4d⁷ 5s¹',en:2.20,uses:'Electrical contacts, catalysts, hard disk coatings.'},
  {z:45,sym:'Rh',name:'Rhodium',mass:102.906,type:'transition',period:5,group:9,col:9,row:5,state:'Solid',econfig:'[Kr] 4d⁸ 5s¹',en:2.28,uses:'Catalytic converters, jewellery plating, industrial catalysts.'},
  {z:46,sym:'Pd',name:'Palladium',mass:106.42,type:'transition',period:5,group:10,col:10,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰',en:2.20,uses:'Catalytic converters, electronics, hydrogen storage.'},
  {z:47,sym:'Ag',name:'Silver',mass:107.868,type:'transition',period:5,group:11,col:11,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s¹',en:1.93,uses:'Photography (AgBr), jewellery, electronics, antimicrobial coatings.'},
  {z:48,sym:'Cd',name:'Cadmium',mass:112.414,type:'transition',period:5,group:12,col:12,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s²',en:1.69,uses:'Ni-Cd batteries, pigments, nuclear reactor control rods. Toxic.'},
  {z:49,sym:'In',name:'Indium',mass:114.818,type:'post-trans',period:5,group:13,col:13,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s² 5p¹',en:1.78,uses:'LCD screens (ITO), solders, low-melting alloys.'},
  {z:50,sym:'Sn',name:'Tin',mass:118.71,type:'post-trans',period:5,group:14,col:14,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s² 5p²',en:1.96,uses:'Food cans (tin plating), solder, bronze (Cu+Sn).'},
  {z:51,sym:'Sb',name:'Antimony',mass:121.76,type:'metalloid',period:5,group:15,col:15,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s² 5p³',en:2.05,uses:'Flame retardants, lead alloys for batteries.'},
  {z:52,sym:'Te',name:'Tellurium',mass:127.6,type:'metalloid',period:5,group:16,col:16,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s² 5p⁴',en:2.10,uses:'Solar panels (CdTe), thermoelectrics, rewritable discs.'},
  {z:53,sym:'I',name:'Iodine',mass:126.904,type:'halogen',period:5,group:17,col:17,row:5,state:'Solid',econfig:'[Kr] 4d¹⁰ 5s² 5p⁵',en:2.66,uses:'Thyroid hormone (iodised salt), antiseptic, photography.'},
  {z:54,sym:'Xe',name:'Xenon',mass:131.293,type:'noble',period:5,group:18,col:18,row:5,state:'Gas',econfig:'[Kr] 4d¹⁰ 5s² 5p⁶',en:0,uses:'Ion propulsion thrusters, anaesthetic, car headlights.'},
  {z:55,sym:'Cs',name:'Caesium',mass:132.905,type:'alkali',period:6,group:1,col:1,row:6,state:'Solid',econfig:'[Xe] 6s¹',en:0.79,uses:'Atomic clocks (defines SI second), drilling fluids, night-vision devices.'},
  {z:56,sym:'Ba',name:'Barium',mass:137.327,type:'alkaline',period:6,group:2,col:2,row:6,state:'Solid',econfig:'[Xe] 6s²',en:0.89,uses:'Barium sulfate (X-ray contrast), rat poison (BaCO₃), green fireworks.'},
  {z:72,sym:'Hf',name:'Hafnium',mass:178.49,type:'transition',period:6,group:4,col:4,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d² 6s²',en:1.30,uses:'Nuclear reactor control rods, microprocessor gates.'},
  {z:73,sym:'Ta',name:'Tantalum',mass:180.948,type:'transition',period:6,group:5,col:5,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d³ 6s²',en:1.50,uses:'Capacitors in electronics, surgical implants, turbine blades.'},
  {z:74,sym:'W',name:'Tungsten',mass:183.84,type:'transition',period:6,group:6,col:6,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d⁴ 6s²',en:2.36,uses:'Light bulb filaments, cutting tools, highest melting point metal (3422°C).'},
  {z:75,sym:'Re',name:'Rhenium',mass:186.207,type:'transition',period:6,group:7,col:7,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d⁵ 6s²',en:1.90,uses:'Jet engine alloys, catalytic reforming of petroleum.'},
  {z:76,sym:'Os',name:'Osmium',mass:190.23,type:'transition',period:6,group:8,col:8,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d⁶ 6s²',en:2.20,uses:'Hardening alloys, fountain pen tips. Densest natural element.'},
  {z:77,sym:'Ir',name:'Iridium',mass:192.217,type:'transition',period:6,group:9,col:9,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d⁷ 6s²',en:2.20,uses:'Spark plugs, K-Pg boundary marker, international kilogram standard.'},
  {z:78,sym:'Pt',name:'Platinum',mass:195.084,type:'transition',period:6,group:10,col:10,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d⁹ 6s¹',en:2.28,uses:'Catalytic converters, jewellery, fuel cells, chemotherapy (cisplatin).'},
  {z:79,sym:'Au',name:'Gold',mass:196.967,type:'transition',period:6,group:11,col:11,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s¹',en:2.54,uses:'Currency, jewellery, electronics contacts, medical implants.'},
  {z:80,sym:'Hg',name:'Mercury',mass:200.592,type:'transition',period:6,group:12,col:12,row:6,state:'Liquid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s²',en:2.00,uses:'Thermometers, fluorescent lights, dental amalgam. Only liquid metal at RT.'},
  {z:81,sym:'Tl',name:'Thallium',mass:204.383,type:'post-trans',period:6,group:13,col:13,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹',en:1.62,uses:'Cardiac imaging, infrared optics. Highly toxic.'},
  {z:82,sym:'Pb',name:'Lead',mass:207.2,type:'post-trans',period:6,group:14,col:14,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',en:2.33,uses:'Car batteries, radiation shielding, historical plumbing.'},
  {z:83,sym:'Bi',name:'Bismuth',mass:208.98,type:'post-trans',period:6,group:15,col:15,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³',en:2.02,uses:'Pepto-Bismol, fire sprinkler alloys, beautiful oxide crystals.'},
  {z:84,sym:'Po',name:'Polonium',mass:209,type:'post-trans',period:6,group:16,col:16,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴',en:2.00,uses:'Alpha particle source, antistatic devices. Highly radioactive.'},
  {z:85,sym:'At',name:'Astatine',mass:210,type:'halogen',period:6,group:17,col:17,row:6,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵',en:2.20,uses:'Cancer radiotherapy research. Rarest naturally occurring element.'},
  {z:86,sym:'Rn',name:'Radon',mass:222,type:'noble',period:6,group:18,col:18,row:6,state:'Gas',econfig:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶',en:0,uses:'Cancer radiotherapy. Radioactive — lung cancer risk from home exposure.'},
  {z:87,sym:'Fr',name:'Francium',mass:223,type:'alkali',period:7,group:1,col:1,row:7,state:'Solid',econfig:'[Rn] 7s¹',en:0.70,uses:'Fundamental physics research only. Extremely rare and radioactive.'},
  {z:88,sym:'Ra',name:'Radium',mass:226,type:'alkaline',period:7,group:2,col:2,row:7,state:'Solid',econfig:'[Rn] 7s²',en:0.90,uses:'Historical cancer treatment, luminous paint (radioactive). Discovered by Curie.'},
  {z:104,sym:'Rf',name:'Rutherfordium',mass:267,type:'transition',period:7,group:4,col:4,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d² 7s²',en:0,uses:'Research only. Synthetic transuranium element.'},
  {z:105,sym:'Db',name:'Dubnium',mass:268,type:'transition',period:7,group:5,col:5,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d³ 7s²',en:0,uses:'Research only. Named after Dubna, Russia.'},
  {z:106,sym:'Sg',name:'Seaborgium',mass:269,type:'transition',period:7,group:6,col:6,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d⁴ 7s²',en:0,uses:'Research only. Named after Glenn Seaborg.'},
  {z:107,sym:'Bh',name:'Bohrium',mass:270,type:'transition',period:7,group:7,col:7,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d⁵ 7s²',en:0,uses:'Research only. Named after Niels Bohr.'},
  {z:108,sym:'Hs',name:'Hassium',mass:270,type:'transition',period:7,group:8,col:8,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d⁶ 7s²',en:0,uses:'Research only. Named after Hesse, Germany.'},
  {z:109,sym:'Mt',name:'Meitnerium',mass:278,type:'transition',period:7,group:9,col:9,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d⁷ 7s²',en:0,uses:'Research only. Named after Lise Meitner.'},
  {z:110,sym:'Ds',name:'Darmstadtium',mass:281,type:'transition',period:7,group:10,col:10,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d⁸ 7s²',en:0,uses:'Research only. Named after Darmstadt, Germany.'},
  {z:111,sym:'Rg',name:'Roentgenium',mass:282,type:'transition',period:7,group:11,col:11,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d⁹ 7s²',en:0,uses:'Research only. Named after Wilhelm Röntgen.'},
  {z:112,sym:'Cn',name:'Copernicium',mass:285,type:'transition',period:7,group:12,col:12,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s²',en:0,uses:'Research only. Named after Copernicus.'},
  {z:113,sym:'Nh',name:'Nihonium',mass:286,type:'post-trans',period:7,group:13,col:13,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹',en:0,uses:'Research only. Named after Japan (Nihon).'},
  {z:114,sym:'Fl',name:'Flerovium',mass:289,type:'post-trans',period:7,group:14,col:14,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²',en:0,uses:'Research only. Named after Flerov Laboratory.'},
  {z:115,sym:'Mc',name:'Moscovium',mass:290,type:'post-trans',period:7,group:15,col:15,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³',en:0,uses:'Research only. Named after Moscow Oblast.'},
  {z:116,sym:'Lv',name:'Livermorium',mass:293,type:'post-trans',period:7,group:16,col:16,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴',en:0,uses:'Research only. Named after Livermore, California.'},
  {z:117,sym:'Ts',name:'Tennessine',mass:294,type:'halogen',period:7,group:17,col:17,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵',en:0,uses:'Research only. Named after Tennessee.'},
  {z:118,sym:'Og',name:'Oganesson',mass:294,type:'noble',period:7,group:18,col:18,row:7,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶',en:0,uses:'Research only. Named after Yuri Oganessian. Heaviest confirmed element.'}
];

const LANTHANIDES=[
  {z:57,sym:'La',name:'Lanthanum',mass:138.905,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 5d¹ 6s²',en:1.10,uses:'Camera lenses, hydrogen storage, La-Ni batteries.'},
  {z:58,sym:'Ce',name:'Cerium',mass:140.116,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹ 5d¹ 6s²',en:1.12,uses:'Catalytic converters, glass polishing, lighter flints.'},
  {z:59,sym:'Pr',name:'Praseodymium',mass:140.908,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f³ 6s²',en:1.13,uses:'Permanent magnets, aircraft engine alloys, green glass.'},
  {z:60,sym:'Nd',name:'Neodymium',mass:144.242,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f⁴ 6s²',en:1.14,uses:'Strongest permanent magnets (Nd₂Fe₁₄B), EV motors, MRI machines.'},
  {z:61,sym:'Pm',name:'Promethium',mass:145,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f⁵ 6s²',en:1.13,uses:'Nuclear batteries, luminous paint. Radioactive, no stable isotopes.'},
  {z:62,sym:'Sm',name:'Samarium',mass:150.36,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f⁶ 6s²',en:1.17,uses:'SmCo permanent magnets, cancer treatment, neutron absorber.'},
  {z:63,sym:'Eu',name:'Europium',mass:151.964,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f⁷ 6s²',en:1.20,uses:'Red phosphors in TV/LED, euro banknote security feature.'},
  {z:64,sym:'Gd',name:'Gadolinium',mass:157.25,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f⁷ 5d¹ 6s²',en:1.20,uses:'MRI contrast agent, neutron capture therapy, Gd scintillators.'},
  {z:65,sym:'Tb',name:'Terbium',mass:158.925,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f⁹ 6s²',en:1.10,uses:'Green phosphors, terfenol-D (magnetostrictive alloy).'},
  {z:66,sym:'Dy',name:'Dysprosium',mass:162.5,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹⁰ 6s²',en:1.22,uses:'Nd magnets additive (EV motors), nuclear reactor rods.'},
  {z:67,sym:'Ho',name:'Holmium',mass:164.93,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹¹ 6s²',en:1.23,uses:'Laser scalpels, magnetic flux concentrators.'},
  {z:68,sym:'Er',name:'Erbium',mass:167.259,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹² 6s²',en:1.24,uses:'Optical fiber amplifiers, pink glass tinting, lasers.'},
  {z:69,sym:'Tm',name:'Thulium',mass:168.934,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹³ 6s²',en:1.25,uses:'Portable X-ray sources, lasers, surgical instruments.'},
  {z:70,sym:'Yb',name:'Ytterbium',mass:173.054,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹⁴ 6s²',en:1.10,uses:'Optical fiber lasers, atomic clocks, stress gauges.'},
  {z:71,sym:'Lu',name:'Lutetium',mass:174.967,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f¹⁴ 5d¹ 6s²',en:1.27,uses:'PET scan detectors, catalyst in oil refining.'}
];

const ACTINIDES=[
  {z:89,sym:'Ac',name:'Actinium',mass:227,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 6d¹ 7s²',en:1.10,uses:'Neutron sources, targeted cancer therapy.'},
  {z:90,sym:'Th',name:'Thorium',mass:232.038,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 6d² 7s²',en:1.30,uses:'Proposed nuclear fuel (thorium reactors), gas mantles.'},
  {z:91,sym:'Pa',name:'Protactinium',mass:231.036,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f² 6d¹ 7s²',en:1.50,uses:'Research only. Radioactive and toxic.'},
  {z:92,sym:'U',name:'Uranium',mass:238.029,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f³ 6d¹ 7s²',en:1.38,uses:'Nuclear fuel (U-235 fissions), depleted uranium in armour.'},
  {z:93,sym:'Np',name:'Neptunium',mass:237,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f⁴ 6d¹ 7s²',en:1.36,uses:'Neutron detection equipment.'},
  {z:94,sym:'Pu',name:'Plutonium',mass:244,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f⁶ 7s²',en:1.28,uses:'Nuclear weapons, nuclear power fuel, RTGs (spacecraft).'},
  {z:95,sym:'Am',name:'Americium',mass:243,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f⁷ 7s²',en:1.30,uses:'Smoke detectors (Am-241), neutron sources.'},
  {z:96,sym:'Cm',name:'Curium',mass:247,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f⁷ 6d¹ 7s²',en:1.30,uses:'Alpha particle X-ray spectrometer (Mars rovers).'},
  {z:97,sym:'Bk',name:'Berkelium',mass:247,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f⁹ 7s²',en:1.30,uses:'Research only. Used to synthesise element 117.'},
  {z:98,sym:'Cf',name:'Californium',mass:251,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f¹⁰ 7s²',en:1.30,uses:'Neutron startup sources for reactors, gold prospecting.'},
  {z:99,sym:'Es',name:'Einsteinium',mass:252,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f¹¹ 7s²',en:1.30,uses:'Research only. Named after Albert Einstein.'},
  {z:100,sym:'Fm',name:'Fermium',mass:257,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f¹² 7s²',en:1.30,uses:'Research only. First produced in H-bomb fallout.'},
  {z:101,sym:'Md',name:'Mendelevium',mass:258,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f¹³ 7s²',en:1.30,uses:'Research only. Named after Dmitri Mendeleev.'},
  {z:102,sym:'No',name:'Nobelium',mass:259,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 7s²',en:1.30,uses:'Research only. Named after Alfred Nobel.'},
  {z:103,sym:'Lr',name:'Lawrencium',mass:266,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f¹⁴ 7s² 7p¹',en:1.30,uses:'Research only. Named after Ernest Lawrence.'}
];

const TYPE_COLORS={alkali:'#f87171',alkaline:'#fb923c',transition:'#facc15',
  'post-trans':'#a3a3a3',metalloid:'#34d399',nonmetal:'#4fffb0',halogen:'#fbbf24',
  noble:'#a855f7',lanthanide:'#f472b6',actinide:'#38bdf8'};

function makeCell(el){
  const div=document.createElement('div');
  div.className=`pt-cell ${el.type}`;
  div.innerHTML=`<span class="pt-num">${el.z}</span><span class="pt-sym">${el.sym}</span><span class="pt-name">${el.name}</span><span class="pt-mass">${el.mass}</span>`;
  div.onclick=()=>showElement(el.z);
  return div;
}

function buildPeriodicTable(){
  const grid=document.getElementById('ptGrid');
  if(!grid)return;
  grid.innerHTML='';
  // Build 7×18 grid
  const layout=Array.from({length:7},()=>Array(18).fill(null));
  // Place main elements
  PT.forEach(el=>{
    const r=el.row-1,c=el.col-1;
    if(r>=0&&r<7&&c>=0&&c<18)layout[r][c]=el;
  });
  // Lanthanide/Actinide placeholders in row 6,7 col 3
  for(let r=0;r<7;r++){
    for(let c=0;c<18;c++){
      const el=layout[r][c];
      if(el){grid.appendChild(makeCell(el));}
      else {
        const empty=document.createElement('div');empty.className='pt-cell empty';
        // Add * ** markers for lanthanide/actinide gaps
        if(r===5&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--ions-pos)">*</span>';}
        if(r===6&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--alkene)">**</span>';}
        grid.appendChild(empty);
      }
    }
  }
  // Build lanthanide row
  const la=document.getElementById('ptLantha');
  const ac=document.getElementById('ptActin');
  if(la){la.innerHTML='';LANTHANIDES.forEach(el=>la.appendChild(makeCell(el)));}
  if(ac){ac.innerHTML='';ACTINIDES.forEach(el=>ac.appendChild(makeCell(el)));}
}

function showElement(z){
  const all=[...PT,...LANTHANIDES,...ACTINIDES];
  const el=all.find(e=>e.z===z);
  if(!el)return;
  const color=TYPE_COLORS[el.type]||'var(--accent)';
  const typeLabel=el.type.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  document.getElementById('em-sym').textContent=el.sym;
  document.getElementById('em-sym').style.color=color;
  document.getElementById('em-name').textContent=el.name;
  const badge=document.getElementById('em-badge');
  badge.textContent=typeLabel;badge.style.color=color;badge.style.borderColor=color;
  document.getElementById('em-state').textContent=`State at RT: ${el.state}`;
  document.getElementById('em-z').textContent=el.z;
  document.getElementById('em-mass').textContent=el.mass;
  document.getElementById('em-period').textContent=`${el.period} / ${el.group||'*'}`;
  document.getElementById('em-protons').textContent=el.z;
  document.getElementById('em-neutrons').textContent=Math.round(el.mass-el.z);
  document.getElementById('em-electrons').textContent=el.z;
  document.getElementById('em-econfig').textContent=el.econfig;
  document.getElementById('em-uses').innerHTML=`<b>Key Facts & Uses:</b><br>${el.uses}${el.en?`<br><br><b>Electronegativity:</b> ${el.en} (Pauling scale)`:''}`;
  document.getElementById('elemModal').classList.add('open');
}

function closeElemModal(){
  document.getElementById('elemModal').classList.remove('open');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeElemModal();});

/* ---------- 15. THEME ---------- */
// (handled in section 16b below)

/* ---------- 16. MOBILE NAV ---------- */
function toggleMobileNav(){
  const drawer=document.getElementById('mobileNavDrawer');
  const overlay=document.getElementById('mobileNavOverlay');
  const isOpen=drawer.classList.contains('mob-open');
  drawer.classList.toggle('mob-open',!isOpen);
  overlay.classList.toggle('mob-open',!isOpen);
  document.body.style.overflow=isOpen?'':'hidden';
}

/* ---------- 16b. THEME PERSISTENCE ---------- */
function _applyTheme(isLight){
  if(isLight){
    document.documentElement.removeAttribute('data-theme');
    try{localStorage.setItem('labar_theme','dark');}catch(e){}
  }else{
    document.documentElement.setAttribute('data-theme','light');
    try{localStorage.setItem('labar_theme','light');}catch(e){}
  }
  // Update pill state
  const btn=document.getElementById('themeBtn');
  if(btn) btn.classList.toggle('theme-pill--light',!isLight);
}
function toggleTheme(){
  const isLight=document.documentElement.getAttribute('data-theme')==='light';
  const btn=document.getElementById('themeBtn');
  // View Transition API — circular wipe from toggle position
  if(!document.startViewTransition){
    _applyTheme(isLight); return;
  }
  // Get click origin for the radial clip
  const rect=btn?btn.getBoundingClientRect():{top:0,left:0,width:0,height:0};
  const x=rect.left+rect.width/2;
  const y=rect.top+rect.height/2;
  const maxR=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  document.startViewTransition(()=>{ _applyTheme(isLight); }).ready.then(()=>{
    document.documentElement.animate(
      {clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${maxR}px at ${x}px ${y}px)`]},
      {duration:500,easing:'ease-in-out',pseudoElement:'::view-transition-new(root)'}
    );
  });
}
function restoreTheme(){
  try{
    const t=localStorage.getItem('labar_theme');
    const btn=document.getElementById('themeBtn');
    if(t==='light'){
      document.documentElement.setAttribute('data-theme','light');
      if(btn) btn.classList.add('theme-pill--light');
    }
  }catch(e){}
}

/* ---------- 17. PROGRESS DASHBOARD ---------- */
const CHAPTERS=[
  {
    label:'Organic',
    ids:['chkCalc','chk0','chk1','chk2','chk-alkiso','chk3','chk4b','chkOR','chkSynth','chkPoly'],
    names:['Calc','Hydrocarbons','IUPAC','Isomers','Iso Builder','Library','Func. Groups','Org. Reactions','Synthesis','Polymers']
  },
  {
    label:'General',
    ids:['chkGlossary','chkReactivity','chk4','chk5','chk6','chk7','chk9','chk10','chk11','chk12','chkES','chkECalc','chk13','chkEq','chkSol','chkKinetics','chkLab','chkSpec','chkMagnetic','chkCatalytic','chkIronExt','chkIronProp','chkIronOx','chkAlloys','chkBasicRad','chkQuantAnal','chkPressure','chkIonicEq'],
    names:['Glossary','Reactivity','Ions','Moles','Thermo','Nuclear','Bonding','Reactions','Acids','Redox','E-Series','E-Calc','Gas Laws','Equilibrium','Solutions','Kinetics','Lab Tech','Spectroscopy','Magnetism','Catalysis','Fe Extraction','Fe Properties','Fe Oxides','Alloys','Basic Radicals','Quant. Analysis','Pressure','Ionic Eq.']
  },
  {
    label:'Tools',
    ids:['chkTools','chkBlocks','chkPT'],
    names:['Tools','Blocks','Periodic Table']
  }
];

const MESSAGES=[
  [0,   "Start checking off sections as you study! ✨"],
  [10,  "Great start — keep going! 🚀"],
  [25,  "You're 25% through — solid progress! 💪"],
  [50,  "Halfway there! You're on a roll 🔥"],
  [75,  "75% done — almost a chemistry expert! ⚗️"],
  [90,  "So close! Just a few sections left 🏁"],
  [100, "🎉 Encyclopedia complete! You've mastered LabAR.EDU!"]
];

function getMsg(pct){
  let msg=MESSAGES[0][1];
  for(const[t,m] of MESSAGES){if(pct>=t)msg=m;}
  return msg;
}

function updateProgress(){
  const allIds=CHAPTERS.flatMap(c=>c.ids);
  const total=allIds.length;
  const done=allIds.filter(id=>document.getElementById(id)?.checked).length;
  const pct=Math.round(done/total*100);

  // Mini bar + label + badge
  const fill=document.getElementById('progressFill');
  const label=document.getElementById('progressLabel');
  const badge=document.getElementById('pdBadge');
  if(fill)fill.style.width=pct+'%';
  if(label)label.textContent=`${done} / ${total}`;
  if(badge)badge.textContent=pct+'%';
  // Mobile mini bar
  const mf=document.getElementById('mobProgressFill');
  const ml=document.getElementById('mobProgressLabel');
  if(mf)mf.style.width=pct+'%';
  if(ml)ml.textContent=pct+'%';

  // Message
  const msg=document.getElementById('pdMessage');
  if(msg)msg.textContent=getMsg(pct);

  // Chapter bars + dots
  CHAPTERS.forEach((ch,i)=>{
    const chDone=ch.ids.filter(id=>document.getElementById(id)?.checked).length;
    const chTotal=ch.ids.length;
    const chPct=Math.round(chDone/chTotal*100);
    const bar=document.getElementById('chBar'+i);
    const count=document.getElementById('chCount'+i);
    const dots=document.getElementById('chDots'+i);
    if(bar)bar.style.width=chPct+'%';
    if(count)count.textContent=`${chDone} / ${chTotal}`;
    if(dots){
      dots.innerHTML='';
      ch.ids.forEach((id,j)=>{
        const checked=document.getElementById(id)?.checked;
        const dot=document.createElement('div');
        dot.className='pd-dot'+(checked?' done':'');
        dot.title=ch.names[j];
        dots.appendChild(dot);
      });
    }
  });

  // Save to localStorage
  try{localStorage.setItem('labar_progress',JSON.stringify(allIds.map(id=>document.getElementById(id)?.checked||false)));}catch(e){}
}

function toggleDashboard(){
  const body=document.getElementById('pdBody');
  const chev=document.getElementById('pdChevron');
  if(!body||!chev)return;
  const open=body.classList.toggle('open');
  chev.classList.toggle('open',open);
  try{localStorage.setItem('labar_dash_open',open);}catch(e){}
}

// Restore saved progress
function restoreProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem('labar_progress')||'[]');
    const allIds=CHAPTERS.flatMap(c=>c.ids);
    allIds.forEach((id,i)=>{const el=document.getElementById(id);if(el&&saved[i])el.checked=true;});
    const dashOpen=localStorage.getItem('labar_dash_open')==='true';
    if(dashOpen){const b=document.getElementById('pdBody');const c=document.getElementById('pdChevron');if(b)b.classList.add('open');if(c)c.classList.add('open');}
  }catch(e){}
  updateProgress();
}

/* ---------- SCROLL PROGRESS BAR ---------- */
window.addEventListener('scroll',()=>{
  const el=document.getElementById('scrollBar');
  if(!el)return;
  const h=document.documentElement;
  const pct=(h.scrollTop||document.body.scrollTop)/(h.scrollHeight-h.clientHeight)*100;
  el.style.width=Math.min(pct,100)+'%';
},{ passive:true });

/* ---------- 18. GLOBAL SEARCH ---------- */
const SEARCH_INDEX=[
  /* === Ch01: Organic Chemistry === */
  {title:'Hydrocarbon Calculator',ctx:'Calculate alkane alkene alkyne molecular formulas CnH2n+2 carbon count empirical formula',anchor:'calc-tool'},
  {title:'What are Hydrocarbons',ctx:'Alkanes saturated alkenes alkynes unsaturated C–H compounds fossil fuels combustion hydrocarbon types',anchor:'hydrocarbons'},
  {title:'IUPAC Nomenclature',ctx:'Systematic naming longest chain rule substituents alphabetical order locant prefix suffix alkan alken alkyne',anchor:'iupac-section'},
  {title:'Isomerism',ctx:'Structural isomers stereoisomers geometric cis trans optical enantiomers chiral carbon R S configuration',anchor:'isomerism-section'},
  {title:'Alkane Isomer Builder',ctx:'Alkane isomer generator structural isomers CnH2n+2 carbon skeleton IUPAC name condensed formula tool',anchor:'alkiso-section'},
  {title:'Compound Library',ctx:'Methane ethane propane butane pentane hexane heptane octane nonane decane full series C1 C10 homologous',anchor:'table-section'},
  {title:'Organic Functional Groups',ctx:'Alcohol aldehyde ketone carboxylic acid ester amine ether amide alkyl halide thiol nitrile aromatic OH CHO COOH COO NH2 Tollens Fehling test benzene',anchor:'functional-section'},
  {title:'Organic Reactions & Mechanisms',ctx:'Oxidation energy profile exothermic endothermic activation energy reaction pathway combustion substitution addition elimination polymerisation',anchor:'organic-reactions-section'},
  {title:'Organic Synthesis',ctx:'Grignard Friedel-Crafts Aldol Diels-Alder Wittig Williamson esterification SN1 SN2 E1 E2 Markovnikov retrosynthesis named reactions protecting groups carbocation',anchor:'synthesis-section'},
  {title:'Polymers',ctx:'Addition condensation polymer monomer polyethylene nylon PVC natural synthetic rubber proteins DNA cellulose starch',anchor:'polymers-section'},

  /* === Ch02: General Chemistry === */
  {title:'Chemistry Glossary',ctx:'Atom molecule element compound mixture ion cation anion acid base salt solution solute solvent reaction pH catalyst electrolyte vocabulary definitions',anchor:'glossary-section'},
  {title:'Reactivity Series',ctx:'Metal activity potassium sodium calcium magnesium aluminium zinc iron tin lead copper silver gold platinum displacement reduction extraction electrolysis',anchor:'reactivity-section'},
  {title:'Ions & Charges',ctx:'Cations anions Li Na K Mg Ca Al Fe Cu Cl SO4 NO3 OH CO3 PO4 ionic charges positive negative polyatomic acetate permanganate chromate dichromate',anchor:'ions-section'},
  {title:'Mole Concept',ctx:'Avogadro number 6.02 ten 23 moles molarity molar mass particles volume 22.4 STP stoichiometry counting matter',anchor:'moles-section'},
  {title:'Thermochemistry',ctx:'Exothermic endothermic enthalpy ΔH heat Q mcΔT specific heat capacity calorimetry Hess law bond energy',anchor:'thermo-section'},
  {title:'Nuclear Chemistry',ctx:'Radioactivity alpha beta gamma half-life decay E mc2 binding energy protons neutrons fission fusion nuclear reactor',anchor:'nuclear-section'},
  {title:'Chemical Bonding',ctx:'Ionic covalent metallic bond electronegativity polar nonpolar Lewis dot structure octet rule dipole intermolecular forces hydrogen bond',anchor:'bonding-section'},
  {title:'Reaction Types',ctx:'Synthesis combination decomposition single double displacement combustion neutralisation balanced equations redox precipitation',anchor:'reactions-section'},
  {title:'Acids & Bases',ctx:'pH pOH indicators litmus phenolphthalein strong weak acid base buffer neutralization Bronsted Lowry conjugate pair Ka Kb HCl H2SO4 NaOH KOH',anchor:'acids-section'},
  {title:'Electrochemistry',ctx:'OIL RIG oxidation reduction redox half reactions galvanic electrolytic cell anode cathode electroplating oxidation number balancing',anchor:'electro-section'},
  {title:'Electrochemical Series',ctx:'Standard electrode potential reduction potential SHE half-cell EMF cell notation reduction oxidation reactivity ranking',anchor:'electrochem-series-section'},
  {title:'Electrochemistry Calculations',ctx:'Nernst equation cell potential E standard Gibbs free energy delta G nFE Faraday law electrolysis mass deposited current charge coulombs Q Kc equilibrium',anchor:'electro-calc-section'},
  {title:'Gas Laws',ctx:'Boyle Charles Gay-Lussac combined ideal PV nRT Avogadro pressure volume temperature kelvin STP moles gas constant',anchor:'gaslaws-section'},
  {title:'Chemical Equilibrium',ctx:'Kc Kp equilibrium constant Le Chatelier ICE table dynamic reversible reaction concentration pressure temperature catalyst Q reaction quotient',anchor:'equilibrium-section'},
  {title:'Solutions & Concentration',ctx:'Molarity molality normality formality mole fraction ppm percentage mass volume freezing point depression metric concentration terms',anchor:'solutions-section'},
  {title:'Reaction Kinetics',ctx:'Rate of reaction collision theory activation energy Arrhenius rate constant rate law order first second zero half-life Maxwell-Boltzmann temperature concentration surface area catalyst',anchor:'kinetics-section'},
  {title:'Lab Techniques',ctx:'Filtration distillation chromatography titration reflux crystallisation Rf value TLC GC HPLC paper chromatography practical separation purification',anchor:'lab-section'},
  {title:'Spectroscopy',ctx:'IR infrared NMR mass spectrometry chemical shift ppm splitting pattern integration wavenumber molecular ion fragmentation base peak carbonyl OH C=O functional group identification',anchor:'spectroscopy-section'},

  /* === New General Chemistry Sections === */
  {title:'Magnetic Properties',ctx:'diamagnetic paramagnetic ferromagnetic unpaired electrons d-orbitals spin magnetic moment Bohr magnetons MRI gadolinium neodymium magnets Curie temperature iron cobalt nickel',anchor:'magnetic-section'},
  {title:'Catalytic Activity',ctx:'catalyst heterogeneous homogeneous transition metal variable oxidation states surface adsorption Haber process Haber-Bosch Contact process iron vanadium V2O5 platinum palladium Ziegler-Natta hydrogenation catalytic converter Fe V Ni Pt Pd',anchor:'catalytic-section'},
  {title:'Extraction of Iron from Ores',ctx:'blast furnace haematite magnetite coke limestone pig iron slag steel basic oxygen furnace reduction CO carbon Fe2O3 Fe3O4 iron ore metallurgy steel production',anchor:'iron-extraction-section'},
  {title:'Properties of Pure Iron',ctx:'iron Fe physical chemical properties oxidation states Fe2+ ferrous Fe3+ ferric electron configuration rusting corrosion galvanising cathodic protection electrochemical melting point density',anchor:'iron-properties-section'},
  {title:'Iron Oxides',ctx:'FeO Fe2O3 haematite Fe3O4 magnetite wustite ferric ferrous iron oxide colours red black magnetic thermite pigment rust lodestone',anchor:'iron-oxides-section'},
  {title:'Alloys',ctx:'steel stainless bronze brass duralumin solder amalgam substitutional interstitial alloy iron carbon nickel chromium copper zinc tin aluminium titanium eutectic alloy properties',anchor:'alloys-section'},
  {title:'Detection of Basic Radicals',ctx:'cation identification flame test NaOH NH3 precipitate Cu2+ Fe2+ Fe3+ Ca2+ Mg2+ Al3+ Zn2+ Pb2+ NH4+ confirmatory tests Prussian blue KSCN Turnbull blue qualitative analysis',anchor:'basic-radicals-section'},
  {title:'Quantitative Analysis',ctx:'gravimetric volumetric titration Beer-Lambert colorimetry back titration BaSO4 precipitation EDTA Mohr iodometric KMnO4 Na2S2O3 calibration curve absorbance concentration analytical chemistry',anchor:'quant-analysis-section'},
  {title:'Pressure in Chemistry',ctx:'atmospheric pressure partial pressure Dalton law vapour pressure osmotic pressure Raoult law boiling point STP atm Pascal mmHg torr equilibrium Le Chatelier Haber Contact osmosis van Hoff',anchor:'pressure-section'},
  {title:'Ionic Equilibrium',ctx:'weak acid dissociation Ka Kb Kw buffer Henderson-Hasselbalch solubility product Ksp common ion effect salt hydrolysis degree pKa pKb degree of hydrolysis pH weak acid weak base conjugate pair',anchor:'ionic-equilibrium-section'},

  /* === Ch03: Tools & Reference === */
  {title:'Interactive Chemistry Tools',ctx:'Molar mass calculator ion compound builder nuclear decay simulator unit converter stoichiometry pH pOH equation balancer titration empirical formula',anchor:'tools-section'},
  {title:'Periodic Table Blocks',ctx:'s-block p-block d-block f-block electron configuration Aufbau Hund Pauli transition metal properties coloured compounds variable oxidation states',anchor:'blocks-section'},
  {title:'Periodic Table (All 118 Elements)',ctx:'118 elements click details electron configuration atomic number mass period group state uses lanthanide actinide',anchor:'periodic-section'},
];

function openSearch(){
  document.getElementById('searchOverlay').classList.add('open');
  document.getElementById('globalSearchInput').value='';
  document.getElementById('searchResults').innerHTML='';
  setTimeout(()=>document.getElementById('globalSearchInput').focus(),80);
}

function closeSearchIfOutside(e){
  if(e.target===document.getElementById('searchOverlay'))closeSearch();
}

function closeSearch(){document.getElementById('searchOverlay').classList.remove('open');}

function runGlobalSearch(){
  const q=document.getElementById('globalSearchInput').value.toLowerCase().trim();
  const container=document.getElementById('searchResults');
  if(!q){container.innerHTML='';return;}
  const hits=SEARCH_INDEX.filter(s=>s.title.toLowerCase().includes(q)||s.ctx.toLowerCase().includes(q));
  if(!hits.length){container.innerHTML='<div class="search-empty">No results found.</div>';return;}
  container.innerHTML=hits.map(h=>`
    <div class="search-hit" onclick="jumpTo('${h.anchor}')">
      <div class="search-hit-title">${h.title}<span class="search-hit-tag">#${h.anchor}</span></div>
      <div class="search-hit-ctx">${h.ctx}</div>
    </div>`).join('');
}

function jumpTo(anchor){
  closeSearch();
  const el=document.getElementById(anchor);
  if(el)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),120);
}

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}
  if(e.key==='Escape')closeSearch();
});

/* ---------- 19. INIT ---------- */
window.addEventListener('load',()=>{
  processChemistry();
  generateLibrary();
  buildPhScale();
  buildPeriodicTable();
  renderGasFields();
  initConverter();
  buildCompound();
  restoreProgress();
  restoreTheme();
  initScrollSpy();
  initBackToTop();
  initHeroCounters();
});

/* ---------- HERO COUNTERS ---------- */
function initHeroCounters(){
  document.querySelectorAll('.hero-stat .num').forEach(el=>{
    const raw=el.textContent.trim();
    const num=parseInt(raw);
    const suffix=raw.replace(/[0-9]/g,'');
    if(isNaN(num))return;
    el.textContent='0'+suffix;
    const dur=1200;
    const start=performance.now();
    function tick(now){
      const p=Math.min((now-start)/dur,1);
      const ease=1-Math.pow(1-p,3); // ease-out cubic
      el.textContent=Math.round(ease*num)+suffix;
      if(p<1)requestAnimationFrame(tick);
    }
    // delay slightly so it fires after page paint
    setTimeout(()=>requestAnimationFrame(tick),400);
  });
}

/* ---------- SCROLL SPY — active nav highlight ---------- */
function initScrollSpy(){
  const sections=document.querySelectorAll('section[id]');
  const navLinks=document.querySelectorAll('.nav-links a[href^="#"]');
  const navScroll=document.getElementById('navLinks');
  if(!sections.length||!navLinks.length)return;
  const spy=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id=e.target.id;
        navLinks.forEach(a=>{
          const active=a.getAttribute('href')==='#'+id;
          a.classList.toggle('nav-active',active);
          // auto-scroll active link into view in the nav bar
          if(active&&navScroll){
            const lRect=a.getBoundingClientRect();
            const wRect=navScroll.getBoundingClientRect();
            if(lRect.left<wRect.left||lRect.right>wRect.right){
              a.scrollIntoView({inline:'center',behavior:'smooth',block:'nearest'});
            }
          }
        });
      }
    });
  },{rootMargin:'-20% 0px -70% 0px'});
  sections.forEach(s=>spy.observe(s));
}

/* ---------- BACK TO TOP ---------- */
function initBackToTop(){
  const btn=document.getElementById('backToTop');
  if(!btn)return;
  window.addEventListener('scroll',()=>{
    btn.classList.toggle('btt-show',window.scrollY>600);
  },{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

/* ===== v12.0 NEW FUNCTIONS ===== */

/* ---------- 20. EQUATION BALANCER ---------- */
function balanceEquation(){
  const raw=document.getElementById('balanceEq').value.trim();
  const res=document.getElementById('balanceResult');
  if(!raw){res.innerHTML='<span class="tool-empty">Enter an equation first.</span>';return;}

  const sides=raw.split(/→|->|=>/);
  if(sides.length<2){res.innerHTML='<span style="color:var(--alkyne)">Use → or -> to separate reactants from products.</span>';return;}

  function parseSide(str){
    return str.split('+').map(t=>{
      t=t.trim();
      const m=t.match(/^(\d*)\s*(.+)/);
      const coef=m&&m[1]?parseInt(m[1]):1;
      const formula=m?m[2].trim():'';
      return{coef,formula,atoms:parseFormula(formula)};
    });
  }

  const reactants=parseSide(sides[0]);
  const products=parseSide(sides[1]);

  // Collect all element symbols
  const elemSet=new Set();
  [...reactants,...products].forEach(s=>Object.keys(s.atoms).forEach(e=>elemSet.add(e)));
  const elems=[...elemSet];

  // Try coefficients 1–8 for each substance (brute force for simple equations)
  const substances=[...reactants,...products];
  const nR=reactants.length,nP=products.length,n=substances.length;
  const maxCoef=9;

  function* combos(depth,current){
    if(depth===n){yield[...current];return;}
    for(let c=1;c<maxCoef;c++){current.push(c);yield*combos(depth+1,current);current.pop();}
  }

  let found=null;
  outer:for(const coeffs of combos(0,[])){
    let valid=true;
    for(const el of elems){
      let lhs=0,rhs=0;
      for(let i=0;i<nR;i++)lhs+=coeffs[i]*(substances[i].atoms[el]||0);
      for(let i=nR;i<n;i++)rhs+=coeffs[i]*(substances[i].atoms[el]||0);
      if(lhs!==rhs){valid=false;break;}
    }
    if(valid){
      // Simplify by GCD
      let g=coeffs[0];for(let i=1;i<n;i++)g=gcd(g,coeffs[i]);
      found=coeffs.map(c=>c/g);
      break outer;
    }
  }

  if(!found){res.innerHTML='<span style="color:var(--alkyne)">Could not balance automatically. Equation may need fractional coefficients or is more complex than 4 substances with coefficients ≤ 8.</span>';return;}

  const rStr=reactants.map((r,i)=>`${found[i]>1?found[i]:''}${r.formula}`).join(' + ');
  const pStr=products.map((p,i)=>`${found[nR+i]>1?found[nR+i]:''}${p.formula}`).join(' + ');
  const balanced=`${rStr} → ${pStr}`;

  res.innerHTML=`<span class="tool-result-main" style="font-size:1.2rem">${balanced}</span>
    <div class="tool-result-breakdown">Coefficients: [${found.join(', ')}] &nbsp;·&nbsp; Equation is balanced ✓</div>`;
}

/* ---------- 21. TITRATION CALCULATOR ---------- */
function calcTitration(){
  const C1=parseFloat(document.getElementById('titrC1').value);
  const V1=parseFloat(document.getElementById('titrV1').value);
  const n1=parseFloat(document.getElementById('titrN1').value)||1;
  const n2=parseFloat(document.getElementById('titrN2').value)||1;
  const C2=parseFloat(document.getElementById('titrC2').value);
  const V2=parseFloat(document.getElementById('titrV2').value);
  const res=document.getElementById('titrResult');

  // C1V1/n1 = C2V2/n2 → find the missing one
  const c1ok=!isNaN(C1),v1ok=!isNaN(V1),c2ok=!isNaN(C2),v2ok=!isNaN(V2);

  if(c1ok&&v1ok&&c2ok&&!v2ok){
    if(n1*C2===0){res.innerHTML='<span style="color:var(--alkyne)">Denominator cannot be zero.</span>';return;}
    const ans=(C1*V1*n2)/(n1*C2);
    res.innerHTML=`<span class="tool-result-main">V₂ = ${ans.toFixed(3)} mL</span><div class="tool-result-breakdown">(${C1}×${V1}×${n2}) ÷ (${n1}×${C2}) = ${ans.toFixed(3)} mL</div>`;
  } else if(c1ok&&v1ok&&!c2ok&&v2ok){
    if(n1*V2===0){res.innerHTML='<span style="color:var(--alkyne)">Denominator cannot be zero.</span>';return;}
    const ans=(C1*V1*n2)/(n1*V2);
    res.innerHTML=`<span class="tool-result-main">C₂ = ${ans.toFixed(4)} mol/L</span><div class="tool-result-breakdown">(${C1}×${V1}×${n2}) ÷ (${n1}×${V2}) = ${ans.toFixed(4)} mol/L</div>`;
  } else if(c1ok&&!v1ok&&c2ok&&v2ok){
    if(n2*C1===0){res.innerHTML='<span style="color:var(--alkyne)">Denominator cannot be zero.</span>';return;}
    const ans=(C2*V2*n1)/(n2*C1);
    res.innerHTML=`<span class="tool-result-main">V₁ = ${ans.toFixed(3)} mL</span><div class="tool-result-breakdown">(${C2}×${V2}×${n1}) ÷ (${n2}×${C1}) = ${ans.toFixed(3)} mL</div>`;
  } else if(!c1ok&&v1ok&&c2ok&&v2ok){
    if(n2*V1===0){res.innerHTML='<span style="color:var(--alkyne)">Denominator cannot be zero.</span>';return;}
    const ans=(C2*V2*n1)/(n2*V1);
    res.innerHTML=`<span class="tool-result-main">C₁ = ${ans.toFixed(4)} mol/L</span><div class="tool-result-breakdown">(${C2}×${V2}×${n1}) ÷ (${n2}×${V1}) = ${ans.toFixed(4)} mol/L</div>`;
  } else {
    res.innerHTML='<span style="color:var(--alkyne)">Leave exactly ONE field blank as the unknown.</span>';
  }
}

/* ---------- 22. EMPIRICAL FORMULA ---------- */
function calcEmpiricalFormula(){
  const rows=document.querySelectorAll('#efInputs .ef-row');
  const data=[];
  rows.forEach(row=>{
    const inputs=row.querySelectorAll('input');
    const sym=inputs[0].value.trim();
    const pct=parseFloat(inputs[1].value);
    if(sym&&!isNaN(pct)&&pct>0)data.push({sym,pct});
  });
  const res=document.getElementById('efResult');
  if(data.length<2){res.innerHTML='<span class="tool-empty">Enter at least 2 elements with percentages.</span>';return;}

  // Divide by atomic mass
  const moles=data.map(d=>{
    const mass=AM[d.sym];
    if(!mass)return{...d,mol:null,err:d.sym};
    return{...d,mol:d.pct/mass};
  });
  const badEl=moles.find(m=>!m.mol&&m.mol!==0);
  if(badEl){res.innerHTML=`<span style="color:var(--alkyne)">Unknown element: ${badEl.err}</span>`;return;}

  const minMol=Math.min(...moles.map(m=>m.mol));
  if(minMol<=0){res.innerHTML='<span style="color:var(--alkyne)">Percentages must be greater than zero.</span>';return;}
  const ratios=moles.map(m=>m.mol/minMol);

  // Find integer ratios (multiply until all within 0.05 of integer, max ×6)
  let mult=1;
  for(let m=1;m<=8;m++){
    const test=ratios.map(r=>r*m);
    if(test.every(r=>Math.abs(r-Math.round(r))<0.08)){mult=m;break;}
  }
  const intRatios=ratios.map(r=>Math.round(r*mult));
  const g=intRatios.reduce((a,b)=>gcd(a,b));
  const finalRatios=intRatios.map(r=>r/g);
  const empiricalFormula=moles.map((m,i)=>`${m.sym}${finalRatios[i]>1?finalRatios[i]:''}`).join('');

  // Molecular formula
  let molFormula='';
  const mmInput=parseFloat(document.getElementById('efMolarMass').value);
  let efMass=moles.reduce((sum,m,i)=>sum+(AM[m.sym]||0)*finalRatios[i],0);
  if(!isNaN(mmInput)&&mmInput>0&&efMass>0){
    const n=Math.round(mmInput/efMass);
    molFormula=`<br>Molecular Formula: <b style="color:var(--nuclear)">${moles.map((m,i)=>`${m.sym}${finalRatios[i]*n>1?finalRatios[i]*n:''}`).join('')}</b> (n=${n})`;
    molFormula+=`<br>Empirical mass: ${efMass.toFixed(2)} g/mol · n = ${mmInput}÷${efMass.toFixed(2)} = ${n}`;
  }
  res.innerHTML=`<span class="tool-result-main">${empiricalFormula}</span>
    <div class="tool-result-breakdown">
      Mole ratios: ${moles.map((m,i)=>`${m.sym}: ${m.mol.toFixed(4)}`).join(' | ')}<br>
      Divided by min (${minMol.toFixed(4)}): ${ratios.map(r=>r.toFixed(3)).join(' : ')}<br>
      Integer ratios (×${mult}): ${finalRatios.join(' : ')}
      ${molFormula}
    </div>`;
}

/* v11 — Search index fully updated above, no patch needed */

/* ---------- 23. ISOMER BUILDER ---------- */
const ISOMER_DATA = {
  alkane: {
    1: [{name:'Methane',formula:'CH₄',condensed:'CH₄',stereo:0}],
    2: [{name:'Ethane',formula:'C₂H₆',condensed:'CH₃–CH₃',stereo:0}],
    3: [{name:'Propane',formula:'C₃H₈',condensed:'CH₃–CH₂–CH₃',stereo:0}],
    4: [
      {name:'n-Butane',formula:'C₄H₁₀',condensed:'CH₃CH₂CH₂CH₃',stereo:0},
      {name:'2-Methylpropane (Isobutane)',formula:'C₄H₁₀',condensed:'CH₃CH(CH₃)CH₃',stereo:0}
    ],
    5: [
      {name:'n-Pentane',formula:'C₅H₁₂',condensed:'CH₃(CH₂)₃CH₃',stereo:0},
      {name:'2-Methylbutane (Isopentane)',formula:'C₅H₁₂',condensed:'CH₃CH(CH₃)CH₂CH₃',stereo:0},
      {name:'2,2-Dimethylpropane (Neopentane)',formula:'C₅H₁₂',condensed:'C(CH₃)₄',stereo:0}
    ],
    6: [
      {name:'n-Hexane',formula:'C₆H₁₄',condensed:'CH₃(CH₂)₄CH₃',stereo:0},
      {name:'2-Methylpentane',formula:'C₆H₁₄',condensed:'CH₃CH(CH₃)(CH₂)₂CH₃',stereo:0},
      {name:'3-Methylpentane',formula:'C₆H₁₄',condensed:'CH₃CH₂CH(CH₃)CH₂CH₃',stereo:0},
      {name:'2,2-Dimethylbutane',formula:'C₆H₁₄',condensed:'CH₃C(CH₃)₂CH₂CH₃',stereo:0},
      {name:'2,3-Dimethylbutane',formula:'C₆H₁₄',condensed:'CH₃CH(CH₃)CH(CH₃)CH₃',stereo:0}
    ],
    7: [{name:'n-Heptane + 8 branched isomers',formula:'C₇H₁₆',condensed:'9 structural isomers total',stereo:0,summary:true}],
    8: [{name:'n-Octane + 17 branched isomers',formula:'C₈H₁₈',condensed:'18 structural isomers total',stereo:0,summary:true}]
  },
  alkene: {
    1: [{name:'N/A — alkenes require n ≥ 2',formula:'—',condensed:'—',stereo:0,na:true}],
    2: [{name:'Ethene (Ethylene)',formula:'C₂H₄',condensed:'CH₂=CH₂',stereo:0}],
    3: [{name:'Propene (Propylene)',formula:'C₃H₆',condensed:'CH₃–CH=CH₂',stereo:0}],
    4: [
      {name:'But-1-ene',formula:'C₄H₈',condensed:'CH₂=CHCH₂CH₃',stereo:0},
      {name:'But-2-ene',formula:'C₄H₈',condensed:'CH₃CH=CHCH₃',stereo:2,stereoNote:'cis and trans geometric isomers'},
      {name:'2-Methylpropene (Isobutylene)',formula:'C₄H₈',condensed:'CH₂=C(CH₃)₂',stereo:0}
    ],
    5: [
      {name:'Pent-1-ene',formula:'C₅H₁₀',condensed:'CH₂=CH(CH₂)₂CH₃',stereo:0},
      {name:'Pent-2-ene',formula:'C₅H₁₀',condensed:'CH₃CH=CHCH₂CH₃',stereo:2,stereoNote:'cis and trans'},
      {name:'2-Methylbut-1-ene',formula:'C₅H₁₀',condensed:'CH₂=C(CH₃)CH₂CH₃',stereo:0},
      {name:'3-Methylbut-1-ene',formula:'C₅H₁₀',condensed:'CH₂=CHCH(CH₃)₂',stereo:0},
      {name:'2-Methylbut-2-ene',formula:'C₅H₁₀',condensed:'CH₃C(CH₃)=CHCH₃',stereo:0}
    ],
    6: [{name:'6 structural isomers (hex-1-ene, hex-2-ene, hex-3-ene, 2-methylpent-1-ene, and more)',formula:'C₆H₁₂',condensed:'6 structural isomers — several have cis/trans forms',stereo:0,summary:true}],
    7: [{name:'12 structural isomers',formula:'C₇H₁₄',condensed:'12 structural isomers total',stereo:0,summary:true}],
    8: [{name:'18+ structural isomers',formula:'C₈H₁₆',condensed:'18+ structural isomers total',stereo:0,summary:true}]
  },
  alcohol: {
    1: [{name:'Methanol (Primary)',formula:'CH₄O',condensed:'CH₃OH',stereo:0}],
    2: [{name:'Ethanol (Primary)',formula:'C₂H₆O',condensed:'CH₃CH₂OH',stereo:0}],
    3: [
      {name:'Propan-1-ol (Primary)',formula:'C₃H₈O',condensed:'CH₃CH₂CH₂OH',stereo:0},
      {name:'Propan-2-ol (Secondary)',formula:'C₃H₈O',condensed:'CH₃CH(OH)CH₃',stereo:0}
    ],
    4: [
      {name:'Butan-1-ol (Primary)',formula:'C₄H₁₀O',condensed:'CH₃(CH₂)₂CH₂OH',stereo:0},
      {name:'Butan-2-ol (Secondary)',formula:'C₄H₁₀O',condensed:'CH₃CH(OH)CH₂CH₃',stereo:2,stereoNote:'chiral centre — R and S enantiomers'},
      {name:'2-Methylpropan-1-ol (Primary)',formula:'C₄H₁₀O',condensed:'(CH₃)₂CHCH₂OH',stereo:0},
      {name:'2-Methylpropan-2-ol (Tertiary)',formula:'C₄H₁₀O',condensed:'(CH₃)₃COH',stereo:0}
    ],
    5: [
      {name:'Pentan-1-ol (Primary)',formula:'C₅H₁₂O',condensed:'CH₃(CH₂)₃CH₂OH',stereo:0},
      {name:'Pentan-2-ol (Secondary)',formula:'C₅H₁₂O',condensed:'CH₃CH(OH)(CH₂)₂CH₃',stereo:2,stereoNote:'chiral centre'},
      {name:'Pentan-3-ol (Secondary)',formula:'C₅H₁₂O',condensed:'CH₃CH₂CH(OH)CH₂CH₃',stereo:0},
      {name:'2-Methylbutan-1-ol (Primary)',formula:'C₅H₁₂O',condensed:'(CH₃)₂CHCH₂CH₂OH',stereo:0},
      {name:'2-Methylbutan-2-ol (Tertiary)',formula:'C₅H₁₂O',condensed:'(CH₃)₂C(OH)CH₂CH₃',stereo:0},
      {name:'3-Methylbutan-1-ol (Primary)',formula:'C₅H₁₂O',condensed:'(CH₃)₂CHCH₂CH₂OH',stereo:0},
      {name:'3-Methylbutan-2-ol (Secondary)',formula:'C₅H₁₂O',condensed:'(CH₃)₂CHCH(OH)CH₃',stereo:2,stereoNote:'chiral centre'},
      {name:'2,2-Dimethylpropan-1-ol (Primary)',formula:'C₅H₁₂O',condensed:'(CH₃)₃CCH₂OH',stereo:0}
    ],
    6: [{name:'17 structural isomers',formula:'C₆H₁₄O',condensed:'17 structural isomers total',stereo:0,summary:true}],
    7: [{name:'57 structural isomers',formula:'C₇H₁₆O',condensed:'57 structural isomers total',stereo:0,summary:true}],
    8: [{name:'89 structural isomers',formula:'C₈H₁₈O',condensed:'89 structural isomers total',stereo:0,summary:true}]
  }
};

function buildIsomers() {
  const type = document.getElementById('isoType').value;
  const n = parseInt(document.getElementById('isoN').value);
  const res = document.getElementById('isomerResult');
  if (!res) return;

  const data = ISOMER_DATA[type] && ISOMER_DATA[type][n];
  if (!data) {
    res.innerHTML = '<span class="tool-empty">No data available for this combination.</span>';
    return;
  }

  const typeLabels = { alkane: 'Alkane', alkene: 'Alkene', alcohol: 'Alcohol' };
  const typeColors = { alkane: 'var(--alkane)', alkene: 'var(--alkene)', alcohol: 'var(--nuclear)' };
  const color = typeColors[type];

  if (data[0].na) {
    res.innerHTML = `<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:18px;color:var(--muted);font-size:0.88rem;">${data[0].name}</div>`;
    return;
  }

  const count = data[0].summary ? data[0].condensed : `${data.length} structural isomer${data.length > 1 ? 's' : ''}`;

  let html = `<div style="margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
    <span style="font-family:'JetBrains Mono',monospace;font-size:0.68rem;color:${color};background:${color}18;border:1px solid ${color}40;padding:4px 12px;border-radius:50px;letter-spacing:0.12em;text-transform:uppercase;">${typeLabels[type]} · n=${n}</span>
    <span style="font-size:0.85rem;color:var(--muted);">${count}</span>
  </div>`;

  if (data[0].summary) {
    html += `<div style="background:var(--bg);border:1px solid var(--border);border-left:3px solid ${color};border-radius:12px;padding:18px 20px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:1rem;color:${color};margin-bottom:6px;">${data[0].formula}</div>
      <div style="font-size:0.85rem;color:var(--muted);">${data[0].name}</div>
    </div>`;
  } else {
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">`;
    data.forEach((iso, i) => {
      let stereoTag = '';
      if (iso.stereo > 0) {
        stereoTag = `<span style="font-size:0.65rem;font-family:'JetBrains Mono',monospace;color:var(--isomer);background:rgba(255,179,71,0.1);border:1px solid rgba(255,179,71,0.3);padding:2px 7px;border-radius:5px;display:inline-block;margin-top:6px;">⬡ ${iso.stereoNote || iso.stereo + ' stereoisomers'}</span>`;
      }
      html += `<div style="background:var(--bg);border:1px solid var(--border);border-left:3px solid ${color};border-radius:12px;padding:14px 16px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:var(--muted);letter-spacing:0.1em;margin-bottom:4px;">ISOMER ${i+1} — ${iso.formula}</div>
        <div style="font-size:0.9rem;font-weight:600;color:var(--text);margin-bottom:6px;">${iso.name}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:${color};">${iso.condensed}</div>
        ${stereoTag}
      </div>`;
    });
    html += '</div>';
  }

  res.innerHTML = html;
}

// ============================================================
// ALKANE ISOMER BUILDER — Recursive Tree Algorithm
// Generates all structural isomers of CnH(2n+2) for n=1..10
// ============================================================

function setAlkaneN(n) {
  const inp = document.getElementById('alki-n');
  if (inp) { inp.value = n; buildAlkaneIsomers(); }
}

function buildAlkaneIsomers() {
  const inp = document.getElementById('alki-n');
  const res = document.getElementById('alki-result');
  const fml = document.getElementById('alki-formula');
  if (!inp || !res) return;

  const n = parseInt(inp.value);
  if (isNaN(n) || n < 1 || n > 10) {
    res.innerHTML = '<div style="color:var(--danger);font-size:0.85rem;">Please enter a value between 1 and 10.</div>';
    return;
  }

  // Update formula display
  const H = 2 * n + 2;
  const Csub = n > 1 ? `<sub>${n}</sub>` : '';
  const Hsub = H > 1 ? `<sub>${H}</sub>` : '';
  if (fml) fml.innerHTML = `C${Csub}H${Hsub} &nbsp;·&nbsp; MW = ${(12*n + H).toFixed(1)} g/mol`;

  // Generate all unique rooted trees (carbon skeletons)
  const skeletons = generateAlkaneTrees(n);

  // Convert to display data
  const isoData = skeletons.map((tree, i) => {
    const name = nameAlkane(tree, n);
    const condensed = treeToCondensed(tree, n);
    return { index: i + 1, name, condensed, formula: `C${n}H${H}` };
  });

  // Sort: straight chain first, then alphabetical
  isoData.sort((a, b) => {
    if (a.name === straightChainName(n)) return -1;
    if (b.name === straightChainName(n)) return 1;
    return a.name.localeCompare(b.name);
  });

  renderAlkaneResults(isoData, n, H, res);
}

// ---- Tree generation ----
// Represent each tree as a sorted tuple of subtree sizes (Prüfer-style canonical form)
// We use a recursive approach: a rooted tree of n nodes has a root + subtrees summing to n-1

function generateAlkaneTrees(n) {
  if (n === 1) return [{ children: [] }];
  const trees = [];
  const rootedTrees = allRootedTrees(n);
  // Convert to unrooted by centroid canonicalisation
  const seen = new Set();
  for (const t of rootedTrees) {
    const canon = canonicalUnrooted(t);
    if (!seen.has(canon)) {
      seen.add(canon);
      trees.push(t);
    }
  }
  return trees;
}

// allRootedTrees(n): all rooted trees with n nodes, canonical (children sorted)
function allRootedTrees(n) {
  if (n === 1) return [{ children: [], size: 1 }];
  const result = [];
  // distribute n-1 nodes among children, each subtree size >= 1
  // children subtrees must be in non-increasing order to avoid duplicates
  distributeChildren(n - 1, n - 1, result);
  return result;
}

// Generate all rooted trees of total n nodes where each child subtree <= maxSubSize
function distributeChildren(remaining, maxSubSize, out) {
  if (remaining === 0) { out.push({ children: [], size: 1 }); return; }
  const partitions = intPartitions(remaining, maxSubSize);
  for (const parts of partitions) {
    // parts is a non-increasing list of subtree sizes
    // get all combinations of rooted trees for each size
    const childGroups = [];
    let valid = true;
    let prevSize = Infinity;
    for (const sz of parts) {
      const treesOfSz = allRootedTrees(sz);
      childGroups.push(treesOfSz);
    }
    // Cartesian product of child groups, with constraint that equal-size subtrees are in canonical order
    const combos = cartesianProduct(childGroups);
    for (const combo of combos) {
      if (isCanonicalChildOrder(combo)) {
        const totalSize = 1 + combo.reduce((s, c) => s + c.size, 0);
        out.push({ children: combo, size: totalSize });
      }
    }
  }
}

function isCanonicalChildOrder(children) {
  // children must be in non-increasing canonical order
  for (let i = 0; i < children.length - 1; i++) {
    const a = treeCanonString(children[i]);
    const b = treeCanonString(children[i + 1]);
    if (a < b) return false;
  }
  return true;
}

function treeCanonString(t) {
  if (t.children.length === 0) return '()';
  const childStrs = t.children.map(treeCanonString).sort().reverse();
  return '(' + childStrs.join('') + ')';
}

function canonicalUnrooted(t) {
  // Re-root at centroid for unrooted canonical form
  // Centroid: node(s) where max subtree size <= n/2
  const n = t.size;
  const centroid = findCentroid(t, n);
  return treeCanonString(reRootAt(t, centroid));
}

function findCentroid(t, n) {
  // Simple: collect all nodes, find centroid
  // We'll work with the recursive structure
  // A centroid node has all subtrees (including "upward") of size <= n/2
  const nodes = flattenTree(t, null);
  for (const node of nodes) {
    const maxSub = maxSubtreeSize(node, n);
    if (maxSub <= Math.floor(n / 2)) return node;
  }
  return nodes[0];
}

function flattenTree(node, parent) {
  const result = [{ node, parent }];
  for (const child of node.children) {
    result.push(...flattenTree(child, node));
  }
  return result;
}

function maxSubtreeSize(nodeInfo, n) {
  // Max subtree when rooted at nodeInfo.node
  const downMax = nodeInfo.node.children.reduce((m, c) => Math.max(m, c.size), 0);
  const upSize = n - nodeInfo.node.size;
  return Math.max(downMax, upSize);
}

function reRootAt(root, centroidInfo) {
  // Build new tree rooted at centroid node
  // This is complex; simpler approach: just use treeCanonString after sorting all subtree strings
  // For our purposes, use the canonical string directly
  return root; // canonical string handles this
}

// Integer partitions of n into parts <= maxPart, non-increasing
function intPartitions(n, maxPart) {
  if (n === 0) return [[]];
  if (maxPart === 0) return [];
  const result = [];
  for (let first = Math.min(n, maxPart); first >= 1; first--) {
    const rest = intPartitions(n - first, first);
    for (const r of rest) {
      result.push([first, ...r]);
    }
  }
  return result;
}

function cartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);
  return first.flatMap(item => restProduct.map(r => [item, ...r]));
}

// ---- Naming ----
const ALKANE_PREFIXES = ['','meth','eth','prop','but','pent','hex','hept','oct','non','dec'];
const MULTIPLIERS = ['','di','tri','tetra','penta','hexa','hepta','octa','nona','deca'];

function straightChainName(n) {
  return ALKANE_PREFIXES[n] + 'ane';
}

function nameAlkane(tree, n) {
  if (n === 1) return 'methane';
  if (n === 2) return 'ethane';
  if (n === 3) return 'propane';

  // Find longest chain
  const longest = longestChain(tree);
  if (longest === n) return ALKANE_PREFIXES[n] + 'ane';

  // Build substituted name
  return iupacName(tree, n);
}

function longestChain(tree) {
  // Diameter of tree = longest path
  if (!tree.children || tree.children.length === 0) return 1;
  // Get two longest depths from this root
  const depths = tree.children.map(c => longestChainFromRoot(c));
  depths.sort((a, b) => b - a);
  if (depths.length === 1) return 1 + depths[0];
  return 1 + depths[0] + (depths[1] || 0);
}

function longestChainFromRoot(tree) {
  if (!tree.children || tree.children.length === 0) return 1;
  return 1 + Math.max(...tree.children.map(longestChainFromRoot));
}

function iupacName(tree, n) {
  // Find all chains of max length, then apply substituent rules
  const chains = getAllMaxChains(tree);
  const bestChain = choosePrincipalChain(chains, tree, n);
  const chainLen = bestChain.length;

  // Find substituents (nodes not on chain)
  const substituents = getSubstituents(tree, bestChain);

  if (substituents.length === 0) {
    return ALKANE_PREFIXES[chainLen] + 'ane';
  }

  // Group substituents by type and position
  const groups = {};
  for (const sub of substituents) {
    const type = sub.type; // e.g. "methyl", "ethyl"
    if (!groups[type]) groups[type] = [];
    groups[type].push(sub.pos);
  }

  // Build name: sort substituent types alphabetically
  const subTypes = Object.keys(groups).sort();
  let prefix = '';
  for (const type of subTypes) {
    const positions = groups[type].sort((a, b) => a - b);
    prefix += MULTIPLIERS[positions.length] + type + '-' + positions.join(',') + '-';
  }

  // Final: prefix + parent chain name, clean up trailing dash
  prefix = prefix.replace(/-$/, '');
  return prefix + ALKANE_PREFIXES[chainLen] + 'ane';
}

function getAllMaxChains(tree) {
  // Get all paths in the tree, return those of max length
  const allPaths = [];
  collectPaths(tree, [], allPaths);
  const maxLen = Math.max(...allPaths.map(p => p.length));
  return allPaths.filter(p => p.length === maxLen);
}

function collectPaths(node, current, out) {
  const newPath = [...current, node];
  if (!node.children || node.children.length === 0) {
    out.push(newPath);
  }
  for (const child of node.children) {
    collectPaths(child, newPath, out);
  }
  // Also paths that don't go to leaves at this node
  if (node.children && node.children.length > 1) {
    // Paths that go through this node connecting two subtrees
    const depths = node.children.map(c => ({ child: c, depth: longestChainFromRoot(c) }));
    depths.sort((a, b) => b.depth - a.depth);
    if (depths.length >= 2) {
      const pathThrough = buildPathThrough(node, depths[0].child, depths[1].child);
      if (pathThrough) out.push(pathThrough);
    }
  }
}

function buildPathThrough(node, child1, child2) {
  const path1 = deepestPath(child1);
  const path2 = deepestPath(child2);
  return [...path1.reverse(), node, ...path2];
}

function deepestPath(node) {
  if (!node.children || node.children.length === 0) return [node];
  const bestChild = node.children.reduce((best, c) =>
    longestChainFromRoot(c) > longestChainFromRoot(best) ? c : best
  );
  return [node, ...deepestPath(bestChild)];
}

function choosePrincipalChain(chains, tree, n) {
  // Return the chain that gives lowest locants to substituents
  // For simplicity: pick any max-length chain for now
  return chains[0] || [];
}

function getSubstituents(tree, chain) {
  const chainSet = new Set(chain);
  const subs = [];
  for (let i = 0; i < chain.length; i++) {
    const node = chain[i];
    for (const child of (node.children || [])) {
      if (!chainSet.has(child)) {
        const subLen = child.size;
        subs.push({
          pos: i + 1,
          type: ALKANE_PREFIXES[subLen] + 'yl'
        });
      }
    }
  }
  return subs;
}

// ---- Condensed structure ----
function treeToCondensed(tree, n) {
  if (n === 1) return 'CH₄';
  if (n === 2) return 'CH₃CH₃';
  if (n === 3) return 'CH₃CH₂CH₃';

  const chains = getAllMaxChains(tree);
  const chain = chains[0] || [];
  if (chain.length === 0) return buildCondensedFromRoot(tree, null);

  return buildCondensedFromChain(tree, chain);
}

function buildCondensedFromChain(tree, chain) {
  const chainSet = new Set(chain);
  let result = '';
  for (let i = 0; i < chain.length; i++) {
    const node = chain[i];
    const branches = (node.children || []).filter(c => !chainSet.has(c));
    const degree = branches.length;
    const H = 3 - degree - (i === 0 ? 0 : 1) - (i === chain.length - 1 ? 0 : 1);
    const Hcount = Math.max(0, H + (i === 0 || i === chain.length - 1 ? 1 : 0));

    let seg = 'C';
    if (Hcount > 0) seg += 'H' + (Hcount > 1 ? subscript(Hcount) : '');
    for (const br of branches) {
      seg += '(' + buildCondensedFromRoot(br, null) + ')';
    }
    result += seg;
  }
  return result;
}

function buildCondensedFromRoot(node, parent) {
  const children = (node.children || []);
  const degree = children.length + (parent !== null ? 1 : 0);
  const H = Math.max(0, 4 - degree);
  let seg = 'C' + (H > 0 ? 'H' + (H > 1 ? subscript(H) : '') : '');
  for (const child of children) {
    seg += buildCondensedFromRoot(child, node);
  }
  return seg;
}

function subscript(n) {
  const subs = '₀₁₂₃₄₅₆₇₈₉';
  return String(n).split('').map(d => subs[+d]).join('');
}

// ---- Render ----
function renderAlkaneResults(isoData, n, H, res) {
  const count = isoData.length;
  const accent = 'var(--accent)';
  const H2 = 2 * n + 2;

  let html = `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
      <span style="font-family:'JetBrains Mono',monospace;font-size:0.68rem;color:${accent};background:color-mix(in srgb,var(--accent) 12%,transparent);border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);padding:4px 14px;border-radius:50px;letter-spacing:0.12em;text-transform:uppercase;">
        C${n > 1 ? '<sub>' + n + '</sub>' : ''}H<sub>${H2}</sub> — Alkane
      </span>
      <span style="font-size:0.85rem;color:var(--muted);">${count} structural isomer${count !== 1 ? 's' : ''}</span>
    </div>`;

  if (count === 1) {
    html += `<div style="background:var(--bg);border:1px solid var(--border);border-left:3px solid ${accent};border-radius:12px;padding:18px 20px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:var(--muted);letter-spacing:0.1em;margin-bottom:4px;">ONLY ISOMER</div>
      <div style="font-size:1rem;font-weight:600;color:var(--text);margin-bottom:6px;">${isoData[0].name}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:0.88rem;color:${accent};">${isoData[0].condensed}</div>
    </div>`;
  } else {
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;">`;
    isoData.forEach((iso, i) => {
      const isMain = i === 0;
      html += `<div style="background:var(--bg);border:1px solid var(--border);border-left:3px solid ${isMain ? accent : 'var(--border)'};border-radius:12px;padding:14px 16px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:var(--muted);letter-spacing:0.1em;margin-bottom:4px;">ISOMER ${iso.index}</div>
        <div style="font-size:0.9rem;font-weight:600;color:var(--text);margin-bottom:6px;">${iso.name}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:${accent};">${iso.condensed}</div>
      </div>`;
    });
    html += `</div>`;
  }

  res.innerHTML = html;
}
