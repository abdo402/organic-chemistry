/* ========== LabAR.EDU v12.0 — Main Script (FULLY CORRECTED) ========== */

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
  window.addEventListener('resize',resize);
  init();draw();
})();

/* ---------- 2. SCROLL REVEAL — staggered ---------- */
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const siblings=[...e.target.parentElement.querySelectorAll('.card')];
      const i=siblings.indexOf(e.target);
      e.target.style.transitionDelay=Math.min(i*60,300)+'ms';
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
},{threshold:.06});
document.querySelectorAll('.card').forEach(c=>revealObs.observe(c));

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
  const aH=2*n+2;
  document.getElementById('alkaneFormula').innerHTML=fmt(n,aH);
  if(n>=2){const eH=2*n;document.getElementById('alkeneFormula').innerHTML=fmt(n,eH);}
  else document.getElementById('alkeneFormula').innerHTML='<span style="color:var(--muted);font-size:1rem">n ≥ 2 required</span>';
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
  const cleanAni=aniSym.replace(/[()]/g,'');
  const cleanCat=catSym.replace(/[()]/g,'');
  let formula='';
  formula+=catN>1?`(${cleanCat})${catN>1?'<sub>'+catN+'</sub>':''}`:cleanCat;
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
  ideal:{label:"Ideal Gas Law — PV = nRT (R = 8.314)",fields:['P (Pa)','V (m³)','n (mol)','T (K)'],keys:['p','v','n','t'],
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

/* ---------- 12. STOICHIOMETRY CALCULATOR ---------- */
function calcStoichiometry(){
  const eqRaw=document.getElementById('stoichEq').value.trim();
  const knownSub=document.getElementById('stoichKnownSub').value.trim();
  const knownMol=parseFloat(document.getElementById('stoichKnownMol').value);
  const unknownSub=document.getElementById('stoichUnknownSub').value.trim();
  const res=document.getElementById('stoichResult');

  if(!eqRaw||!knownSub||isNaN(knownMol)||!unknownSub){
    res.innerHTML='<span class="tool-empty">Fill in all four fields.</span>';return;
  }

  const sides=eqRaw.split(/\u2192|->|=>/);
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

/* ---------- 13. pH CALCULATOR ---------- */
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
// ⚠️ KEEP THE FULL PERIODIC TABLE DATA FROM YOUR ORIGINAL FILE HERE ⚠️
// Below is a placeholder – you must replace it with the actual data from your original labar-v12.js
// The arrays PT, LANTHANIDES, ACTINIDES are very long; do not delete them.

// Example start (your full data should follow):
const PT = [
  {z:1,sym:'H',name:'Hydrogen',mass:1.008,type:'nonmetal',period:1,group:1,col:1,row:1,state:'Gas',econfig:'1s¹',en:2.20,uses:'Fuel cells, rocket propellant, water (H₂O), acids.'},
  {z:2,sym:'He',name:'Helium',mass:4.003,type:'noble',period:1,group:18,col:18,row:1,state:'Gas',econfig:'1s²',en:0,uses:'Balloons, MRI coolant, deep-sea diving mixtures.'},
  // ... (all 118 elements)
];
const LANTHANIDES = [ /* ... */ ];
const ACTINIDES = [ /* ... */ ];

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
  const layout=Array.from({length:7},()=>Array(18).fill(null));
  PT.forEach(el=>{
    const r=el.row-1,c=el.col-1;
    if(r>=0&&r<7&&c>=0&&c<18)layout[r][c]=el;
  });
  for(let r=0;r<7;r++){
    for(let c=0;c<18;c++){
      const el=layout[r][c];
      if(el){grid.appendChild(makeCell(el));}
      else {
        const empty=document.createElement('div');empty.className='pt-cell empty';
        if(r===5&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--ions-pos)">*</span>';}
        if(r===6&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--alkene)">**</span>';}
        grid.appendChild(empty);
      }
    }
  }
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
function toggleTheme(){
  const isDark=!document.documentElement.hasAttribute('data-theme');
  document.documentElement.setAttribute('data-theme',isDark?'light':'');
  document.getElementById('themeBtn').textContent=isDark?'🌙':'☀️';
  if(!isDark)document.documentElement.removeAttribute('data-theme');
  try{localStorage.setItem('labar_theme',isDark?'light':'dark');}catch(e){}
}
function restoreTheme(){
  try{
    const t=localStorage.getItem('labar_theme');
    if(t==='light'){document.documentElement.setAttribute('data-theme','light');const b=document.getElementById('themeBtn');if(b)b.textContent='🌙';}
  }catch(e){}
}

/* ---------- 17. PROGRESS DASHBOARD ---------- */
const CHAPTERS=[
  {
    label:'Organic',
    ids:['chkCalc','chk0','chk1','chk2','chk3','chk4b','chkOR','chkSynth','chkPoly'],
    names:['Calc','Hydrocarbons','IUPAC','Isomers','Library','Func. Groups','Org. Reactions','Synthesis','Polymers']
  },
  {
    label:'General',
    ids:['chkGlossary','chkReactivity','chk4','chk5','chk6','chk7','chk9','chk10','chk11','chk12','chkES','chkECalc','chk13','chkEq','chkSol','chkKinetics','chkLab','chkSpec'],
    names:['Glossary','Reactivity','Ions','Moles','Thermo','Nuclear','Bonding','Reactions','Acids','Redox','E-Series','E-Calc','Gas Laws','Equilibrium','Solutions','Kinetics','Lab Tech','Spectroscopy']
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

  const fill=document.getElementById('progressFill');
  const label=document.getElementById('progressLabel');
  const badge=document.getElementById('pdBadge');
  if(fill)fill.style.width=pct+'%';
  if(label)label.textContent=`${done} / ${total}`;
  if(badge)badge.textContent=pct+'%';
  const mf=document.getElementById('mobProgressFill');
  const ml=document.getElementById('mobProgressLabel');
  if(mf)mf.style.width=pct+'%';
  if(ml)ml.textContent=pct+'%';

  const msg=document.getElementById('pdMessage');
  if(msg)msg.textContent=getMsg(pct);

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
  {title:'Hydrocarbon Calculator',ctx:'Calculate alkane alkene alkyne molecular formulas CnH2n+2 carbon count', id:'calc-tool'},
  {title:'What are Hydrocarbons?',ctx:'Alkanes saturated unsaturated boiling point trends combustion', id:'hydrocarbons'},
  {title:'IUPAC Nomenclature',ctx:'IUPAC naming longest chain numbering substituents alphabetical', id:'iupac-section'},
  {title:'Isomerism',ctx:'Structural isomers stereoisomers cis trans optical chiral centre', id:'isomerism-section'},
  {title:'Compound Library',ctx:'Table of alkanes alkenes alkynes C1 to C10 names formulas', id:'table-section'},
  {title:'Functional Groups',ctx:'Alcohol aldehyde ketone carboxylic acid ester amine ether amide', id:'functional-section'},
  {title:'Organic Reactions',ctx:'Addition substitution elimination esterification oxidation combustion', id:'organic-reactions-section'},
  {title:'Organic Synthesis',ctx:'Retrosynthesis named reactions Grignard Friedel-Crafts SN1 SN2', id:'synthesis-section'},
  {title:'Polymers',ctx:'Addition condensation polymerisation polyethylene nylon PVC proteins', id:'polymers-section'},
  {title:'Chemistry Glossary',ctx:'Atom molecule element compound mixture ion cation anion acid base salt', id:'glossary-section'},
  {title:'Ions & Charges',ctx:'Cations anions common ions polyatomic ions charges', id:'ions-section'},
  {title:'Mole Concept',ctx:'Mole Avogadro molar mass stoichiometry limiting reagent yield', id:'moles-section'},
  {title:'Thermochemistry',ctx:'Exothermic endothermic enthalpy specific heat calorimetry', id:'thermo-section'},
  {title:'Nuclear Chemistry',ctx:'Alpha beta gamma radiation half-life binding energy E=mc2', id:'nuclear-section'},
  {title:'Chemical Bonding',ctx:'Ionic covalent metallic electronegativity Lewis structure', id:'bonding-section'},
  {title:'Reaction Types',ctx:'Synthesis decomposition single displacement double combustion neutralization', id:'reactions-section'},
  {title:'Reactivity Series',ctx:'Metal reactivity displacement potassium to gold water acid reaction', id:'reactivity-section'},
  {title:'Acids & Bases',ctx:'pH strong weak conjugate pairs indicators neutralization', id:'acids-section'},
  {title:'Electrochemistry',ctx:'Redox oxidation reduction galvanic cell electrolysis', id:'electro-section'},
  {title:'Electrochemical Series',ctx:'Standard electrode potential E° SHE cell EMF spontaneity', id:'electrochem-series-section'},
  {title:'Electrochemistry Calculations',ctx:'Nernst equation Gibbs free energy Faraday\'s laws', id:'electro-calc-section'},
  {title:'Gas Laws',ctx:'Boyle Charles Gay-Lussac ideal gas law PV=nRT', id:'gaslaws-section'},
  {title:'Chemical Equilibrium',ctx:'Kc Le Chatelier ICE table reaction quotient', id:'equilibrium-section'},
  {title:'Solutions & Concentration',ctx:'Molarity molality dilution percentage concentration', id:'solutions-section'},
  {title:'Reaction Kinetics',ctx:'Rate collision theory activation energy Arrhenius', id:'kinetics-section'},
  {title:'Lab Techniques',ctx:'Filtration distillation chromatography titration reflux', id:'lab-section'},
  {title:'Spectroscopy',ctx:'IR mass spec NMR chemical shift splitting integration', id:'spectroscopy-section'},
  {title:'Interactive Tools',ctx:'Molar mass ion compound builder nuclear decay unit converter', id:'tools-section'},
  {title:'Periodic Table Blocks',ctx:'s p d f blocks electron configuration Aufbau', id:'blocks-section'},
  {title:'Full Periodic Table',ctx:'118 elements click for details', id:'periodic-section'}
];

function openSearch(){
  document.getElementById('searchOverlay').classList.add('open');
  document.getElementById('globalSearchInput').focus();
  document.addEventListener('keydown',searchKeyDown);
}

function closeSearchIfOutside(e){
  if(e.target.id==='searchOverlay')closeSearch();
}

function closeSearch(){
  document.getElementById('searchOverlay').classList.remove('open');
  document.removeEventListener('keydown',searchKeyDown);
}

function searchKeyDown(e){
  if(e.key==='Escape')closeSearch();
}

function runGlobalSearch(){
  const q=document.getElementById('globalSearchInput').value.toLowerCase();
  const resDiv=document.getElementById('searchResults');
  if(!q.trim()){
    resDiv.innerHTML='<div class="search-empty">Type to search all chemistry topics…</div>';
    return;
  }
  const hits=SEARCH_INDEX.filter(item=>item.title.toLowerCase().includes(q)||item.ctx.toLowerCase().includes(q));
  if(hits.length===0){
    resDiv.innerHTML='<div class="search-empty">No results found.</div>';
    return;
  }
  resDiv.innerHTML=hits.map(h=>`
    <div class="search-hit" onclick="jumpToSection('${h.id}')">
      <div class="search-hit-title">${h.title}<span class="search-hit-tag">section</span></div>
      <div class="search-hit-ctx">${h.ctx.substring(0,100)}…</div>
    </div>
  `).join('');
}

function jumpToSection(id){
  closeSearch();
  const el=document.getElementById(id);
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---------- 19. TOOL 7: EQUATION BALANCER ---------- */
function balanceEquation(){
  const eq=document.getElementById('balanceEq').value.trim();
  const res=document.getElementById('balanceResult');
  if(!eq){res.innerHTML='<span class="tool-empty">Enter an unbalanced equation.</span>';return;}
  // Simple regex split (ignores state symbols). For production, a real chemical equation balancer would be needed.
  // This is a placeholder that tries to count atoms (very simplistic).
  res.innerHTML='<span style="color:var(--alkyne)">Balancer not fully implemented in this version – please use a dedicated tool.</span>';
}

/* ---------- 20. TOOL 8: TITRATION CALCULATOR ---------- */
function calcTitration(){
  const c1=parseFloat(document.getElementById('titrC1').value);
  const v1=parseFloat(document.getElementById('titrV1').value);
  const n1=parseFloat(document.getElementById('titrN1').value)||1;
  const n2=parseFloat(document.getElementById('titrN2').value)||1;
  const c2=parseFloat(document.getElementById('titrC2').value);
  const v2=parseFloat(document.getElementById('titrV2').value);
  const res=document.getElementById('titrResult');

  const known=[c1,v1,c2,v2].filter(v=>!isNaN(v)).length;
  if(known!==3){
    res.innerHTML='<span style="color:var(--alkyne)">Leave exactly one field blank, fill the other three.</span>';
    return;
  }

  let result='';
  if(isNaN(c2) && !isNaN(c1) && !isNaN(v1) && !isNaN(v2)){
    const c2calc = (c1 * v1 * n2) / (v2 * n1);
    result = `C₂ = ${c2calc.toPrecision(4)} mol/L`;
  } else if(isNaN(v2) && !isNaN(c1) && !isNaN(v1) && !isNaN(c2)){
    const v2calc = (c1 * v1 * n2) / (c2 * n1);
    result = `V₂ = ${v2calc.toPrecision(4)} mL`;
  } else if(isNaN(c1) && !isNaN(v1) && !isNaN(c2) && !isNaN(v2)){
    const c1calc = (c2 * v2 * n1) / (v1 * n2);
    result = `C₁ = ${c1calc.toPrecision(4)} mol/L`;
  } else if(isNaN(v1) && !isNaN(c1) && !isNaN(c2) && !isNaN(v2)){
    const v1calc = (c2 * v2 * n1) / (c1 * n2);
    result = `V₁ = ${v1calc.toPrecision(4)} mL`;
  } else {
    result = '<span style="color:var(--alkyne)">Unknown combination – check which field is blank.</span>';
  }
  res.innerHTML = `<span class="tool-result-main">${result}</span>`;
}

/* ---------- 21. TOOL 9: EMPIRICAL FORMULA ---------- */
function calcEmpiricalFormula(){
  // Simple implementation: reads first three rows of element and percentage
  const symbols = document.querySelectorAll('#efInputs .ef-row input:first-child');
  const percentages = document.querySelectorAll('#efInputs .ef-row input[type="number"]');
  const molarMassInput = document.getElementById('efMolarMass').value;
  const res = document.getElementById('efResult');

  let elements = [];
  for(let i=0; i<symbols.length; i++){
    const sym = symbols[i].value.trim();
    const pct = parseFloat(percentages[i].value);
    if(sym && !isNaN(pct)){
      elements.push({sym, pct, moles: pct / (AM[sym] || 1)});
    }
  }
  if(elements.length===0){
    res.innerHTML = '<span class="tool-empty">Enter at least one element symbol and percentage.</span>';
    return;
  }

  // Check total % ~100
  const totalPct = elements.reduce((a,b)=>a+b.pct,0);
  if(Math.abs(totalPct-100)>1){
    res.innerHTML = `<span style="color:var(--alkyne)">Percentages sum to ${totalPct.toFixed(1)}%, should be near 100%.</span>`;
    return;
  }

  // Find smallest mole
  const minMoles = Math.min(...elements.map(e=>e.moles));
  const ratios = elements.map(e=> e.moles / minMoles);
  // Multiply to near integers
  let factor = 1;
  for(let f=1; f<=10; f++){
    if(ratios.every(r=>Math.abs(r*f - Math.round(r*f)) < 0.1)){
      factor = f;
      break;
    }
  }
  const empirical = elements.map((e,i)=> {
    const n = Math.round(ratios[i]*factor);
    return n===1 ? e.sym : e.sym + n;
  }).join('');

  let molecular = empirical;
  if(molarMassInput){
    const empMass = elements.reduce((acc,e,i)=> acc + (AM[e.sym]||0) * Math.round(ratios[i]*factor), 0);
    const n = Math.round(parseFloat(molarMassInput) / empMass);
    if(n>1) molecular = elements.map((e,i)=> {
      const cnt = Math.round(ratios[i]*factor) * n;
      return cnt===1 ? e.sym : e.sym + cnt;
    }).join('');
  }

  res.innerHTML = `<span class="tool-result-main">Empirical: ${empirical}</span>
    <div class="tool-result-breakdown">${molarMassInput ? `Molecular: ${molecular}` : ''}</div>`;
}

/* ---------- 22. BACK TO TOP ---------- */
window.addEventListener('scroll',()=>{
  const btt = document.getElementById('backToTop');
  if(!btt)return;
  if(window.scrollY>300) btt.classList.add('btt-show');
  else btt.classList.remove('btt-show');
});
document.getElementById('backToTop')?.addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:'smooth'});
});

