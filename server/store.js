// Persistencia dos leads em disco (arquivo JSONL num volume do Docker).
// Fonte confiavel de verdade: isso e salvo ANTES de tentar mandar o alerta
// de WhatsApp, entao nenhum cadastro se perde mesmo que o CallMeBot falhe.

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || '/data';
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

function ensureDir(){
  if (!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveLead(lead){
  ensureDir();
  const record = Object.assign({}, lead, { recebidoEm: new Date().toISOString() });
  fs.appendFileSync(LEADS_FILE, JSON.stringify(record) + '\n', 'utf8');
  return record;
}

function readLeads(){
  ensureDir();
  if (!fs.existsSync(LEADS_FILE)) return [];
  const raw = fs.readFileSync(LEADS_FILE, 'utf8');
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch(_) { return null; }
    })
    .filter(Boolean);
}

module.exports = { saveLead, readLeads };
