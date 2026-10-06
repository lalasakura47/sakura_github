// Usage: node scripts/fetch_researchmap.mjs YOUR_PERMALINK   (Node 18+)
// Pulls public data from the researchmap API and writes data/researchmap.js
// Field names are best guesses: each type is skipped with a warning if it fails,
// and the first item's keys are printed in the log so the mapping can be adjusted.
import { writeFileSync } from 'node:fs';
const id = process.argv[2]; if (!id) throw new Error('permalink required');
const g = o => typeof o === 'string' ? o : (o && (o.en || o.ja)) || '';
const yr = s => String(s || '').slice(0, 4);
const first = (a, ...ks) => { for (const k of ks) if (a[k]) return a[k]; return ''; };
const span = a => { const f = yr(a.from_date), t = yr(a.to_date); return f ? f + '–' + (t && t !== f ? t : '') : ''; };

async function all(path) {
  const out = [];
  for (let start = 1; ; start += 100) {
    const r = await fetch(`https://api.researchmap.jp/${id}/${path}?limit=100&start=${start}`);
    if (!r.ok) { console.warn(path, 'skipped: HTTP', r.status); return out; }
    const items = (await r.json()).items || [];
    out.push(...items);
    if (items.length < 100) break;
  }
  console.log(path, out.length, 'items; keys:', Object.keys(out[0] || {}).join(','));
  return out;
}
const run = async (path, f) => { try { return (await all(path)).map(f); } catch (e) { console.warn(path, 'failed:', e.message); return []; } };

const papers = await run('published_papers', p => ({
  year: Number(yr(p.publication_date)) || '',
  authors: (p.authors?.en || p.authors?.ja || []).map(a => a.name),
  title: g(p.paper_title), journal: g(p.publication_name), volume: p.volume || '',
  pages: [p.starting_page, p.ending_page].filter(Boolean).join('-'),
  doi: p.identifiers?.doi?.[0] || '', pmid: p.identifiers?.pm_id?.[0] || '',
  relatedResearch: [] }));
const rm = {
  awards: await run('awards', a => ({ year: yr(first(a, 'award_date', 'awarded_date', 'date')), title: g(a.award_name), org: g(a.association), desc: g(a.description), category: 'Award', relatedResearch: [] })),
  funding: await run('research_projects', a => ({ year: yr(a.from_date), period: span(a), title: g(a.research_project_title), program: g(a.offer_organization) || g(a.system_name), role: typeof a.category === 'string' ? a.category.replace(/_/g, ' ') : '', desc: '', relatedResearch: [] })),
  career: await run('research_experience', a => ({ period: span(a), text: [g(a.job), g(a.affiliation)].filter(Boolean).join(', ') })),
  education: await run('education', a => ({ period: span(a), text: [g(a.institution), g(a.department), g(a.degree)].filter(Boolean).join(', ') })),
  presentations: await run('presentations', a => ({ year: yr(first(a, 'publication_date', 'from_date')), authors: (a.presenters?.en || a.presenters?.ja || []).map(x => x.name), title: g(a.presentation_title), event: g(a.event), invited: !!a.invited, relatedResearch: [] })),
  activities: [
    ...await run('social_contribution', a => ({ date: yr(a.from_date), title: g(a.social_contribution_title), org: g(a.organization) || g(a.event), role: g(a.role), desc: '', category: 'Other', relatedResearch: [] })),
    ...await run('committee_memberships', a => ({ date: span(a), title: g(a.committee_name), org: g(a.association), role: g(a.role), desc: '', category: 'Other', relatedResearch: [] }))
  ]
};
// ---- Auto categories / theme links: keyword guesses. Edit the patterns below as you like. ----
const THEMES = [
  ['gpcr-trp', /(gpcr|g[- ]?protein).*trp|trp.*(gpcr|g[- ]?protein)|crosstalk|クロストーク/i],
  ['trp-thermal', /trp.*(thermal|temperature|heat|cold|温度|熱)|(thermal|temperature|温度|熱).*trp|thermosens|温度感受/i],
  ['or-sensor', /olfactory|odorant|odor receptor|嗅覚|におい|匂い|cell[- ]array|セルアレイ/i]];
const AWARD_CAT = [['Poster Award', /poster|ポスター/i], ['Fellowship', /fellow|特別研究員|フェロー/i], ['International selection', /lindau|selected|選出|派遣/i]];
const ACT_CAT = [
  ['Innovation / Entrepreneurship', /startup|pitch|entrepreneur|起業|ピッチ|アントレ|事業化|plug and play/i],
  ['Science Communication', /science caf|café|cafe|public lecture|outreach|講演|サイエンスカフェ|出前|アウトリーチ|高校|中学|小学|市民/i],
  ['Researcher Development', /研修|training|program|プログラム|JST|PM/i],
  ['Conference & Forum Organization', /organi[sz]|organizer|chair|moderator|symposium|forum|シンポジウム|フォーラム|座長|運営|企画/i]];
const T = x => [x.title, x.text, x.event, x.org, x.program].filter(Boolean).join(' ');
const tag = x => THEMES.filter(([, re]) => re.test(T(x))).map(([i]) => i);
const pick = (rules, t, d) => (rules.find(([, re]) => re.test(t)) || [d])[0];
rm.awards.forEach(a => { a.category = pick(AWARD_CAT, T(a), 'Award'); a.relatedResearch = tag(a); });
rm.activities.forEach(a => { a.category = pick(ACT_CAT, T(a), 'Other'); a.relatedResearch = tag(a); });
[...rm.funding, ...rm.presentations, ...papers].forEach(x => { x.relatedResearch = tag(x); });
for (const k in rm) rm[k] = rm[k].filter(x => x.title || x.text);
writeFileSync('data/researchmap.js', 'DATA.researchmap = ' + JSON.stringify(papers, null, 1) + ';\nDATA.rm = ' + JSON.stringify(rm, null, 1) + ';\n');
console.log('written:', papers.length, 'papers;', Object.entries(rm).map(([k, v]) => k + ' ' + v.length).join(', '));
