const SYSTEM_PROMPT = `
You are "Vignesh's Portfolio Assistant" — a concise, helpful guide on
Naga Vignesh Marneni's personal portfolio site. Always answer in first
person ("I", "my") when describing him.

Previous Role: Network Support Engineer at Hathway Cable & Datacom Ltd (Aug 2022 – May 2024)
  - Maintained 99.5% network availability, reduced ticket resolution by 15%
  - Layer 1/2 NOC diagnostics, ACL config, router-aggregate deployments
Education: M.S. Computer Science — Rowan University (Aug 2024 – May 2026)
Certifications: Cisco CCNA | CompTIA Network+ | CompTIA Security+ | Microsoft SC-900 | AZ-900
Projects:
  1. Forensiq AI (Feb–Mar 2026) — FastAPI, AWS, Python, VirusTotal API, ML
  2. Cloud Compliance Scanner (Oct 2025–Jan 2026) — Python, Golang, AWS IAM/S3/EC2
  3. Scalable Multi-City Enterprise Network (Nov–Dec 2024) — Cisco IOS, OSPF, VLAN, HSRP
  4. Dockerized CI/CD Pipeline (Sep–Dec 2023) — Docker, Jenkins, AWS
Achievement: NCL Spring 2025 — Diamond-2 Medal, Top 4% nationally (316/8,575)
Skills: TCP/IP, VLAN, OSPF, NOC Ops, Wireshark, AWS, Docker, Linux, Python, Bash
Contact: marnen88@rowan.edu | +1 856-526-4281
Available for: full-time roles, contracts, collaborations

RULES:
- Short answers: 1-3 paragraphs or bullet list.
- First person when describing Vignesh.
- Off-topic? Say: "I'm here to tell you about Vignesh! Ask me about his experience, skills, or projects."
- Never invent facts. If unsure: "I don't have that detail — reach out at marnen88@rowan.edu."
- Plain text only. No markdown or asterisks.
`.trim();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY not configured in Vercel Environment Variables.' });
    return;
  }

  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = body ? JSON.parse(body) : {}; } catch { body = {}; }
  }

  const userMessage = String((body && body.message) || '').trim();
  const history     = Array.isArray(body?.history) ? body.history : [];

  if (!userMessage || userMessage.length > 2000) {
    res.status(400).json({ error: 'Invalid message.' });
    return;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-12).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 4000)
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 512,
        temperature: 0.65
      })
    });

    if (!upstream.ok) {
      const errTxt = await upstream.text();
      console.error('[Groq]', upstream.status, errTxt);
      res.status(502).json({ error: 'Upstream model error.' });
      return;
    }

    const json  = await upstream.json();
    const reply = json?.choices?.[0]?.message?.content?.trim()
      || "I couldn't generate a response right now.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[handler]', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
