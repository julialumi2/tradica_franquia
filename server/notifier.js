// Ponto único pra disparar o alerta de WhatsApp.
// Troca de provedor (CallMeBot -> WhatsApp Business Cloud API) fica isolada aqui.

function buildMessage(lead){
  const lines = [
    'Novo cadastro na fila - Tradica',
    `Nome: ${lead.nome}`,
    `WhatsApp: ${lead.whatsapp}`,
    `Email: ${lead.email}`,
    `Cidade: ${lead.cidade}`,
    lead.capital ? `Capital: ${lead.capital}` : null,
    lead.experiencia ? `Experiencia: ${lead.experiencia}` : null,
    lead.mensagem ? `Mensagem: ${lead.mensagem}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

async function sendViaCallMeBot(text){
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey){
    throw new Error('CALLMEBOT_PHONE / CALLMEBOT_APIKEY nao configurados');
  }
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok){
    throw new Error(`CallMeBot respondeu ${res.status}: ${body}`);
  }
  return body;
}

// Quando migrar pra API oficial (WhatsApp Business Cloud API), implementa essa
// funcao chamando graph.facebook.com/.../messages com o template aprovado,
// e troca a chamada dentro de sendAlert() abaixo.
async function sendViaOfficialApi(text){
  throw new Error('API oficial ainda nao configurada');
}

async function sendAlert(lead){
  const text = buildMessage(lead);
  const provider = process.env.WHATSAPP_PROVIDER || 'callmebot';
  if (provider === 'official'){
    return sendViaOfficialApi(text);
  }
  return sendViaCallMeBot(text);
}

module.exports = { sendAlert, buildMessage };
