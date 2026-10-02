// Usage: node scripts/fetch_researchmap.mjs YOUR_PERMALINK   (Node 18+)
// Fetches public published_papers from the researchmap API and writes data/researchmap.js
import { writeFileSync } from 'node:fs';
const id = process.argv[2]; if (!id) throw new Error('permalink required');
const g = o => o && (o.en || o.ja || '');
const out = []; let start = 1;
for (;;) {
  const r = await fetch(`https://api.researchmap.jp/${id}/published_papers?limit=100&start=${start}`);
  if (!r.ok) throw new Error(r.status);
  const j = await r.json(), items = j.items || [];
  for (const p of items) out.push({
    year: Number((p.publication_date || '').slice(0, 4)) || '',
    authors: (p.authors?.en || p.authors?.ja || []).map(a => a.name),
    title: g(p.paper_title), journal: g(p.publication_name), volume: p.volume || '',
    pages: [p.starting_page, p.ending_page].filter(Boolean).join('-'),
    doi: p.identifiers?.doi?.[0] || '', pmid: p.identifiers?.pm_id?.[0] || '',
    relatedResearch: [], source: 'researchmap' });
  if (items.length < 100) break; start += 100;
}
writeFileSync('data/researchmap.js', 'DATA.researchmap = ' + JSON.stringify(out, null, 1) + ';\n');
console.log(out.length, 'papers written');
