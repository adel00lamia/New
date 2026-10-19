/* ================= PlanBiz platform : comptes, business, sauvegarde, IA, exports ================= */
(function () {
'use strict';
const CFG = window.PLANBIZ_CONFIG || {};
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="17" width="5" height="9" rx="1" fill="currentColor" opacity=".55"/><rect x="13.5" y="11" width="5" height="15" rx="1" fill="currentColor" opacity=".8"/><rect x="21" y="5" width="5" height="21" rx="1" fill="currentColor"/></svg>`;
const ago = iso => { const s = (Date.now() - new Date(iso).getTime()) / 1000; if (s < 60) return 'à l\'instant'; if (s < 3600) return `il y a ${Math.floor(s / 60)} min`; if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`; return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); };

/* ---------- stores ---------- */
const sb = (CFG.supabaseUrl && CFG.supabaseKey && window.supabase) ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
const SupaStore = {
  async list() { const { data, error } = await sb.from('businesses').select('id,name,sector,updated_at,created_at,summary:data->summary').order('updated_at', { ascending: false }); if (error) throw error; return data; },
  async get(id) { const { data, error } = await sb.from('businesses').select('*').eq('id', id).single(); if (error) throw error; return data; },
  async create(name, data) { const { data: row, error } = await sb.from('businesses').insert({ name, sector: data.id.secteur || null, data }).select('id,name,updated_at').single(); if (error) throw error; return row; },
  async update(id, patch) { const { error } = await sb.from('businesses').update(patch).eq('id', id); if (error) throw error; },
  async remove(id) { const { error } = await sb.from('businesses').delete().eq('id', id); if (error) throw error; }
};
function makeLocal(LK) {
  const lread = () => { try { return JSON.parse(localStorage.getItem(LK) || '[]'); } catch (e) { return []; } };
  const lwrite = a => { try { localStorage.setItem(LK, JSON.stringify(a)); } catch (e) { throw new Error('Stockage du navigateur indisponible'); } };
  return {
    async list() { return lread().map(r => ({ id: r.id, name: r.name, sector: r.sector, updated_at: r.updated_at, created_at: r.created_at, summary: r.data && r.data.summary })).sort((a, b) => b.updated_at.localeCompare(a.updated_at)); },
    async get(id) { const r = lread().find(x => x.id === id); if (!r) throw new Error('Business introuvable'); return r; },
    async create(name, data) { const a = lread(); const now = new Date().toISOString(); const r = { id: 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, sector: data.id.secteur || '', data, created_at: now, updated_at: now }; a.push(r); lwrite(a); return r; },
    async update(id, patch) { const a = lread(); const r = a.find(x => x.id === id); if (!r) return; Object.assign(r, patch, { updated_at: new Date().toISOString() }); lwrite(a); },
    async remove(id) { lwrite(lread().filter(x => x.id !== id)); },
    clear() { try { localStorage.removeItem(LK); } catch (e) { } }
  };
}
const LocalStore = makeLocal('planbiz.local.businesses');
const DemoStore = makeLocal('planbiz.demo.businesses');
let store = sb ? SupaStore : LocalStore;
let demo = false;

/* ---------- state ---------- */
let user = null, current = null, saveState = 'saved', saveTimer = null, lastSaved = null, list = [];
const show = id => { ['boot', 'landing', 'auth', 'hub', 'editor'].forEach(k => { const el = document.getElementById(k); if (el) el.hidden = k !== id; }); document.body.dataset.screen = id; };
function setStatus(st) { saveState = st; const el = document.getElementById('saved'); if (el) { el.textContent = PB.statusText(); el.className = 'svd ' + st; } }
function summaryOf() { try { return { ca: R.P.ca.map(Math.round), rn: R.P.rn.map(Math.round), min: Math.round(R.C.min), fonds: Math.round(R.C.fonds), pm: R.C.pointMort ? mLong(R.C.pointMort) : null, stade: S.id.stade || '', example: !!(S.meta && S.meta.example) }; } catch (e) { return null; } }
async function flush() {
  if (!current || !S) return;
  clearTimeout(saveTimer); saveTimer = null;
  setStatus('saving');
  try {
    S.summary = summaryOf();
    const name = (S.id.nom || '').trim() || current.name || 'Sans nom';
    await store.update(current.id, { name, sector: S.id.secteur || null, data: S });
    current.name = name; lastSaved = new Date(); setStatus('saved');
    try { localStorage.removeItem('planbiz.pending.' + current.id); } catch (e) { }
  } catch (e) {
    console.error(e); setStatus('error');
    try { localStorage.setItem('planbiz.pending.' + current.id, JSON.stringify(S)); } catch (x) { }
    saveTimer = setTimeout(flush, 8000);
  }
}

