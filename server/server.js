const express = require('express');
const { sendAlert } = require('./notifier');
const { saveLead, readLeads } = require('./store');

const app = express();
app.use(express.json());

app.post('/api/notify', async (req, res) => {
  const lead = req.body || {};
  if (!lead.nome || !lead.whatsapp || !lead.email || !lead.cidade){
    return res.status(400).json({ ok: false, error: 'campos obrigatorios ausentes' });
  }

  // Salva primeiro: isso nunca deve se perder, independente do WhatsApp funcionar.
  try{
    saveLead(lead);
  }catch(err){
    console.error('Falha ao salvar lead em disco:', err.message);
  }

  try{
    await sendAlert(lead);
    res.json({ ok: true });
  }catch(err){
    console.error('Falha ao enviar alerta de WhatsApp:', err.message);
    // O lead ja foi salvo acima, entao a falha aqui e so do aviso, nao do cadastro.
    res.json({ ok: false });
  }
});

function requireAuth(req, res, next){
  const password = process.env.LEADS_PASSWORD;
  if (!password){
    return res.status(503).send('LEADS_PASSWORD nao configurada no servidor');
  }
  const auth = req.headers.authorization || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded){
    res.set('WWW-Authenticate', 'Basic realm="leads"');
    return res.status(401).send('Autenticacao necessaria');
  }
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separatorIdx = decoded.indexOf(':');
  const pass = separatorIdx === -1 ? decoded : decoded.slice(separatorIdx + 1);
  if (pass !== password){
    res.set('WWW-Authenticate', 'Basic realm="leads"');
    return res.status(401).send('Senha incorreta');
  }
  next();
}

app.get('/api/leads', requireAuth, (req, res) => {
  const leads = readLeads();

  if (req.query.format === 'csv'){
    const cols = ['recebidoEm', 'nome', 'whatsapp', 'email', 'cidade', 'capital', 'experiencia', 'mensagem'];
    const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const lines = [cols.join(',')].concat(
      leads.map((l) => cols.map((c) => escape(l[c])).join(','))
    );
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.send(lines.join('\n'));
  }

  res.json(leads);
});

app.get('/api/health', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API ouvindo na porta ${port}`));