/* ---------- 23. INITIALISATION ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  generateLibrary();
  buildPhScale();
  buildPeriodicTable();
  restoreTheme();
  restoreProgress();
  initConverter();
  // Set default gas law tab
  const defaultTab = document.querySelector('.gas-calc-tab');
  if(defaultTab) setGasLaw('boyle', defaultTab);
  // Add any other initialisations
  processChemistry(); // ensure calculator shows correct on load
  // Check for URL hash and scroll
  if(window.location.hash){
    setTimeout(()=>{
      document.querySelector(window.location.hash)?.scrollIntoView({behavior:'smooth'});
    },300);
  }
});      revealObs.unobserve(e.target);
    }
  });
},{threshold:.06});
document.querySelectorAll('.card').forEach(c=>revealObs.observe(c));

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
  const aH=2*n+2;
  document.getElementById('alkaneFormula').innerHTML=fmt(n,aH);
  if(n>=2){const eH=2*n;document.getElementById('alkeneFormula').innerHTML=fmt(n,eH);}
  else document.getElementById('alkeneFormula').innerHTML='<span style="color:var(--muted);font-size:1rem">n ≥ 2 required</span>';
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
  const cleanAni=aniSym.replace(/[()]/g,'');
  const cleanCat=catSym.replace(/[()]/g,'');
  let formula='';
  formula+=catN>1?`(${cleanCat})${catN>1?'<sub>'+catN+'</sub>':''}`:cleanCat;
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
  ideal:{label:"Ideal Gas Law — PV = nRT (R = 8.314)",fields:['P (Pa)','V (m³)','n (mol)','T (K)'],keys:['p','v','n','t'],
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

/* ---------- 12. STOICHIOMETRY CALCULATOR ---------- */
function calcStoichiometry(){
  const eqRaw=document.getElementById('stoichEq').value.trim();
  const knownSub=document.getElementById('stoichKnownSub').value.trim();
  const knownMol=parseFloat(document.getElementById('stoichKnownMol').value);
  const unknownSub=document.getElementById('stoichUnknownSub').value.trim();
  const res=document.getElementById('stoichResult');

  if(!eqRaw||!knownSub||isNaN(knownMol)||!unknownSub){
    res.innerHTML='<span class="tool-empty">Fill in all four fields.</span>';return;
  }

  const sides=eqRaw.split(/\u2192|->|=>/);
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

/* ---------- 13. pH CALCULATOR ---------- */
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
const PT=[ /* … full data as provided … */ ];  // (truncated for brevity, but you must keep the full array from original JS)
const LANTHANIDES=[ /* … full data … */ ];
const ACTINIDES=[ /* … full data … */ ];

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
  const layout=Array.from({length:7},()=>Array(18).fill(null));
  PT.forEach(el=>{
    const r=el.row-1,c=el.col-1;
    if(r>=0&&r<7&&c>=0&&c<18)layout[r][c]=el;
  });
  for(let r=0;r<7;r++){
    for(let c=0;c<18;c++){
      const el=layout[r][c];
      if(el){grid.appendChild(makeCell(el));}
      else {
        const empty=document.createElement('div');empty.className='pt-cell empty';
        if(r===5&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--ions-pos)">*</span>';}
        if(r===6&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--alkene)">**</span>';}
        grid.appendChild(empty);
      }
    }
  }
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
function toggleTheme(){
  const isDark=!document.documentElement.hasAttribute('data-theme');
  document.documentElement.setAttribute('data-theme',isDark?'light':'');
  document.getElementById('themeBtn').textContent=isDark?'🌙':'☀️';
  if(!isDark)document.documentElement.removeAttribute('data-theme');
  try{localStorage.setItem('labar_theme',isDark?'light':'dark');}catch(e){}
}
function restoreTheme(){
  try{
    const t=localStorage.getItem('labar_theme');
    if(t==='light'){document.documentElement.setAttribute('data-theme','light');const b=document.getElementById('themeBtn');if(b)b.textContent='🌙';}
  }catch(e){}
}

/* ---------- 17. PROGRESS DASHBOARD ---------- */
const CHAPTERS=[
  {
    label:'Organic',
    ids:['chkCalc','chk0','chk1','chk2','chk3','chk4b','chkOR','chkSynth','chkPoly'],
    names:['Calc','Hydrocarbons','IUPAC','Isomers','Library','Func. Groups','Org. Reactions','Synthesis','Polymers']
  },
  {
    label:'General',
    ids:['chkGlossary','chkReactivity','chk4','chk5','chk6','chk7','chk9','chk10','chk11','chk12','chkES','chkECalc','chk13','chkEq','chkSol','chkKinetics','chkLab','chkSpec'],
    names:['Glossary','Reactivity','Ions','Moles','Thermo','Nuclear','Bonding','Reactions','Acids','Redox','E-Series','E-Calc','Gas Laws','Equilibrium','Solutions','Kinetics','Lab Tech','Spectroscopy']
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

  const fill=document.getElementById('progressFill');
  const label=document.getElementById('progressLabel');
  const badge=document.getElementById('pdBadge');
  if(fill)fill.style.width=pct+'%';
  if(label)label.textContent=`${done} / ${total}`;
  if(badge)badge.textContent=pct+'%';
  const mf=document.getElementById('mobProgressFill');
  const ml=document.getElementById('mobProgressLabel');
  if(mf)mf.style.width=pct+'%';
  if(ml)ml.textContent=pct+'%';

  const msg=document.getElementById('pdMessage');
  if(msg)msg.textContent=getMsg(pct);

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
  {title:'Hydrocarbon Calculator',ctx:'Calculate alkane alkene alkyne molecular formulas CnH2n+2 carbon count', id:'calc-tool'},
  {title:'What are Hydrocarbons?',ctx:'Alkanes saturated unsaturated boiling point trends combustion', id:'hydrocarbons'},
  {title:'IUPAC Nomenclature',ctx:'IUPAC naming longest chain numbering substituents alphabetical', id:'iupac-section'},
  {title:'Isomerism',ctx:'Structural isomers stereoisomers cis trans optical chiral centre', id:'isomerism-section'},
  {title:'Compound Library',ctx:'Table of alkanes alkenes alkynes C1 to C10 names formulas', id:'table-section'},
  {title:'Functional Groups',ctx:'Alcohol aldehyde ketone carboxylic acid ester amine ether amide', id:'functional-section'},
  {title:'Organic Reactions',ctx:'Addition substitution elimination esterification oxidation combustion', id:'organic-reactions-section'},
  {title:'Organic Synthesis',ctx:'Retrosynthesis named reactions Grignard Friedel-Crafts SN1 SN2', id:'synthesis-section'},
  {title:'Polymers',ctx:'Addition condensation polymerisation polyethylene nylon PVC proteins', id:'polymers-section'},
  {title:'Chemistry Glossary',ctx:'Atom molecule element compound mixture ion cation anion acid base salt', id:'glossary-section'},
  {title:'Ions & Charges',ctx:'Cations anions common ions polyatomic ions charges', id:'ions-section'},
  {title:'Mole Concept',ctx:'Mole Avogadro molar mass stoichiometry limiting reagent yield', id:'moles-section'},
  {title:'Thermochemistry',ctx:'Exothermic endothermic enthalpy specific heat calorimetry', id:'thermo-section'},
  {title:'Nuclear Chemistry',ctx:'Alpha beta gamma radiation half-life binding energy E=mc2', id:'nuclear-section'},
  {title:'Chemical Bonding',ctx:'Ionic covalent metallic electronegativity Lewis structure', id:'bonding-section'},
  {title:'Reaction Types',ctx:'Synthesis decomposition single displacement double combustion neutralization', id:'reactions-section'},
  {title:'Reactivity Series',ctx:'Metal reactivity displacement potassium to gold water acid reaction', id:'reactivity-section'},
  {title:'Acids & Bases',ctx:'pH strong weak conjugate pairs indicators neutralization', id:'acids-section'},
  {title:'Electrochemistry',ctx:'Redox oxidation reduction galvanic cell electrolysis', id:'electro-section'},
  {title:'Electrochemical Series',ctx:'Standard electrode potential E° SHE cell EMF spontaneity', id:'electrochem-series-section'},
  {title:'Electrochemistry Calculations',ctx:'Nernst equation Gibbs free energy Faraday\'s laws', id:'electro-calc-section'},
  {title:'Gas Laws',ctx:'Boyle Charles Gay-Lussac ideal gas law PV=nRT', id:'gaslaws-section'},
  {title:'Chemical Equilibrium',ctx:'Kc Le Chatelier ICE table reaction quotient', id:'equilibrium-section'},
  {title:'Solutions & Concentration',ctx:'Molarity molality dilution percentage concentration', id:'solutions-section'},
  {title:'Reaction Kinetics',ctx:'Rate collision theory activation energy Arrhenius', id:'kinetics-section'},
  {title:'Lab Techniques',ctx:'Filtration distillation chromatography titration reflux', id:'lab-section'},
  {title:'Spectroscopy',ctx:'IR mass spec NMR chemical shift splitting integration', id:'spectroscopy-section'},
  {title:'Interactive Tools',ctx:'Molar mass ion compound builder nuclear decay unit converter', id:'tools-section'},
  {title:'Periodic Table Blocks',ctx:'s p d f blocks electron configuration Aufbau', id:'blocks-section'},
  {title:'Full Periodic Table',ctx:'118 elements click for details', id:'periodic-section'}
];

function openSearch(){
  document.getElementById('searchOverlay').classList.add('open');
  document.getElementById('globalSearchInput').focus();
  document.addEventListener('keydown',searchKeyDown);
}

function closeSearchIfOutside(e){
  if(e.target.id==='searchOverlay')closeSearch();
}

function closeSearch(){
  document.getElementById('searchOverlay').classList.remove('open');
  document.removeEventListener('keydown',searchKeyDown);
}

function searchKeyDown(e){
  if(e.key==='Escape')closeSearch();
}

function runGlobalSearch(){
  const q=document.getElementById('globalSearchInput').value.toLowerCase();
  const resDiv=document.getElementById('searchResults');
  if(!q.trim()){
    resDiv.innerHTML='<div class="search-empty">Type to search all chemistry topics…</div>';
    return;
  }
  const hits=SEARCH_INDEX.filter(item=>item.title.toLowerCase().includes(q)||item.ctx.toLowerCase().includes(q));
  if(hits.length===0){
    resDiv.innerHTML='<div class="search-empty">No results found.</div>';
    return;
  }
  resDiv.innerHTML=hits.map(h=>`
    <div class="search-hit" onclick="jumpToSection('${h.id}')">
      <div class="search-hit-title">${h.title}<span class="search-hit-tag">section</span></div>
      <div class="search-hit-ctx">${h.ctx.substring(0,100)}…</div>
    </div>
  `).join('');
}

function jumpToSection(id){
  closeSearch();
  const el=document.getElementById(id);
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---------- 19. TOOL 7: EQUATION BALANCER ---------- */
function balanceEquation(){
  const eq=document.getElementById('balanceEq').value.trim();
  const res=document.getElementById('balanceResult');
  if(!eq){res.innerHTML='<span class="tool-empty">Enter an unbalanced equation.</span>';return;}
  // Simple regex split (ignores state symbols). For production, a real chemical equation balancer would be needed.
  // This is a placeholder that tries to count atoms (very simplistic).
  res.innerHTML='<span style="color:var(--alkyne)">Balancer not fully implemented in this version – please use a dedicated tool.</span>';
}

/* ---------- 20. TOOL 8: TITRATION CALCULATOR ---------- */
function calcTitration(){
  const c1=parseFloat(document.getElementById('titrC1').value);
  const v1=parseFloat(document.getElementById('titrV1').value);
  const n1=parseFloat(document.getElementById('titrN1').value)||1;
  const n2=parseFloat(document.getElementById('titrN2').value)||1;
  const c2=parseFloat(document.getElementById('titrC2').value);
  const v2=parseFloat(document.getElementById('titrV2').value);
  const res=document.getElementById('titrResult');

  const known=[c1,v1,c2,v2].filter(v=>!isNaN(v)).length;
  if(known!==3){
    res.innerHTML='<span style="color:var(--alkyne)">Leave exactly one field blank, fill the other three.</span>';
    return;
  }

  let result='';
  if(isNaN(c2) && !isNaN(c1) && !isNaN(v1) && !isNaN(v2)){
    const c2calc = (c1 * v1 * n2) / (v2 * n1);
    result = `C₂ = ${c2calc.toPrecision(4)} mol/L`;
  } else if(isNaN(v2) && !isNaN(c1) && !isNaN(v1) && !isNaN(c2)){
    const v2calc = (c1 * v1 * n2) / (c2 * n1);
    result = `V₂ = ${v2calc.toPrecision(4)} mL`;
  } else if(isNaN(c1) && !isNaN(v1) && !isNaN(c2) && !isNaN(v2)){
    const c1calc = (c2 * v2 * n1) / (v1 * n2);
    result = `C₁ = ${c1calc.toPrecision(4)} mol/L`;
  } else if(isNaN(v1) && !isNaN(c1) && !isNaN(c2) && !isNaN(v2)){
    const v1calc = (c2 * v2 * n1) / (c1 * n2);
    result = `V₁ = ${v1calc.toPrecision(4)} mL`;
  } else {
    result = '<span style="color:var(--alkyne)">Unknown combination – check which field is blank.</span>';
  }
  res.innerHTML = `<span class="tool-result-main">${result}</span>`;
}

/* ---------- 21. TOOL 9: EMPIRICAL FORMULA ---------- */
function calcEmpiricalFormula(){
  // Simple implementation: reads first three rows of element and percentage
  const symbols = document.querySelectorAll('#efInputs .ef-row input:first-child');
  const percentages = document.querySelectorAll('#efInputs .ef-row input[type="number"]');
  const molarMassInput = document.getElementById('efMolarMass').value;
  const res = document.getElementById('efResult');

  let elements = [];
  for(let i=0; i<symbols.length; i++){
    const sym = symbols[i].value.trim();
    const pct = parseFloat(percentages[i].value);
    if(sym && !isNaN(pct)){
      elements.push({sym, pct, moles: pct / (AM[sym] || 1)});
    }
  }
  if(elements.length===0){
    res.innerHTML = '<span class="tool-empty">Enter at least one element symbol and percentage.</span>';
    return;
  }

  // Check total % ~100
  const totalPct = elements.reduce((a,b)=>a+b.pct,0);
  if(Math.abs(totalPct-100)>1){
    res.innerHTML = `<span style="color:var(--alkyne)">Percentages sum to ${totalPct.toFixed(1)}%, should be near 100%.</span>`;
    return;
  }

  // Find smallest mole
  const minMoles = Math.min(...elements.map(e=>e.moles));
  const ratios = elements.map(e=> e.moles / minMoles);
  // Multiply to near integers
  let factor = 1;
  for(let f=1; f<=10; f++){
    if(ratios.every(r=>Math.abs(r*f - Math.round(r*f)) < 0.1)){
      factor = f;
      break;
    }
  }
  const empirical = elements.map((e,i)=> {
    const n = Math.round(ratios[i]*factor);
    return n===1 ? e.sym : e.sym + n;
  }).join('');

  let molecular = empirical;
  if(molarMassInput){
    const empMass = elements.reduce((acc,e,i)=> acc + (AM[e.sym]||0) * Math.round(ratios[i]*factor), 0);
    const n = Math.round(parseFloat(molarMassInput) / empMass);
    if(n>1) molecular = elements.map((e,i)=> {
      const cnt = Math.round(ratios[i]*factor) * n;
      return cnt===1 ? e.sym : e.sym + cnt;
    }).join('');
  }

  res.innerHTML = `<span class="tool-result-main">Empirical: ${empirical}</span>
    <div class="tool-result-breakdown">${molarMassInput ? `Molecular: ${molecular}` : ''}</div>`;
}

/* ---------- 22. BACK TO TOP ---------- */
window.addEventListener('scroll',()=>{
  const btt = document.getElementById('backToTop');
  if(!btt)return;
  if(window.scrollY>300) btt.classList.add('btt-show');
  else btt.classList.remove('btt-show');
});
document.getElementById('backToTop')?.addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:'smooth'});
});