/* ---------- public API used by the UI ---------- */
window.PB = {
  logo: () => LOGO,
  queueSave() { if (!current) return; setStatus('pending'); clearTimeout(saveTimer); saveTimer = setTimeout(flush, 1200); },
  statusText() { if (demo) return 'Démo : rien n\'est enregistré en ligne'; return { saved: lastSaved ? `✓ Enregistré ${sb ? 'en ligne' : 'sur cet appareil'}` : (sb ? 'Sauvegarde en ligne active' : 'Sauvegarde sur cet appareil'), pending: 'Modifications en attente…', saving: 'Enregistrement…', error: '⚠ Hors ligne : nouvel essai automatique' }[saveState]; },
  userMenu() { return `<div class="umenu"><button class="avatar" data-pb="menu" title="${esc(demo ? 'Mode démo' : user ? user.email : 'Mode local')}">${esc(demo ? 'D' : user ? user.email[0].toUpperCase() : '•')}</button></div>`; },
  isDemo: () => demo, hasAccount: () => !!user, email: () => user ? user.email : '', currentName: () => current ? current.name : '',
  async startDemo() { await startDemo(); },
  async token() { if (!sb) return ''; const { data } = await sb.auth.getSession(); return data.session ? data.session.access_token : ''; },
  aiConsent
};

/* ---------- consentement IA (loi 09-08) ---------- */
function hasAiConsent() {
  if (user && user.user_metadata && user.user_metadata.ai_consent_at) return true;
  try { return !!localStorage.getItem('planbiz.aiConsent.' + (user ? user.id : 'local')); } catch (e) { return false; }
}
function aiConsent() {
  if (hasAiConsent()) return Promise.resolve(true);
  return new Promise(resolve => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" role="dialog" aria-labelledby="aicT"><h2 id="aicT">Avant d'utiliser l'IA</h2>
     <p style="margin:10px 0">Pour te répondre, PlanBiz envoie le texte concerné (ta question, ou les parties de ton business plan à analyser) au service d'IA <b>Claude</b> de la société Anthropic, situé aux <b>États-Unis</b>. Par défaut, Anthropic n'utilise pas ces données pour entraîner ses modèles.</p>
     <p class="small muted" style="margin:0 0 6px">Tes questions à l'assistant sont aussi conservées sans ton nom ni ton e-mail, pour améliorer l'outil. N'y mets pas d'informations personnelles sensibles.</p>
     <p class="small"><a href="/legal.html#confidentialite" target="_blank" rel="noopener">Lire la politique de confidentialité</a></p>
     <div class="row" style="justify-content:flex-end;margin-top:16px"><button type="button" class="btn" data-x="no">Refuser</button><button type="button" class="btn pri" data-x="ok">J'accepte</button></div></div>`;
    document.body.appendChild(bg);
    bg.addEventListener('click', async e => {
      const k = e.target.dataset && e.target.dataset.x; if (!k && e.target !== bg) return;
      bg.remove();
      if (k !== 'ok') { resolve(false); return; }
      const at = new Date().toISOString();
      try { localStorage.setItem('planbiz.aiConsent.' + (user ? user.id : 'local'), at); } catch (err) { }
      try { if (sb && user) { const { data } = await sb.auth.updateUser({ data: { ai_consent_at: at } }); if (data && data.user) user = data.user; } } catch (err) { }
      resolve(true);
    });
  });
}

