const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/debug', (req, res) => {
  const key = process.env.OPENROUTER_KEY;
  res.json({
    keySet: !!key,
    keyPrefix: key ? key.substring(0, 8) + '...' : 'NOT SET'
  });
});

app.post('/generate', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) return res.status(500).json({ error: { message: 'OPENROUTER_KEY not set.' } });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://studysnap.netlify.app',
        'X-Title': 'StudySnap'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash:free',
        max_tokens: req.body.max_tokens || 4000,
        messages: req.body.messages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({
      content: [{ type: 'text', text: data.choices?.[0]?.message?.content || '' }]
    });

  } catch (err) {
    res.status(500).json({ error: { message: 'Server error: ' + err.message } });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('StudySnap server running on port 3000'));
