const express = require('express');
const cors = require('cors');
const app = express();
 
// Allow requests from any origin (since you're opening the HTML file directly)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
 
// Handle preflight requests
app.options('*', cors());
 
// Increase limit for base64 images
app.use(express.json({ limit: '50mb' }));
 
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
 
// Main AI endpoint
app.post('/generate', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_KEY;
 
    if (!apiKey) {
      return res.status(500).json({ error: { message: 'ANTHROPIC_KEY environment variable not set on server.' } });
    }
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
 
    res.json(data);
 
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: { message: 'Server error: ' + err.message } });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`StudySnap server running on port ${PORT}`));
 