/* ---------- AI through /api/ai ---------- */
async function aiCall(prompt, opts = {}) {
  if (!(await aiConsent())) throw { code: 'consent_refused', message: 'Tu as refusé l\'envoi au service d\'IA. Tu peux continuer sans l\'IA.' };
  const headers = { 'content-type': 'application/json' }; const t = await PB.token(); if (t) headers.authorization = 'Bearer ' + t;
  let r;
  try { r = await fetch(CFG.aiEndpoint || '/api/ai', { method: 'POST', headers, body: JSON.stringify({ prompt, tier: opts.modelTier || 'default' }), signal: opts.signal }); }
  catch (e) { throw { code: 'network', message: 'Service IA injoignable.' }; }
  if (!r.ok) { const m = await r.text().catch(() => ''); throw { code: r.status === 401 ? 'not_granted' : r.status === 429 ? 'rate_limited' : 'error', message: m || ('Erreur ' + r.status) }; }
  const reader = r.body.getReader(), dec = new TextDecoder(); let text = '';
  for (;;) { const { value, done } = await reader.read(); if (done) break; text += dec.decode(value, { stream: true }); if (opts.onText) opts.onText({ text }); }
  if (text.includes('[[PLANBIZ_ERROR]]')) throw { code: 'error', message: text.split('[[PLANBIZ_ERROR]]')[1] || 'Erreur IA' };
  return { text, truncated: false };
}
sampleFn = Object.assign((p, o) => aiCall(p, o), { json: async (p, o) => extractJSON((await aiCall(p + '\n\nRéponds uniquement avec du JSON valide, sans texte autour.', o)).text) });
sampleReady = true;

