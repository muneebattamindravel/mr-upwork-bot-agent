const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let botProcess = null;

app.get('/status', (req, res) => {
  const status = botProcess ? 'running' : 'stopped';
  res.json({ status });
});

app.post('/start-bot', (req, res) => {
  if (botProcess) {
    return res.json({ message: 'Bot already running' });
  }

  const botPath = `"C:\\Program Files\\nodejs\\node.exe"`; // or just 'node' if globally accessible
  const scriptPath = `"C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\index.js"`;

  // Spawning a new CMD with the bot script
  botProcess = spawn('cmd.exe', ['/c', 'start', '""', 'cmd', '/k', `${botPath} ${scriptPath}`], {
    detached: true,
    shell: true
  });

  console.log('[✅ BOT STARTED]');
  res.json({ message: 'Bot started' });
});

app.post('/stop-bot', (req, res) => {
  if (!botProcess) {
    return res.json({ message: 'No bot process found' });
  }

  try {
    process.kill(-botProcess.pid); // negative PID for Windows group termination
    botProcess = null;
    console.log('[🛑 BOT STOPPED]');
    res.json({ message: 'Bot stopped' });
  } catch (err) {
    console.error('Error stopping bot:', err);
    res.status(500).json({ message: 'Failed to stop bot', error: err.message });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
