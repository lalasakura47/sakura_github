(()=>{
const D=window.DATA,P=D.profile,M=document.querySelector('#main');
const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R=id=>D.research.find(r=>r.id===id);
const chips=a=>(a||[]).filter(R).map(i=>`<a class="chip" href="#/research/${i}">${e(R(i).title)}</a>`).join('');
const img=i=>i&&i.src?`<img src="${e(i.src)}" alt="${e(i.alt||'')}" loading="lazy">`:'';
const ja=t=>t?`<details><summary>Japanese summary / 日本語</summary><p lang="ja">${e(t)}</p></details>`:'';
const rel=(k,id)=>(D[k]||[]).filter(x=>(x.relatedResearch||[]).includes(id));
const pubs=()=>{const m=D.publications||[],d=new Set(m.map(p=>(p.doi||'').toLowerCase()).filter(Boolean));
 return m.concat((D.researchmap||[]).filter(p=>!p.doi||!d.has(p.doi.toLowerCase())));};
const au=a=>(a||[]).map(n=>n.includes(P.me)?`<b>${e(n)}</b>`:e(n)).join(', ');
const pub=p=>`<li class="item">${au(p.authors)}. ${e(p.title)}. <i>${e(p.journal)}</i>${p.volume?' '+e(p.volume):''}${p.pages?', '+e(p.pages):''} (${e(p.year)}).
 ${p.doi?`<a href="https://doi.org/${e(p.doi)}">DOI</a> `:''}${p.pmid?`<a href="https://pubmed.ncbi.nlm.nih.gov/${e(p.pmid)}/">PMID</a> `:''}
 ${p.first?'<span class="tag">First author</span>':''}<div>${chips(p.relatedResearch)}</div></li>`;
const pubList=l=>{const y={};l.forEach(p=>(y[p.year]=y[p.year]||[]).push(p));
 return Object.keys(y).sort((a,b)=>b-a).map(k=>`<h3>${k}</h3><ul class="list">${y[k].map(pub).join('')}</ul>`).join('')||'<p class="sub">No entries yet.</p>';};
const award=a=>`<li class="item"><span class="date">${e(a.year)}</span><b>${e(a.title)}</b> <span class="tag">${e(a.category||'')}</span><div class="sub">${e(a.org)}</div><div>${e(a.desc)}</div>${chips(a.relatedResearch)}</li>`;
const fund=f=>`<li class="item"><span class="date">${e(f.period||f.year)}</span><b>${e(f.title)}</b><div class="sub">${e(f.program)}${f.role?' · '+e(f.role):''}</div><div>${e(f.desc)}</div>${chips(f.relatedResearch)}</li>`;
const act=a=>`<li class="item"><span class="date">${e(a.date)}</span><b>${e(a.title)}</b><div class="sub">${e(a.org)}${a.role?' · '+e(a.role):''}</div><div>${e(a.desc)}</div>${chips(a.relatedResearch)}${img(a.photo)}</li>`;
const L={publication:'publications',award:'awards',funding:'funding',activity:'activities',research:'research'};
const newsItem=n=>`<li class="item"><span class="date">${e(n.date)}</span><div>${e(n.text)} ${(n.links||[]).map(l=>`<a href="#/${L[l.type]}${l.type==='research'?'/'+l.id:''}">→ ${e(l.type)}</a>`).join(' ')}${img(n.photo)}</div></li>`;
const sec=(t,h)=>h?`<h2>${t}</h2>${h}`:'';
const ul=(a,f)=>a&&a.length?`<ul class="list">${a.map(f).join('')}</ul>`:'';
const rcard=r=>`<a class="card" href="#/research/${r.id}"><span class="tag ${r.status==='current'?'cur':''}">${r.status==='previous'?'Previous research':r.status==='current'?'Current':e(r.status)}</span><h3>${e(r.no)} ${e(r.title)}</h3><p class="sub">${e(r.summary)}</p></a>`;
const vision=()=>{const v=D.vision;return `<div class="vision"><b>Current research</b><ul>${v.current.map(x=>`<li>${e(x)}</li>`).join('')}</ul><b>Long-term vision (future direction)</b><ul>${v.future.map(x=>`<li>${e(x)}</li>`).join('')}</ul><small class="sub">${e(v.note)}</small></div>`;};
const nav=[['','Home'],['about','About'],['research','Research'],['publications','Publications'],['awards','Awards'],['funding','Funding'],['activities','Activities'],['news','News'],['cv','CV']];
document.querySelector('#nav').innerHTML=nav.map(([h,t])=>`<a href="#/${h}" data-h="${h}">${t}</a>`).join('');
document.querySelector('#yr').textContent=new Date().getFullYear();
const pages={
 '':()=>({t:'',h:`<div class="hero">${img(P.photo)}<div><h1>${e(P.name)}, ${e(P.degree)}</h1><p class="lead">${e(P.position)}<br>${e(P.affiliation)}</p></div></div>
  <p class="lead">${e(P.intro)}</p>${ja(P.introJa)}
  <div class="vision"><b>Long-term Research Vision</b><br>${e(P.vision)} <a href="#/research">Details →</a>${ja(P.visionJa)}</div>
  ${sec('Research',`<div class="cards">${D.research.map(rcard).join('')}</div>`)}
  ${sec('Selected Publications',ul(pubs().filter(p=>p.selected),pub))}
  ${sec('Awards &amp; Fellowships',ul((D.awards||[]).slice(0,3),award)+'<a href="#/awards">All →</a>')}
  ${sec('Recent News',`<ul class="list news">${(D.news||[]).slice(0,3).map(newsItem).join('')}</ul><a href="#/news">All →</a>`)}`}),
 about:()=>({t:'About',h:`<h1>About</h1><p><b>${e(P.name)}</b> (${e(P.nameJa)}), ${e(P.degree)}<br>${e(P.position)}, ${e(P.affiliation)}</p>
  ${sec('Research interests',P.interests.map(i=>`<span class="tag">${e(i)}</span>`).join(''))}
  ${sec('Background',`<p>${e(P.story)}</p>${ja(P.storyJa)}`)}
  ${sec('Timeline',`<ol class="tl">${P.timeline.map(t=>`<li><b>${e(t.title)}</b> <span class="date">${e(t.year)}</span><div class="sub">${e(t.text)}</div></li>`).join('')}</ol>`)}
  ${sec('Career',ul(P.career,c=>`<li class="item"><span class="date">${e(c.period)}</span>${e(c.text)}</li>`))}
  ${sec('Education',ul(P.education,c=>`<li class="item"><span class="date">${e(c.period)}</span>${e(c.text)}</li>`))}
  ${sec('External profiles',ul(P.links,l=>`<li class="item"><a href="${e(l.url)}" rel="me noopener">${e(l.label)}</a></li>`))}`}),
 research:id=>{
  if(!id)return{t:'Research',h:`<h1>Research</h1>${D.research.map(r=>`<div class="cards" style="margin-bottom:14px">${rcard(r)}</div>`).join('')}${sec('Long-term Research Vision',`<p class="lead">${e(P.vision)}</p>${vision()}`)}`};
  const r=R(id);if(!r)return{t:'Not found',h:'<p>Not found.</p>'};
  const S=[['Overview',r.overview],['Background',r.background],['Research Question',r.question],['Approach',r.approach],['Key Findings',r.findings],['Current Direction',r.direction]];
  return{t:r.title,h:`<p><a href="#/research">← Research</a></p><span class="tag ${r.status==='current'?'cur':''}">${r.status==='previous'?'Previous research':e(r.status)}</span><h1>${e(r.no)} ${e(r.title)}</h1>
  <p>${(r.keywords||[]).map(k=>`<span class="tag">${e(k)}</span>`).join('')}</p>${ja(r.ja)}
  ${S.map(([t,v])=>sec(t,v?`<p>${e(v)}</p>`:'')).join('')}
  ${sec('Related Publications',ul(rel('publications',id).concat((D.researchmap||[]).filter(p=>(p.relatedResearch||[]).includes(id))),pub))}
  ${sec('Related Funding',ul(rel('funding',id),fund))}
  ${sec('Related Awards',ul(rel('awards',id),award))}
  ${sec('Related Activities',ul(rel('activities',id),act))}`};},
 publications:()=>({t:'Publications',h:`<h1>Publications</h1><p class="sub">Full list: <a href="https://researchmap.jp/${e(P.researchmapId)}">Researchmap</a></p>${pubList(pubs())}`}),
 awards:()=>({t:'Awards',h:`<h1>Awards &amp; Fellowships</h1>${ul((D.awards||[]).slice().sort((a,b)=>b.year-a.year),award)}`}),
 funding:()=>({t:'Funding',h:`<h1>Funding</h1>${ul((D.funding||[]).slice().sort((a,b)=>b.year-a.year),fund)}`}),
 activities:()=>({t:'Activities',h:`<h1>Academic &amp; Science Activities</h1>${D.activityCategories.map(c=>sec(c,ul((D.activities||[]).filter(a=>a.category===c),act))).join('')}`}),
 news:()=>({t:'News',h:`<h1>News</h1><ul class="list news">${(D.news||[]).map(newsItem).join('')}</ul>`}),
 cv:()=>({t:'CV',h:`<h1>CV</h1><p><a href="${e(P.cvPdf)}">Download full CV (PDF)</a></p>${sec('Career',ul(P.career,c=>`<li class="item"><span class="date">${e(c.period)}</span>${e(c.text)}</li>`))}${sec('Education',ul(P.education,c=>`<li class="item"><span class="date">${e(c.period)}</span>${e(c.text)}</li>`))}${sec('Awards',ul(D.awards,award))}${sec('Funding',ul(D.funding,fund))}`})
};
function route(){const[,p='',id]=location.hash.replace(/^#/,'').split('/');const f=pages[p]||pages[''];const o=f(id);
 M.innerHTML=o.h;document.title=(o.t?o.t+' | ':'')+'Sakura Moriyama, Ph.D. | Kyoto University';
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.h===p));
 document.querySelector('#nav').classList.remove('open');scrollTo(0,0);}
addEventListener('hashchange',route);route();
const b=document.querySelector('#menu');b.onclick=()=>b.setAttribute('aria-expanded',document.querySelector('#nav').classList.toggle('open'));
})();