/* ---------- downloads & print ---------- */
dlFn = { async save({ filename, data }) { const blob = data instanceof Blob ? data : new Blob([data], { type: /\.json$/.test(filename) ? 'application/json' : /\.html?$/.test(filename) ? 'text/html' : /\.md$/.test(filename) ? 'text/markdown' : /\.xlsx$/.test(filename) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/octet-stream' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return { status: 'saved' }; } };
function printDoc() {
  const w = window.open('', '_blank'); if (!w) { toast('Autorise les fenêtres pop-up pour imprimer.'); return; }
  if (window.PBReport) { w.document.write(PBReport.html({ autoprint: true })); w.document.close(); return; }
  const css = `body{font-family:Georgia,'Times New Roman',serif;color:#14242a;max-width:880px;margin:32px auto;padding:0 24px;line-height:1.5;font-size:13.5px}h1{font-size:30px;margin:0 0 4px;font-family:Helvetica,Arial,sans-serif}h2{font-family:Helvetica,Arial,sans-serif;color:#0B5B57;border-bottom:2px solid #0B5B57;padding-bottom:4px;margin-top:28px;page-break-after:avoid}h3{margin:14px 0 6px;font-family:Helvetica,Arial,sans-serif}table{border-collapse:collapse;width:100%;font-size:12px;margin:8px 0 14px;page-break-inside:avoid}th,td{border:1px solid #cdd8da;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eaf2f1}td.n,th.n{text-align:right;white-space:nowrap}tr.tot td{font-weight:bold;background:#f3f7f6}tr.grand td{font-weight:bold;border-top:2px solid #14242a}.eyebrow{color:#C27B2A;text-transform:uppercase;letter-spacing:.08em;font-size:11px;font-weight:bold;font-family:Helvetica,Arial,sans-serif}.muted{color:#56686d}.small{font-size:11.5px}@page{margin:16mm}`;
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Business plan — ${esc(S.id.nom || '')}</title><style>${css}</style></head><body>${docHTML().replace('<div class="doc" id="bpdoc">', '<div>')}<script>setTimeout(()=>print(),400)<\/script></body></html>`);
  w.document.close();
}

/* ---------- auth screen ---------- */
let authMode = 'login', authMsg = '';
function renderLanding() {
  if (typeof PBLanding === 'undefined' || /connexion|reset/.test(location.hash)) return renderAuth();
  PBLanding.render(); show('landing'); window.scrollTo(0, 0);
}
function renderAuth() {
  const el = document.getElementById('auth');
  el.innerHTML = `<div class="auth-wrap">
   <aside class="auth-art"><div class="auth-brand"><span class="logo-lg">${LOGO}</span><b>PlanBiz</b></div>
    <div class="auth-copy"><p class="eyebrow-l">Business plan · 3 ans · Maroc</p><h1>Des prévisions financières claires, prêtes pour vos financeurs.</h1>
    <p class="auth-sub">CPC, trésorerie sur 36 mois, bilan et scénarios, calculés selon la fiscalité marocaine 2026.</p></div>
    <div class="preview" aria-hidden="true"><div class="pv-head"><span>Aperçu · exemple</span><span class="pv-pill">Réaliste</span></div>
     <div class="pv-kpis"><div><small>CA An 3</small><b>10,59 M</b><i class="up">+96 %</i></div><div><small>EBE An 3</small><b>1,81 M</b><i class="up">17,1 %</i></div><div><small>Tréso. min.</small><b>225 k</b><i>févr. 27</i></div></div>
     <div class="pv-chart">${[22,30,26,38,34,46,52,48,60,68,74,86].map((h,i)=>`<span style="height:${h}%" class="${i>8?'hi':''}"></span>`).join('')}</div>
     <div class="pv-foot"><span>An 1</span><span>An 2</span><span>An 3</span></div></div>
    <ul class="auth-points"><li>Questionnaire guidé ou import depuis votre IA</li><li>Fiscalité, TVA, CNSS/AMO et IR intégrés</li><li>Export PDF et Excel</li></ul><p class="auth-credit"><a href="/legal.html" target="_blank" rel="noopener">Mentions légales et confidentialité</a></p></aside>
   <main class="auth-main"><form class="auth-card" id="authForm" novalidate>
    <button type="button" class="linkbtn auth-back" data-pb="landing">← Découvrir PlanBiz</button>
    <h2>${{ login: 'Connexion', signup: 'Créer un compte', reset: 'Mot de passe oublié' }[authMode]}</h2>
    <p class="muted small">${{ login: 'Retrouve tes business plans.', signup: 'Gratuit. Un compte pour tous tes projets.', reset: 'Reçois un lien pour choisir un nouveau mot de passe.' }[authMode]}</p>
    <div class="f"><label for="aEmail">E-mail</label><input class="in" id="aEmail" type="email" autocomplete="email" required></div>
    ${authMode !== 'reset' ? `<div class="f"><label for="aPass">Mot de passe</label><input class="in" id="aPass" type="password" autocomplete="${authMode === 'signup' ? 'new-password' : 'current-password'}" minlength="8" required>${authMode === 'signup' ? '<span class="help">8 caractères minimum.</span>' : ''}</div>` : ''}
    ${authMode === 'signup' ? `<label class="auth-terms"><input type="checkbox" id="aTerms" required> <span>J'accepte les <a href="/legal.html#conditions" target="_blank" rel="noopener">conditions d'utilisation</a> et la <a href="/legal.html#confidentialite" target="_blank" rel="noopener">politique de confidentialité</a>.</span></label>` : ''}
    ${authMsg ? `<div class="al ${authMsg.startsWith('✓') ? 'good' : 'warn'}"><span>${esc(authMsg)}</span></div>` : ''}
    <button class="btn pri big" type="submit" id="aSubmit">${{ login: 'Se connecter', signup: 'Créer mon compte', reset: 'Envoyer le lien' }[authMode]}</button>
    <div class="auth-demo"><span>Pas encore prêt ?</span><button type="button" class="btn" data-pb="demo">Essayer la démo sans compte</button><button type="button" class="btn ghost" data-pb="video">▶ Voir la vidéo</button></div>
    <div class="auth-alt">${authMode === 'login' ? `<button type="button" class="linkbtn" data-auth="signup">Créer un compte</button><button type="button" class="linkbtn" data-auth="reset">Mot de passe oublié ?</button>` : `<button type="button" class="linkbtn" data-auth="login">J'ai déjà un compte</button>`}</div>
   </form></main></div>`;
  show('auth');
}
async function onAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('aEmail').value.trim(), pass = (document.getElementById('aPass') || {}).value;
  const btn = document.getElementById('aSubmit'); btn.disabled = true; authMsg = '';
  try {
    if (authMode === 'login') { const { error } = await sb.auth.signInWithPassword({ email, password: pass }); if (error) throw error; }
    else if (authMode === 'signup') { if (!document.getElementById('aTerms').checked) { authMsg = 'Coche la case pour accepter les conditions et la politique de confidentialité.'; renderAuth(); return; } const { data, error } = await sb.auth.signUp({ email, password: pass, options: { emailRedirectTo: location.origin, data: { terms_accepted_at: new Date().toISOString(), terms_version: '2026-10' } } }); if (error) throw error; if (!data.session) { authMsg = '✓ Compte créé. Ouvre le lien reçu par e-mail pour l\'activer, puis connecte-toi.'; authMode = 'login'; renderAuth(); } }
    else { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/#reset' }); if (error) throw error; authMsg = '✓ Lien envoyé : vérifie ta boîte mail.'; authMode = 'login'; renderAuth(); }
  } catch (err) {
    const m = String(err.message || err);
    authMsg = /Invalid login/i.test(m) ? 'E-mail ou mot de passe incorrect.' : /Email not confirmed/i.test(m) ? 'Confirme d\'abord ton e-mail avec le lien reçu.' : /already registered/i.test(m) ? 'Un compte existe déjà avec cet e-mail : connecte-toi.' : /Password should/i.test(m) ? 'Mot de passe trop court (8 caractères minimum).' : /email rate limit|over_email_send/i.test(m) || (err && err.code === 'over_email_send_rate_limit') ? 'Trop d\'inscriptions en même temps : l\'envoi des e-mails est saturé. Réessaie dans une heure, ou essaie la démo en attendant.' : /rate limit/i.test(m) ? 'Trop de tentatives : réessaie dans quelques minutes.' : m;
    renderAuth();
  } finally { const b = document.getElementById('aSubmit'); if (b) b.disabled = false; }
}

/* ---------- hub : mes business ---------- */
async function openHub() {
  await flush(); current = null; S = null; R = null;
  try { history.replaceState(null, '', location.pathname); } catch (e) { }
  show('hub'); renderHub(true);
  try { list = await store.list(); } catch (e) { list = []; toast('Impossible de charger tes business : ' + (e.message || e)); }
  renderHub(false);
}
function bizCard(b) {
  const s = b.summary || {}; const empty = !s.ca || s.ca.every(v => !v); const ca = empty ? null : s.ca[2], rn = empty || !s.rn ? null : s.rn[2]; if (empty) s.min = undefined;
  const ini = (b.name || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = [...(b.name || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
  return `<article class="biz">
   <button class="biz-open" data-pb="open" data-id="${b.id}" aria-label="Ouvrir ${esc(b.name)}">
    <div class="biz-top"><span class="biz-av h${hue}">${esc(ini)}</span><div class="biz-t"><h3>${esc(b.name || 'Sans nom')}</h3><p>${esc(b.sector || 'Secteur à préciser')}${s.example ? ' · <span class="pill warn">modèle</span>' : ''}</p></div></div>
    <div class="biz-kpi"><div><small>CA An 3</small><b>${ca !== null ? kdh(ca) : '—'}</b></div><div><small>Résultat An 3</small><b class="${rn === null ? '' : rn >= 0 ? 'pos' : 'neg'}">${rn !== null ? kdh(rn) : '—'}</b></div><div><small>Tréso. min.</small><b class="${s.min < 0 ? 'neg' : ''}">${s.min !== undefined ? kdh(s.min) : '—'}</b></div></div>
   </button>
   <footer><span class="muted small">Modifié ${ago(b.updated_at)}</span><span class="sp"></span>
    <button class="iconbtn" data-pb="dup" data-id="${b.id}" title="Dupliquer"><svg viewBox="0 0 24 24"><path d="M8 8h12v12H8zM4 16V4h12"/></svg></button>
    <button class="iconbtn" data-pb="rename" data-id="${b.id}" title="Renommer"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/></svg></button>
    <button class="iconbtn" data-pb="export" data-id="${b.id}" title="Exporter (.json)"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg></button>
    <button class="iconbtn danger" data-pb="delete" data-id="${b.id}" title="Supprimer"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></footer></article>`;
}
function renderHub(loading) {
  const el = document.getElementById('hub');
  el.innerHTML = `<header class="hub-top"><div class="auth-brand"><span class="logo-sm">${LOGO}</span><b>PlanBiz</b></div><span class="sp"></span>
   ${demo ? `<span class="pill warn">Mode démo : rien n'est enregistré</span><button class="btn pri sm" data-pb="leaveDemo">${user ? 'Quitter la démo' : 'Créer mon compte'}</button>` : sb ? `<span class="muted small hide-sm">${esc(user ? user.email : '')}</span><button class="btn ghost sm" data-pb="logout">Se déconnecter</button>` : '<span class="pill warn">Mode local : données dans ce navigateur</span>'}</header>
  <section class="hub-hero"><div><p class="eyebrow">Mon espace</p><h1>Mes business</h1><p class="lead">Chaque business a son propre business plan, ses chiffres et ses scénarios. Crée-en autant que tu veux.</p></div>
   <div class="row"><button class="btn pri big" data-pb="new">+ Nouveau business</button><label class="btn big" for="hubImport">Importer un fichier</label><input type="file" id="hubImport" accept=".json,.txt,application/json" hidden></div></section>
  ${demo ? '' : `<section class="discover"><div class="disc-t"><b>Découvrir PlanBiz</b><span>Regarde la vidéo d'une minute ou explore un business plan complet, sans toucher à tes données.</span></div><div class="row"><button class="btn" data-pb="video">▶ Voir la vidéo</button><button class="btn" data-pb="demo">Explorer la démo guidée</button></div></section>`}
  <section class="biz-grid">${loading ? '<div class="biz skel"></div><div class="biz skel"></div><div class="biz skel"></div>' : list.length ? list.map(bizCard).join('') : `<div class="empty"><span class="logo-lg">${LOGO}</span><h3>Aucun business pour l'instant</h3><p class="muted">Crée ton premier business plan : questionnaire guidé, import depuis ton IA, ou modèle d'exemple pour découvrir l'outil.</p><button class="btn pri" data-pb="new">Créer mon premier business</button></div>`}</section>
  <footer class="hub-credit"><a href="/legal.html" target="_blank" rel="noopener">Mentions légales et confidentialité</a></footer>`;
}
function newModal() {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  const opts = [['questionnaire', 'Questionnaire express', '15 questions pour un premier BP chiffré en 10 minutes.'], ['importia', 'Importer depuis mon IA', 'Template pour ChatGPT/Claude/Gemini, ou IA intégrée à partir de tes notes.'], ['blank', 'Business vierge', 'Toutes les sections à remplir dans l\'ordre du parcours.'], ['example', 'Modèle d\'exemple', 'SAQYA Tech, startup fictive entièrement remplie, pour découvrir l\'outil.']];
  bg.innerHTML = `<form class="modal" id="newForm"><h2>Nouveau business</h2><p class="muted small" style="margin:4px 0 14px">Donne-lui un nom (modifiable plus tard), puis choisis comment démarrer.</p>
   <div class="f"><label for="nbName">Nom du business</label><input class="in" id="nbName" placeholder="Ex. Dar Atay, salon de thé à Fès" required></div>
   <div class="opts" style="margin-top:14px">${opts.map(([k, t, d], i) => `<label class="opt ${i === 0 ? 'on' : ''}"><input type="radio" name="nbMode" value="${k}" ${i === 0 ? 'checked' : ''} hidden><b>${t}</b><span>${d}</span></label>`).join('')}</div>
   <div class="row" style="justify-content:flex-end;margin-top:18px"><button type="button" class="btn" data-x="no">Annuler</button><button class="btn pri" type="submit">Créer</button></div></form>`;
  document.body.appendChild(bg);
  const f = bg.querySelector('form'); f.querySelector('#nbName').focus();
  f.addEventListener('change', () => f.querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o.querySelector('input').checked)));
  bg.addEventListener('click', e => { if (e.target === bg || e.target.dataset.x === 'no') bg.remove(); });
  f.addEventListener('submit', async e => {
    e.preventDefault(); const mode = f.nbMode.value; let name = f.querySelector('#nbName').value.trim();
    const data = mode === 'example' ? exampleProject() : blankProject();
    if (mode === 'example') name = name || 'SAQYA Tech (modèle)'; else data.id.nom = name;
    if (!name) { f.querySelector('#nbName').focus(); return; }
    bg.remove();
    try { const row = await store.create(name, data); await openBiz(row.id, mode === 'questionnaire' ? 'questionnaire' : mode === 'importia' ? 'importia' : mode === 'example' ? 'tableau' : 'accueil'); }
    catch (err) { toast('Création impossible : ' + (err.message || err)); }
  });
}
async function openBiz(id, startView) {
  show('boot');
  try {
    const row = await store.get(id);
    let data = row.data && row.data.hyp ? row.data : blankProject();
    try { const p = localStorage.getItem('planbiz.pending.' + id); if (p) { data = JSON.parse(p); toast('Modifications non synchronisées récupérées.'); } } catch (e) { }
    S = migrate(data); delete S.summary; current = { id: row.id, name: row.name }; lastSaved = row.updated_at ? new Date(row.updated_at) : null; saveState = 'saved';
    if (!S.id.nom) S.id.nom = row.name;
    recalc(); view = startView || 'accueil';
    show('editor'); render(); window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + view); } catch (e) { }
    try { localStorage.setItem('planbiz.last', id); } catch (e) { }
  } catch (e) { toast('Ouverture impossible : ' + (e.message || e)); openHub(); }
}
function promptBox(title, value, ok) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<form class="modal"><h3 style="margin-bottom:10px">${esc(title)}</h3><input class="in" id="pbPrompt" value="${esc(value)}"><div class="row" style="justify-content:flex-end;margin-top:14px"><button type="button" class="btn" data-x="no">Annuler</button><button class="btn pri" type="submit">Valider</button></div></form>`;
  document.body.appendChild(bg); const inp = bg.querySelector('input'); inp.focus(); inp.select();
  bg.addEventListener('click', e => { if (e.target === bg || e.target.dataset.x === 'no') bg.remove(); });
  bg.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (v) { bg.remove(); ok(v); } });
}

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-auth]'); if (a) { authMode = a.dataset.auth; authMsg = ''; renderAuth(); return; }
  const t = e.target.closest('[data-pb]'); if (!t) {
    const act = e.target.closest('[data-act="printDoc"]'); if (act) printDoc();
    const m = document.querySelector('.menu-pop'); if (m && !e.target.closest('.menu-pop')) m.remove();
    return;
  }
  const k = t.dataset.pb, id = t.dataset.id;
  if (k === 'hub') openHub();
  else if (k === 'new') newModal();
  else if (k === 'open') openBiz(id);
  else if (k === 'logout') { await flush(); await sb.auth.signOut(); }
  else if (k === 'delAccount') {
    const m = document.querySelector('.menu-pop'); if (m) m.remove();
    confirmBox('Supprimer ton compte ? Tous tes business plans seront effacés tout de suite, et ton compte sous 30 jours au plus. Cette action est définitive. Exporte d\'abord tes projets si tu veux les garder.', async () => {
      try {
        await flush(); current = null;
        const rows = await store.list(); for (const b of rows) await store.remove(b.id);
        const { error } = await sb.from('deletion_requests').upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });
        if (error) throw error;
        try { Object.keys(localStorage).filter(x => x.startsWith('planbiz.')).forEach(x => localStorage.removeItem(x)); } catch (e2) { }
        await sb.auth.signOut();
        authMsg = '✓ Tes business plans sont effacés et ta demande de suppression du compte est enregistrée.'; authMode = 'login'; renderAuth();
      } catch (err) { toast('Suppression impossible : ' + (err.message || err)); }
    });
  }
  else if (k === 'demo') { startDemo(); }
  else if (k === 'landing') { renderLanding(); }
  else if (k === 'tour') { const m = document.querySelector('.menu-pop'); if (m) m.remove(); if (window.PBTour) PBTour.start(); }
  else if (k === 'leaveDemo') { leaveDemo('signup'); }
  else if (k === 'video') { if (window.PBTour) PBTour.video(); }
  else if (k === 'menu') {
    const old = document.querySelector('.menu-pop'); if (old) { old.remove(); return; }
    const m = document.createElement('div'); m.className = 'menu-pop';
    m.innerHTML = `<p class="small muted">${esc(demo ? 'Mode démo' : user ? user.email : 'Mode local')}</p><button data-pb="hub">Mes business</button><button data-pb="tour">Visite guidée</button><button data-pb="video">Vidéo de démonstration</button>${demo ? '<button data-pb="leaveDemo">Créer mon compte</button>' : sb ? '<button data-pb="logout">Se déconnecter</button><a class="menu-link" href="/legal.html" target="_blank" rel="noopener">Mentions légales et confidentialité</a><button data-pb="delAccount" class="danger">Supprimer mon compte</button>' : ''}`;
    t.parentElement.appendChild(m);
  }
  else if (k === 'dup') { try { const r = await store.get(id); const d = r.data; d.id = Object.assign({}, d.id, { nom: (d.id.nom || r.name) + ' (copie)' }); await store.create(r.name + ' (copie)', d); openHub(); toast('Business dupliqué.'); } catch (err) { toast('Duplication impossible.'); } }
  else if (k === 'rename') { const b = list.find(x => x.id === id); promptBox('Renommer le business', b ? b.name : '', async v => { try { const r = await store.get(id); r.data.id = Object.assign({}, r.data.id, { nom: v }); await store.update(id, { name: v, data: r.data }); openHub(); } catch (err) { toast('Renommage impossible.'); } }); }
  else if (k === 'export') { try { const r = await store.get(id); dlFn.save({ filename: (r.name || 'business').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').toLowerCase() + '-planbiz.json', data: JSON.stringify(stateToPlanbiz(migrate(r.data)), null, 1) }); } catch (err) { toast('Export impossible.'); } }
  else if (k === 'delete') { const b = list.find(x => x.id === id); confirmBox(`Supprimer définitivement « ${b ? b.name : ''} » et tout son business plan ?`, async () => { try { await store.remove(id); openHub(); toast('Business supprimé.'); } catch (err) { toast('Suppression impossible.'); } }); }
});
document.addEventListener('submit', e => { if (e.target.id === 'authForm') onAuthSubmit(e); });
document.addEventListener('change', async e => {
  if (e.target.id !== 'hubImport' || !e.target.files[0]) return;
  const txt = await e.target.files[0].text();
  try {
    const j = extractJSON(txt); let data, warns = [];
    if (j.hyp && j.id) data = migrate(j); else { const r = planbizToState(j); data = r.state; warns = r.warns; }
    const row = await store.create(data.id.nom || 'Business importé', data);
    await openBiz(row.id, 'tableau'); toast(warns.length ? `Importé avec ${warns.length} point(s) à vérifier.` : 'Business importé.');
  } catch (err) { toast('Fichier non reconnu : choisis un .json PlanBiz ou la réponse de ton IA.'); }
});
window.addEventListener('beforeunload', e => { if (saveTimer || saveState === 'saving') { flush(); e.preventDefault(); e.returnValue = ''; } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) flush(); });

/* ---------- demo ---------- */
async function startDemo() {
  demo = true; store = DemoStore; DemoStore.clear();
  const ex = exampleProject();
  const row = await store.create('SAQYA Tech (démo)', ex);
  await store.create('Dar Atay — salon de thé (démo vierge)', Object.assign(blankProject(), { id: Object.assign(blankProject().id, { nom: 'Dar Atay', secteur: 'Restauration / café / traiteur' }) }));
  await openBiz(row.id, 'tableau');
  setTimeout(() => { if (window.PBTour) PBTour.start(); }, 700);
}
function leaveDemo(mode) { demo = false; store = sb ? SupaStore : LocalStore; DemoStore.clear(); current = null; S = null; if (sb && !user) { authMode = mode || 'signup'; authMsg = ''; renderAuth(); } else openHub(); }

/* ---------- boot ---------- */
document.getElementById('dls').innerHTML = datalists();
async function boot() {
  if (!sb) { user = null; return openHub(); }
  const { data } = await sb.auth.getSession(); user = data.session ? data.session.user : null;
  sb.auth.onAuthStateChange((ev, session) => {
    const was = user; user = session ? session.user : null;
    if (ev === 'PASSWORD_RECOVERY') { promptBox('Choisis un nouveau mot de passe (8 caractères min.)', '', async v => { const { error } = await sb.auth.updateUser({ password: v }); toast(error ? 'Échec : ' + error.message : 'Mot de passe mis à jour.'); }); }
    if (!user && was) { current = null; S = null; if (authMsg) renderAuth(); else renderLanding(); }
    else if (user && !was) openHub();
  });
  if (user) openHub(); else renderLanding();
}
boot();
})();