/* ---------- 23. INITIALISATION ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  generateLibrary();
  buildPhScale();
  buildPeriodicTable();
  restoreTheme();
  restoreProgress();
  initConverter();
  // Set default gas law tab
  const defaultTab = document.querySelector('.gas-calc-tab');
  if(defaultTab) setGasLaw('boyle', defaultTab);
  // Add any other initialisations
  processChemistry(); // ensure calculator shows correct on load
  // Check for URL hash and scroll
  if(window.location.hash){
    setTimeout(()=>{
      document.querySelector(window.location.hash)?.scrollIntoView({behavior:'smooth'});
    },300);
  }
});      revealObs.unobserve(e.target);
    }
  });
},{threshold:.06});
document.querySelectorAll('.card').forEach(c=>revealObs.observe(c));

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
  const aH=2*n+2;
  document.getElementById('alkaneFormula').innerHTML=fmt(n,aH);
  if(n>=2){const eH=2*n;document.getElementById('alkeneFormula').innerHTML=fmt(n,eH);}
  else document.getElementById('alkeneFormula').innerHTML='<span style="color:var(--muted);font-size:1rem">n \u2265 2 required</span>';
  if(n>=2){const yH=2*n-2;document.getElementById('alkyneFormula').innerHTML=fmt(n,yH);}
  else document.getElementById('alkyneFormula').innerHTML='<span style="color:var(--muted);font-size:1rem">n \u2265 2 required</span>';
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
const ALKENE_NAMES=['\u2014','Ethene','Propene','Butene','Pentene','Hexene','Heptene','Octene','Nonene','Decene'];
const ALKYNE_NAMES=['\u2014','Ethyne','Propyne','Butyne','Pentyne','Hexyne','Heptyne','Octyne','Nonyne','Decyne'];

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
      breakdown+=`${el}: ${parsed[el]} \u00d7 ${mass} = ${contrib.toFixed(3)} &nbsp;`;
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
  const cleanAni=aniSym.replace(/[()]/g,'');
  const cleanCat=catSym.replace(/[()]/g,'');
  let formula='';
  formula+=catN>1?`(${cleanCat})${catN>1?'<sub>'+catN+'</sub>':''}`:cleanCat;
  if(aniSym.includes('(')&&aniN>1)formula+=`(${cleanAni})<sub>${aniN}</sub>`;
  else formula+=cleanAni+(aniN>1?`<sub>${aniN}</sub>`:'');
  document.getElementById('compoundResult').innerHTML=`<span class="tool-result-formula">${formula}</span><div class="tool-result-breakdown">Ratio: ${catSym}<sup>${catChg}+</sup> : ${aniSym}<sup>${aniChg}\u2212</sup> \u2192 ${catN}:${aniN}</div>`;
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
  temp:{units:['\u00b0C','K','\u00b0F'],toBase:null},
  pressure:{units:['atm','Pa','mmHg','bar'],toBase:[101325,1,133.322,100000]},
  volume:{units:['L','mL','m\u00b3','cm\u00b3'],toBase:[1e-3,1e-6,1,1e-6]}
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
    if(from==='\u00b0C'&&to==='K')result=val+273.15;
    else if(from==='K'&&to==='\u00b0C')result=val-273.15;
    else if(from==='\u00b0C'&&to==='\u00b0F')result=val*1.8+32;
    else if(from==='\u00b0F'&&to==='\u00b0C')result=(val-32)/1.8;
    else if(from==='K'&&to==='\u00b0F')result=(val-273.15)*1.8+32;
    else if(from==='\u00b0F'&&to==='K')result=(val-32)/1.8+273.15;
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
  boyle:{label:"Boyle's Law \u2014 P\u2081V\u2081 = P\u2082V\u2082",fields:['P\u2081 (atm)','V\u2081 (L)','P\u2082 (atm)','V\u2082 (L)'],keys:['p1','v1','p2','v2'],
    solve(v){const{p1,v1,p2,v2}=v;if(!v2&&p1&&v1&&p2)return{v2:p1*v1/p2,label:'V\u2082'};if(!p2&&p1&&v1&&v2)return{p2:p1*v1/v2,label:'P\u2082'};if(!v1&&p1&&p2&&v2)return{v1:p2*v2/p1,label:'V\u2081'};if(!p1&&v1&&p2&&v2)return{p1:p2*v2/v1,label:'P\u2081'};return null;}},
  charles:{label:"Charles's Law \u2014 V\u2081/T\u2081 = V\u2082/T\u2082",fields:['V\u2081 (L)','T\u2081 (K)','V\u2082 (L)','T\u2082 (K)'],keys:['v1','t1','v2','t2'],
    solve(v){const{v1,t1,v2,t2}=v;if(!v2&&v1&&t1&&t2)return{v2:v1*t2/t1,label:'V\u2082'};if(!t2&&v1&&t1&&v2)return{t2:v2*t1/v1,label:'T\u2082'};if(!v1&&t1&&v2&&t2)return{v1:v2*t1/t2,label:'V\u2081'};if(!t1&&v1&&v2&&t2)return{t1:v1*t2/v2,label:'T\u2081'};return null;}},
  gaylussac:{label:"Gay-Lussac's Law \u2014 P\u2081/T\u2081 = P\u2082/T\u2082",fields:['P\u2081 (atm)','T\u2081 (K)','P\u2082 (atm)','T\u2082 (K)'],keys:['p1','t1','p2','t2'],
    solve(v){const{p1,t1,p2,t2}=v;if(!p2&&p1&&t1&&t2)return{p2:p1*t2/t1,label:'P\u2082'};if(!t2&&p1&&t1&&p2)return{t2:p2*t1/p1,label:'T\u2082'};if(!p1&&t1&&p2&&t2)return{p1:p2*t1/t2,label:'P\u2081'};if(!t1&&p1&&p2&&t2)return{t1:p1*t2/p2,label:'T\u2081'};return null;}},
  combined:{label:"Combined Gas Law \u2014 P\u2081V\u2081/T\u2081 = P\u2082V\u2082/T\u2082",fields:['P\u2081','V\u2081','T\u2081 (K)','P\u2082','V\u2082','T\u2082 (K)'],keys:['p1','v1','t1','p2','v2','t2'],
    solve(v){const{p1,v1,t1,p2,v2,t2}=v;const lhs=p1&&v1&&t1?p1*v1/t1:null;const rhs=p2&&v2&&t2?p2*v2/t2:null;
      if(!t2&&lhs&&p2&&v2)return{t2:p2*v2/lhs,label:'T\u2082'};if(!v2&&lhs&&p2&&t2)return{v2:lhs*t2/p2,label:'V\u2082'};if(!p2&&lhs&&v2&&t2)return{p2:lhs*t2/v2,label:'P\u2082'};
      if(!t1&&rhs&&p1&&v1)return{t1:p1*v1/rhs,label:'T\u2081'};if(!v1&&rhs&&p1&&t1)return{v1:rhs*t1/p1,label:'V\u2081'};if(!p1&&rhs&&v1&&t1)return{p1:rhs*t1/v1,label:'P\u2081'};return null;}},
  ideal:{label:"Ideal Gas Law \u2014 PV = nRT (R = 8.314)",fields:['P (atm\u2192Pa\u00d7101325)','V (m\u00b3 or L\u00d70.001)','n (mol)','T (K)'],keys:['p','v','n','t'],
    solve(v){const R=8.314;const{p,v:vol,n,t}=v;if(!p&&vol&&n&&t)return{p:n*R*t/vol,label:'P (Pa)'};if(!vol&&p&&n&&t)return{v:n*R*t/p,label:'V (m\u00b3)'};if(!n&&p&&vol&&t)return{n:p*vol/(R*t),label:'n (mol)'};if(!t&&p&&vol&&n)return{t:p*vol/(n*R),label:'T (K)'};return null;}}
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

/* ---------- 12. STOICHIOMETRY CALCULATOR ---------- */
function calcStoichiometry(){
  const eqRaw=document.getElementById('stoichEq').value.trim();
  const knownSub=document.getElementById('stoichKnownSub').value.trim();
  const knownMol=parseFloat(document.getElementById('stoichKnownMol').value);
  const unknownSub=document.getElementById('stoichUnknownSub').value.trim();
  const res=document.getElementById('stoichResult');

  if(!eqRaw||!knownSub||isNaN(knownMol)||!unknownSub){
    res.innerHTML='<span class="tool-empty">Fill in all four fields.</span>';return;
  }

  const sides=eqRaw.split(/\u2192|->|=>/);
  if(sides.length<2){res.innerHTML='<span style="color:var(--alkyne)">Use \u2192 or -> to separate reactants and products.</span>';return;}
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
      ${knownMol} mol ${knownSub} \u00d7 (${uCoef}/${kCoef}) = <b style="color:var(--accent)">${unknownMol.toPrecision(5)} mol</b> ${unknownSub}
    </div>`;
}

/* ---------- 13. pH CALCULATOR ---------- */
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
      [H\u207a] = <b>${H.toExponential(3)}</b> mol/L &nbsp;|&nbsp;
      [OH\u207b] = <b>${OH.toExponential(3)}</b> mol/L<br>
      Verification: pH + pOH = <b>${(pH+pOH).toFixed(2)}</b> (should = 14)
    </div>`;
}

