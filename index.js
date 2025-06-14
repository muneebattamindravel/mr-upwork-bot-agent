const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 4001;

let botProcess = null;

app.use(express.json());

app.post('/start-bot', (req, res) => {
  if (botProcess) return res.status(400).send('Bot already running');

  const botPath = 'C:\\path\\to\\your\\bot'; // ⬅️ UPDATE THIS PATH

  botProcess = exec('npm start', { cwd: botPath }, (err) => {
    console.log('[Bot] Process exited');
    botProcess = null;
    if (err) console.error('[Bot Error]', err.message);
  });

  console.log('[Bot] Started');
  res.send('✅ Bot started');
});

app.post('/stop-bot', (req, res) => {
  if (!botProcess) return res.status(400).send('Bot not running');

  botProcess.kill();
  botProcess = null;
  console.log('[Bot] Stopped');
  res.send('🛑 Bot stopped');
});

app.get('/status', (req, res) => {
  res.json({ running: !!botProcess });
});

app.listen(port, () => {
  console.log(`🧠 Bot Agent running on http://localhost:${port}`);
});
