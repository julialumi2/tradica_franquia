const express = require('express');
const { sendAlert } = require('./notifier');

const app = express();
app.use(express.json());

app.post('/api/notify', async (req, res) => {
  const lead = req.body || {};
  if (!lead.nome || !lead.whatsapp || !lead.email || !lead.cidade){
    return res.status(400).json({ ok: false, error: 'campos obrigatorios ausentes' });
  }

  try{
    await sendAlert(lead);
    res.json({ ok: true });
  }catch(err){
    console.error('Falha ao enviar alerta de WhatsApp:', err.message);
    // Nao derruba o cadastro do lead por causa de uma falha no alerta.
    res.json({ ok: false });
  }
});

app.get('/api/health', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API ouvindo na porta ${port}`));