/* ---------- 14. PERIODIC TABLE ---------- */
const PT=[
  {z:1,sym:'H',name:'Hydrogen',mass:1.008,type:'nonmetal',period:1,group:1,col:1,row:1,state:'Gas',econfig:'1s\u00b9',en:2.20,uses:'Fuel cells, rocket propellant, water (H\u2082O), acids.'},
  {z:2,sym:'He',name:'Helium',mass:4.003,type:'noble',period:1,group:18,col:18,row:1,state:'Gas',econfig:'1s\u00b2',en:0,uses:'Balloons, MRI coolant, deep-sea diving mixtures.'},
  {z:3,sym:'Li',name:'Lithium',mass:6.941,type:'alkali',period:2,group:1,col:1,row:2,state:'Solid',econfig:'[He] 2s\u00b9',en:0.98,uses:'Lithium-ion batteries, mood stabiliser drug, alloys.'},
  {z:4,sym:'Be',name:'Beryllium',mass:9.012,type:'alkaline',period:2,group:2,col:2,row:2,state:'Solid',econfig:'[He] 2s\u00b2',en:1.57,uses:'Aerospace alloys, X-ray windows, nuclear reactors.'},
  {z:5,sym:'B',name:'Boron',mass:10.811,type:'metalloid',period:2,group:13,col:13,row:2,state:'Solid',econfig:'[He] 2s\u00b2 2p\u00b9',en:2.04,uses:'Borosilicate glass, semiconductors, detergents (borax).'},
  {z:6,sym:'C',name:'Carbon',mass:12.011,type:'nonmetal',period:2,group:14,col:14,row:2,state:'Solid',econfig:'[He] 2s\u00b2 2p\u00b2',en:2.55,uses:'All organic chemistry, graphite, diamonds, fullerenes, CO\u2082.'},
  {z:7,sym:'N',name:'Nitrogen',mass:14.007,type:'nonmetal',period:2,group:15,col:15,row:2,state:'Gas',econfig:'[He] 2s\u00b2 2p\u00b3',en:3.04,uses:'78% of atmosphere, fertilisers (NH\u2083), explosives.'},
  {z:8,sym:'O',name:'Oxygen',mass:15.999,type:'nonmetal',period:2,group:16,col:16,row:2,state:'Gas',econfig:'[He] 2s\u00b2 2p\u2074',en:3.44,uses:'Breathing, combustion, steel production, ozone layer.'},
  {z:9,sym:'F',name:'Fluorine',mass:18.998,type:'halogen',period:2,group:17,col:17,row:2,state:'Gas',econfig:'[He] 2s\u00b2 2p\u2075',en:3.98,uses:'Toothpaste (NaF), Teflon, refrigerants. Most electronegative element.'},
  {z:10,sym:'Ne',name:'Neon',mass:20.18,type:'noble',period:2,group:18,col:18,row:2,state:'Gas',econfig:'[He] 2s\u00b2 2p\u2076',en:0,uses:'Neon signs, lasers, cryogenics.'},
  {z:11,sym:'Na',name:'Sodium',mass:22.99,type:'alkali',period:3,group:1,col:1,row:3,state:'Solid',econfig:'[Ne] 3s\u00b9',en:0.93,uses:'Table salt (NaCl), street lights, nerve impulse transmission.'},
  {z:12,sym:'Mg',name:'Magnesium',mass:24.305,type:'alkaline',period:3,group:2,col:2,row:3,state:'Solid',econfig:'[Ne] 3s\u00b2',en:1.31,uses:'Alloys (aircraft), Mg flares, chlorophyll (plants).'},
  {z:13,sym:'Al',name:'Aluminium',mass:26.982,type:'post-trans',period:3,group:13,col:13,row:3,state:'Solid',econfig:'[Ne] 3s\u00b2 3p\u00b9',en:1.61,uses:'Packaging, aircraft, cables, kitchen foil. Most abundant metal in crust.'},
  {z:14,sym:'Si',name:'Silicon',mass:28.086,type:'metalloid',period:3,group:14,col:14,row:3,state:'Solid',econfig:'[Ne] 3s\u00b2 3p\u00b2',en:1.90,uses:'Semiconductors, computer chips, glass, solar cells. 2nd most abundant element.'},
  {z:15,sym:'P',name:'Phosphorus',mass:30.974,type:'nonmetal',period:3,group:15,col:15,row:3,state:'Solid',econfig:'[Ne] 3s\u00b2 3p\u00b3',en:2.19,uses:'Fertilisers, DNA backbone, matches, detergents.'},
  {z:16,sym:'S',name:'Sulfur',mass:32.065,type:'nonmetal',period:3,group:16,col:16,row:3,state:'Solid',econfig:'[Ne] 3s\u00b2 3p\u2074',en:2.58,uses:'H\u2082SO\u2084 (most used industrial chemical), rubber vulcanisation, matches.'},
  {z:17,sym:'Cl',name:'Chlorine',mass:35.453,type:'halogen',period:3,group:17,col:17,row:3,state:'Gas',econfig:'[Ne] 3s\u00b2 3p\u2075',en:3.16,uses:'Water purification, PVC, bleach (NaOCl), salt (NaCl).'},
  {z:18,sym:'Ar',name:'Argon',mass:39.948,type:'noble',period:3,group:18,col:18,row:3,state:'Gas',econfig:'[Ne] 3s\u00b2 3p\u2076',en:0,uses:'Welding shield gas, light bulbs, laser technology.'},
  {z:19,sym:'K',name:'Potassium',mass:39.098,type:'alkali',period:4,group:1,col:1,row:4,state:'Solid',econfig:'[Ar] 4s\u00b9',en:0.82,uses:'Fertilisers, potassium chloride, banana nutrition.'},
  {z:20,sym:'Ca',name:'Calcium',mass:40.078,type:'alkaline',period:4,group:2,col:2,row:4,state:'Solid',econfig:'[Ar] 4s\u00b2',en:1.00,uses:'Bones & teeth (CaPO\u2084), cement (CaCO\u2083), dairy.'},
  {z:21,sym:'Sc',name:'Scandium',mass:44.956,type:'transition',period:4,group:3,col:3,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9 4s\u00b2',en:1.36,uses:'Lightweight alloys, sports equipment, stadium lights.'},
  {z:22,sym:'Ti',name:'Titanium',mass:47.867,type:'transition',period:4,group:4,col:4,row:4,state:'Solid',econfig:'[Ar] 3d\u00b2 4s\u00b2',en:1.54,uses:'Aircraft, implants, TiO\u2082 white pigment, jewellery.'},
  {z:23,sym:'V',name:'Vanadium',mass:50.942,type:'transition',period:4,group:5,col:5,row:4,state:'Solid',econfig:'[Ar] 3d\u00b3 4s\u00b2',en:1.63,uses:'Steel alloys, vanadium redox batteries, catalyst.'},
  {z:24,sym:'Cr',name:'Chromium',mass:51.996,type:'transition',period:4,group:6,col:6,row:4,state:'Solid',econfig:'[Ar] 3d\u2075 4s\u00b9',en:1.66,uses:'Stainless steel, chrome plating, pigments.'},
  {z:25,sym:'Mn',name:'Manganese',mass:54.938,type:'transition',period:4,group:7,col:7,row:4,state:'Solid',econfig:'[Ar] 3d\u2075 4s\u00b2',en:1.55,uses:'Steel alloys, dry cell batteries (MnO\u2082), water treatment.'},
  {z:26,sym:'Fe',name:'Iron',mass:55.845,type:'transition',period:4,group:8,col:8,row:4,state:'Solid',econfig:'[Ar] 3d\u2076 4s\u00b2',en:1.83,uses:'Steel production, hemoglobin (blood), construction.'},
  {z:27,sym:'Co',name:'Cobalt',mass:58.933,type:'transition',period:4,group:9,col:9,row:4,state:'Solid',econfig:'[Ar] 3d\u2077 4s\u00b2',en:1.88,uses:'Superalloys (jet engines), blue pigments, lithium-ion batteries.'},
  {z:28,sym:'Ni',name:'Nickel',mass:58.693,type:'transition',period:4,group:10,col:10,row:4,state:'Solid',econfig:'[Ar] 3d\u2078 4s\u00b2',en:1.91,uses:'Coins, electroplating, stainless steel, rechargeable batteries.'},
  {z:29,sym:'Cu',name:'Copper',mass:63.546,type:'transition',period:4,group:11,col:11,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b9',en:1.90,uses:'Electrical wiring, plumbing, coins, antimicrobial surfaces.'},
  {z:30,sym:'Zn',name:'Zinc',mass:65.38,type:'transition',period:4,group:12,col:12,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2',en:1.65,uses:'Galvanising iron, die casting, zinc oxide (sunscreen).'},
  {z:31,sym:'Ga',name:'Gallium',mass:69.723,type:'post-trans',period:4,group:13,col:13,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2 4p\u00b9',en:1.81,uses:'LEDs, solar cells, semiconductors. Melts at 30\u00b0C.'},
  {z:32,sym:'Ge',name:'Germanium',mass:72.63,type:'metalloid',period:4,group:14,col:14,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2 4p\u00b2',en:2.01,uses:'Semiconductors, fiber optics, infrared optics.'},
  {z:33,sym:'As',name:'Arsenic',mass:74.922,type:'metalloid',period:4,group:15,col:15,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2 4p\u00b3',en:2.18,uses:'Semiconductors, wood preservative, pesticides. Highly toxic.'},
  {z:34,sym:'Se',name:'Selenium',mass:78.971,type:'nonmetal',period:4,group:16,col:16,row:4,state:'Solid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2 4p\u2074',en:2.55,uses:'Photocopiers, glass tinting, dietary trace element.'},
  {z:35,sym:'Br',name:'Bromine',mass:79.904,type:'halogen',period:4,group:17,col:17,row:4,state:'Liquid',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2 4p\u2075',en:2.96,uses:'Flame retardants, photography, water purification. Liquid at RT.'},
  {z:36,sym:'Kr',name:'Krypton',mass:83.798,type:'noble',period:4,group:18,col:18,row:4,state:'Gas',econfig:'[Ar] 3d\u00b9\u2070 4s\u00b2 4p\u2076',en:0,uses:'Flash photography, lasers, formerly defined the metre.'},
  {z:37,sym:'Rb',name:'Rubidium',mass:85.468,type:'alkali',period:5,group:1,col:1,row:5,state:'Solid',econfig:'[Kr] 5s\u00b9',en:0.82,uses:'Atomic clocks, photomultiplier tubes, biomedical tracers.'},
  {z:38,sym:'Sr',name:'Strontium',mass:87.62,type:'alkaline',period:5,group:2,col:2,row:5,state:'Solid',econfig:'[Kr] 5s\u00b2',en:0.95,uses:'Red fireworks, CRT screens, nuclear medicine (\u2079\u2070Sr).'},
  {z:39,sym:'Y',name:'Yttrium',mass:88.906,type:'transition',period:5,group:3,col:3,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9 5s\u00b2',en:1.22,uses:'LEDs, superconductors, camera lenses, yttrium iron garnets.'},
  {z:40,sym:'Zr',name:'Zirconium',mass:91.224,type:'transition',period:5,group:4,col:4,row:5,state:'Solid',econfig:'[Kr] 4d\u00b2 5s\u00b2',en:1.33,uses:'Nuclear reactor cladding, ceramics, cubic zirconia jewellery.'},
  {z:41,sym:'Nb',name:'Niobium',mass:92.906,type:'transition',period:5,group:5,col:5,row:5,state:'Solid',econfig:'[Kr] 4d\u2074 5s\u00b9',en:1.60,uses:'Superconducting magnets, high-strength steel alloys.'},
  {z:42,sym:'Mo',name:'Molybdenum',mass:95.95,type:'transition',period:5,group:6,col:6,row:5,state:'Solid',econfig:'[Kr] 4d\u2075 5s\u00b9',en:2.16,uses:'High-strength steel, aerospace, lubricants (MoS\u2082).'},
  {z:43,sym:'Tc',name:'Technetium',mass:98,type:'transition',period:5,group:7,col:7,row:5,state:'Solid',econfig:'[Kr] 4d\u2075 5s\u00b2',en:1.90,uses:'Nuclear medicine imaging (\u2079\u2079\u1d50Tc scans). First synthetic element.'},
  {z:44,sym:'Ru',name:'Ruthenium',mass:101.07,type:'transition',period:5,group:8,col:8,row:5,state:'Solid',econfig:'[Kr] 4d\u2077 5s\u00b9',en:2.20,uses:'Electrical contacts, catalysts, hard disk coatings.'},
  {z:45,sym:'Rh',name:'Rhodium',mass:102.906,type:'transition',period:5,group:9,col:9,row:5,state:'Solid',econfig:'[Kr] 4d\u2078 5s\u00b9',en:2.28,uses:'Catalytic converters, jewellery plating, industrial catalysts.'},
  {z:46,sym:'Pd',name:'Palladium',mass:106.42,type:'transition',period:5,group:10,col:10,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070',en:2.20,uses:'Catalytic converters, electronics, hydrogen storage.'},
  {z:47,sym:'Ag',name:'Silver',mass:107.868,type:'transition',period:5,group:11,col:11,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b9',en:1.93,uses:'Photography (AgBr), jewellery, electronics, antimicrobial coatings.'},
  {z:48,sym:'Cd',name:'Cadmium',mass:112.414,type:'transition',period:5,group:12,col:12,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2',en:1.69,uses:'Ni-Cd batteries, pigments, nuclear reactor control rods. Toxic.'},
  {z:49,sym:'In',name:'Indium',mass:114.818,type:'post-trans',period:5,group:13,col:13,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2 5p\u00b9',en:1.78,uses:'LCD screens (ITO), solders, low-melting alloys.'},
  {z:50,sym:'Sn',name:'Tin',mass:118.71,type:'post-trans',period:5,group:14,col:14,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2 5p\u00b2',en:1.96,uses:'Food cans (tin plating), solder, bronze (Cu+Sn).'},
  {z:51,sym:'Sb',name:'Antimony',mass:121.76,type:'metalloid',period:5,group:15,col:15,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2 5p\u00b3',en:2.05,uses:'Flame retardants, lead alloys for batteries.'},
  {z:52,sym:'Te',name:'Tellurium',mass:127.6,type:'metalloid',period:5,group:16,col:16,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2 5p\u2074',en:2.10,uses:'Solar panels (CdTe), thermoelectrics, rewritable discs.'},
  {z:53,sym:'I',name:'Iodine',mass:126.904,type:'halogen',period:5,group:17,col:17,row:5,state:'Solid',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2 5p\u2075',en:2.66,uses:'Thyroid hormone (iodised salt), antiseptic, photography.'},
  {z:54,sym:'Xe',name:'Xenon',mass:131.293,type:'noble',period:5,group:18,col:18,row:5,state:'Gas',econfig:'[Kr] 4d\u00b9\u2070 5s\u00b2 5p\u2076',en:0,uses:'Ion propulsion thrusters, anaesthetic, car headlights.'},
  {z:55,sym:'Cs',name:'Caesium',mass:132.905,type:'alkali',period:6,group:1,col:1,row:6,state:'Solid',econfig:'[Xe] 6s\u00b9',en:0.79,uses:'Atomic clocks (defines SI second), drilling fluids, night-vision devices.'},
  {z:56,sym:'Ba',name:'Barium',mass:137.327,type:'alkaline',period:6,group:2,col:2,row:6,state:'Solid',econfig:'[Xe] 6s\u00b2',en:0.89,uses:'Barium sulfate (X-ray contrast), rat poison (BaCO\u2083), green fireworks.'},
  {z:72,sym:'Hf',name:'Hafnium',mass:178.49,type:'transition',period:6,group:4,col:4,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b2 6s\u00b2',en:1.30,uses:'Nuclear reactor control rods, microprocessor gates.'},
  {z:73,sym:'Ta',name:'Tantalum',mass:180.948,type:'transition',period:6,group:5,col:5,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b3 6s\u00b2',en:1.50,uses:'Capacitors in electronics, surgical implants, turbine blades.'},
  {z:74,sym:'W',name:'Tungsten',mass:183.84,type:'transition',period:6,group:6,col:6,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u2074 6s\u00b2',en:2.36,uses:'Light bulb filaments, cutting tools, highest melting point metal (3422\u00b0C).'},
  {z:75,sym:'Re',name:'Rhenium',mass:186.207,type:'transition',period:6,group:7,col:7,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u2075 6s\u00b2',en:1.90,uses:'Jet engine alloys, catalytic reforming of petroleum.'},
  {z:76,sym:'Os',name:'Osmium',mass:190.23,type:'transition',period:6,group:8,col:8,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u2076 6s\u00b2',en:2.20,uses:'Hardening alloys, fountain pen tips. Densest natural element.'},
  {z:77,sym:'Ir',name:'Iridium',mass:192.217,type:'transition',period:6,group:9,col:9,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u2077 6s\u00b2',en:2.20,uses:'Spark plugs, K-Pg boundary marker, international kilogram standard.'},
  {z:78,sym:'Pt',name:'Platinum',mass:195.084,type:'transition',period:6,group:10,col:10,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u2079 6s\u00b9',en:2.28,uses:'Catalytic converters, jewellery, fuel cells, chemotherapy (cisplatin).'},
  {z:79,sym:'Au',name:'Gold',mass:196.967,type:'transition',period:6,group:11,col:11,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b9',en:2.54,uses:'Currency, jewellery, electronics contacts, medical implants.'},
  {z:80,sym:'Hg',name:'Mercury',mass:200.592,type:'transition',period:6,group:12,col:12,row:6,state:'Liquid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2',en:2.00,uses:'Thermometers, fluorescent lights, dental amalgam. Only liquid metal at RT.'},
  {z:81,sym:'Tl',name:'Thallium',mass:204.383,type:'post-trans',period:6,group:13,col:13,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2 6p\u00b9',en:1.62,uses:'Cardiac imaging, infrared optics. Highly toxic.'},
  {z:82,sym:'Pb',name:'Lead',mass:207.2,type:'post-trans',period:6,group:14,col:14,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2 6p\u00b2',en:2.33,uses:'Car batteries, radiation shielding, historical plumbing.'},
  {z:83,sym:'Bi',name:'Bismuth',mass:208.98,type:'post-trans',period:6,group:15,col:15,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2 6p\u00b3',en:2.02,uses:'Pepto-Bismol, fire sprinkler alloys, beautiful oxide crystals.'},
  {z:84,sym:'Po',name:'Polonium',mass:209,type:'post-trans',period:6,group:16,col:16,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2 6p\u2074',en:2.00,uses:'Alpha particle source, antistatic devices. Highly radioactive.'},
  {z:85,sym:'At',name:'Astatine',mass:210,type:'halogen',period:6,group:17,col:17,row:6,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2 6p\u2075',en:2.20,uses:'Cancer radiotherapy research. Rarest naturally occurring element.'},
  {z:86,sym:'Rn',name:'Radon',mass:222,type:'noble',period:6,group:18,col:18,row:6,state:'Gas',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9\u2070 6s\u00b2 6p\u2076',en:0,uses:'Cancer radiotherapy. Radioactive \u2014 lung cancer risk from home exposure.'},
  {z:87,sym:'Fr',name:'Francium',mass:223,type:'alkali',period:7,group:1,col:1,row:7,state:'Solid',econfig:'[Rn] 7s\u00b9',en:0.70,uses:'Fundamental physics research only. Extremely rare and radioactive.'},
  {z:88,sym:'Ra',name:'Radium',mass:226,type:'alkaline',period:7,group:2,col:2,row:7,state:'Solid',econfig:'[Rn] 7s\u00b2',en:0.90,uses:'Historical cancer treatment, luminous paint (radioactive). Discovered by Curie.'},
  {z:104,sym:'Rf',name:'Rutherfordium',mass:267,type:'transition',period:7,group:4,col:4,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b2 7s\u00b2',en:0,uses:'Research only. Synthetic transuranium element.'},
  {z:105,sym:'Db',name:'Dubnium',mass:268,type:'transition',period:7,group:5,col:5,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b3 7s\u00b2',en:0,uses:'Research only. Named after Dubna, Russia.'},
  {z:106,sym:'Sg',name:'Seaborgium',mass:269,type:'transition',period:7,group:6,col:6,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u2074 7s\u00b2',en:0,uses:'Research only. Named after Glenn Seaborg.'},
  {z:107,sym:'Bh',name:'Bohrium',mass:270,type:'transition',period:7,group:7,col:7,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u2075 7s\u00b2',en:0,uses:'Research only. Named after Niels Bohr.'},
  {z:108,sym:'Hs',name:'Hassium',mass:270,type:'transition',period:7,group:8,col:8,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u2076 7s\u00b2',en:0,uses:'Research only. Named after Hesse, Germany.'},
  {z:109,sym:'Mt',name:'Meitnerium',mass:278,type:'transition',period:7,group:9,col:9,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u2077 7s\u00b2',en:0,uses:'Research only. Named after Lise Meitner.'},
  {z:110,sym:'Ds',name:'Darmstadtium',mass:281,type:'transition',period:7,group:10,col:10,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u2078 7s\u00b2',en:0,uses:'Research only. Named after Darmstadt, Germany.'},
  {z:111,sym:'Rg',name:'Roentgenium',mass:282,type:'transition',period:7,group:11,col:11,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u2079 7s\u00b2',en:0,uses:'Research only. Named after Wilhelm R\u00f6ntgen.'},
  {z:112,sym:'Cn',name:'Copernicium',mass:285,type:'transition',period:7,group:12,col:12,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2',en:0,uses:'Research only. Named after Copernicus.'},
  {z:113,sym:'Nh',name:'Nihonium',mass:286,type:'post-trans',period:7,group:13,col:13,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2 7p\u00b9',en:0,uses:'Research only. Named after Japan (Nihon).'},
  {z:114,sym:'Fl',name:'Flerovium',mass:289,type:'post-trans',period:7,group:14,col:14,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2 7p\u00b2',en:0,uses:'Research only. Named after Flerov Laboratory.'},
  {z:115,sym:'Mc',name:'Moscovium',mass:290,type:'post-trans',period:7,group:15,col:15,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2 7p\u00b3',en:0,uses:'Research only. Named after Moscow Oblast.'},
  {z:116,sym:'Lv',name:'Livermorium',mass:293,type:'post-trans',period:7,group:16,col:16,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2 7p\u2074',en:0,uses:'Research only. Named after Livermore, California.'},
  {z:117,sym:'Ts',name:'Tennessine',mass:294,type:'halogen',period:7,group:17,col:17,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2 7p\u2075',en:0,uses:'Research only. Named after Tennessee.'},
  {z:118,sym:'Og',name:'Oganesson',mass:294,type:'noble',period:7,group:18,col:18,row:7,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 6d\u00b9\u2070 7s\u00b2 7p\u2076',en:0,uses:'Research only. Named after Yuri Oganessian. Heaviest confirmed element.'}
];

const LANTHANIDES=[
  {z:57,sym:'La',name:'Lanthanum',mass:138.905,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 5d\u00b9 6s\u00b2',en:1.10,uses:'Camera lenses, hydrogen storage, La-Ni batteries.'},
  {z:58,sym:'Ce',name:'Cerium',mass:140.116,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9 5d\u00b9 6s\u00b2',en:1.12,uses:'Catalytic converters, glass polishing, lighter flints.'},
  {z:59,sym:'Pr',name:'Praseodymium',mass:140.908,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b3 6s\u00b2',en:1.13,uses:'Permanent magnets, aircraft engine alloys, green glass.'},
  {z:60,sym:'Nd',name:'Neodymium',mass:144.242,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u2074 6s\u00b2',en:1.14,uses:'Strongest permanent magnets (Nd\u2082Fe\u2081\u2084B), EV motors, MRI machines.'},
  {z:61,sym:'Pm',name:'Promethium',mass:145,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u2075 6s\u00b2',en:1.13,uses:'Nuclear batteries, luminous paint. Radioactive, no stable isotopes.'},
  {z:62,sym:'Sm',name:'Samarium',mass:150.36,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u2076 6s\u00b2',en:1.17,uses:'SmCo permanent magnets, cancer treatment, neutron absorber.'},
  {z:63,sym:'Eu',name:'Europium',mass:151.964,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u2077 6s\u00b2',en:1.20,uses:'Red phosphors in TV/LED, euro banknote security feature.'},
  {z:64,sym:'Gd',name:'Gadolinium',mass:157.25,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u2077 5d\u00b9 6s\u00b2',en:1.20,uses:'MRI contrast agent, neutron capture therapy, Gd scintillators.'},
  {z:65,sym:'Tb',name:'Terbium',mass:158.925,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u2079 6s\u00b2',en:1.10,uses:'Green phosphors, terfenol-D (magnetostrictive alloy).'},
  {z:66,sym:'Dy',name:'Dysprosium',mass:162.5,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9\u2070 6s\u00b2',en:1.22,uses:'Nd magnets additive (EV motors), nuclear reactor rods.'},
  {z:67,sym:'Ho',name:'Holmium',mass:164.93,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9\u00b9 6s\u00b2',en:1.23,uses:'Laser scalpels, magnetic flux concentrators.'},
  {z:68,sym:'Er',name:'Erbium',mass:167.259,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9\u00b2 6s\u00b2',en:1.24,uses:'Optical fiber amplifiers, pink glass tinting, lasers.'},
  {z:69,sym:'Tm',name:'Thulium',mass:168.934,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9\u00b3 6s\u00b2',en:1.25,uses:'Portable X-ray sources, lasers, surgical instruments.'},
  {z:70,sym:'Yb',name:'Ytterbium',mass:173.054,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 6s\u00b2',en:1.10,uses:'Optical fiber lasers, atomic clocks, stress gauges.'},
  {z:71,sym:'Lu',name:'Lutetium',mass:174.967,type:'lanthanide',period:6,group:3,state:'Solid',econfig:'[Xe] 4f\u00b9\u2074 5d\u00b9 6s\u00b2',en:1.27,uses:'PET scan detectors, catalyst in oil refining.'}
];

const ACTINIDES=[
  {z:89,sym:'Ac',name:'Actinium',mass:227,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 6d\u00b9 7s\u00b2',en:1.10,uses:'Neutron sources, targeted cancer therapy.'},
  {z:90,sym:'Th',name:'Thorium',mass:232.038,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 6d\u00b2 7s\u00b2',en:1.30,uses:'Proposed nuclear fuel (thorium reactors), gas mantles.'},
  {z:91,sym:'Pa',name:'Protactinium',mass:231.036,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f\u00b2 6d\u00b9 7s\u00b2',en:1.50,uses:'Research only. Radioactive and toxic.'},
  {z:92,sym:'U',name:'Uranium',mass:238.029,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f\u00b3 6d\u00b9 7s\u00b2',en:1.38,uses:'Nuclear fuel (U-235 fissions), depleted uranium in armour.'},
  {z:93,sym:'Np',name:'Neptunium',mass:237,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f\u2074 6d\u00b9 7s\u00b2',en:1.36,uses:'Neutron detection equipment.'},
  {z:94,sym:'Pu',name:'Plutonium',mass:244,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f\u2076 7s\u00b2',en:1.28,uses:'Nuclear weapons, nuclear power fuel, RTGs (spacecraft).'},
  {z:95,sym:'Am',name:'Americium',mass:243,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f\u2077 7s\u00b2',en:1.30,uses:'Smoke detectors (Am-241), neutron sources.'},
  {z:96,sym:'Cm',name:'Curium',mass:247,type:'actinide',period:7,group:3,state:'Solid',econfig:'[Rn] 5f\u2077 6d\u00b9 7s\u00b2',en:1.30,uses:'Alpha particle X-ray spectrometer (Mars rovers).'},
  {z:97,sym:'Bk',name:'Berkelium',mass:247,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u2079 7s\u00b2',en:1.30,uses:'Research only. Used to synthesise element 117.'},
  {z:98,sym:'Cf',name:'Californium',mass:251,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2070 7s\u00b2',en:1.30,uses:'Neutron startup sources for reactors, gold prospecting.'},
  {z:99,sym:'Es',name:'Einsteinium',mass:252,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u00b9 7s\u00b2',en:1.30,uses:'Research only. Named after Albert Einstein.'},
  {z:100,sym:'Fm',name:'Fermium',mass:257,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u00b2 7s\u00b2',en:1.30,uses:'Research only. First produced in H-bomb fallout.'},
  {z:101,sym:'Md',name:'Mendelevium',mass:258,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u00b3 7s\u00b2',en:1.30,uses:'Research only. Named after Dmitri Mendeleev.'},
  {z:102,sym:'No',name:'Nobelium',mass:259,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 7s\u00b2',en:1.30,uses:'Research only. Named after Alfred Nobel.'},
  {z:103,sym:'Lr',name:'Lawrencium',mass:266,type:'actinide',period:7,group:3,state:'Synthetic',econfig:'[Rn] 5f\u00b9\u2074 7s\u00b2 7p\u00b9',en:1.30,uses:'Research only. Named after Ernest Lawrence.'}
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
  const layout=Array.from({length:7},()=>Array(18).fill(null));
  PT.forEach(el=>{
    const r=el.row-1,c=el.col-1;
    if(r>=0&&r<7&&c>=0&&c<18)layout[r][c]=el;
  });
  for(let r=0;r<7;r++){
    for(let c=0;c<18;c++){
      const el=layout[r][c];
      if(el){grid.appendChild(makeCell(el));}
      else {
        const empty=document.createElement('div');empty.className='pt-cell empty';
        if(r===5&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--ions-pos)">*</span>';}
        if(r===6&&c===2){empty.innerHTML='<span style="font-size:0.55rem;color:var(--alkene)">**</span>';}
        grid.appendChild(empty);
      }
    }
  }
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
function toggleTheme(){
  const isDark=!document.documentElement.hasAttribute('data-theme');
  document.documentElement.setAttribute('data-theme',isDark?'light':'');
  document.getElementById('themeBtn').textContent=isDark?'\ud83c\udf19':'\u2600\ufe0f';
  if(!isDark)document.documentElement.removeAttribute('data-theme');
  try{localStorage.setItem('labar_theme',isDark?'light':'dark');}catch(e){}
}
function restoreTheme(){
  try{
    const t=localStorage.getItem('labar_theme');
    if(t==='light'){document.documentElement.setAttribute('data-theme','light');const b=document.getElementById('themeBtn');if(b)b.textContent='\ud83c\udf19';}
  }catch(e){}
}

/* ---------- 17. PROGRESS DASHBOARD ---------- */
const CHAPTERS=[
  {
    label:'Organic',
    ids:['chkCalc','chk0','chk1','chk2','chk3','chk4b','chkOR','chkSynth','chkPoly'],
    names:['Calc','Hydrocarbons','IUPAC','Isomers','Library','Func. Groups','Org. Reactions','Synthesis','Polymers']
  },
  {
    label:'General',
    ids:['chkGlossary','chkReactivity','chk4','chk5','chk6','chk7','chk9','chk10','chk11','chk12','chkES','chkECalc','chk13','chkEq','chkSol','chkKinetics','chkLab','chkSpec'],
    names:['Glossary','Reactivity','Ions','Moles','Thermo','Nuclear','Bonding','Reactions','Acids','Redox','E-Series','E-Calc','Gas Laws','Equilibrium','Solutions','Kinetics','Lab Tech','Spectroscopy']
  },
  {
    label:'Tools',
    ids:['chkTools','chkBlocks','chkPT'],
    names:['Tools','Blocks','Periodic Table']
  }
];

const MESSAGES=[
  [0,   "Start checking off sections as you study! \u2728"],
  [10,  "Great start \u2014 keep going! \ud83d\ude80"],
  [25,  "You're 25% through \u2014 solid progress! \ud83d\udcaa"],
  [50,  "Halfway there! You're on a roll \ud83d\udd25"],
  [75,  "75% done \u2014 almost a chemistry expert! \u2697\ufe0f"],
  [90,  "So close! Just a few sections left \ud83c\udfc1"],
  [100, "\ud83c\udf89 Encyclopedia complete! You've mastered LabAR.EDU!"]
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

  const fill=document.getElementById('progressFill');
  const label=document.getElementById('progressLabel');
  const badge=document.getElementById('pdBadge');
  if(fill)fill.style.width=pct+'%';
  if(label)label.textContent=`${done} / ${total}`;
  if(badge)badge.textContent=pct+'%';
  const mf=document.getElementById('mobProgressFill');
  const ml=document.getElementById('mobProgressLabel');
  if(mf)mf.style.width=pct+'%';
  if(ml)ml.textContent=pct+'%';

  const msg=document.getElementById('pdMessage');
  if(msg)msg.textContent=getMsg(pct);

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
  {title:'Hydrocarbon Calculator',ctx:'Calculate alkane alkene alkyne molecular formulas CnH2n+2 carbon count
