const express = require('express');
const { spawn, exec } = require('child_process');
const path = require('path');

const app = express();
const port = 4001;

let botWindowProcess = null;

const BOT_PATH = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper';

app.use(express.json());

app.post('/start-bot', (req, res) => {
  if (botWindowProcess) {
    return res.status(400).json({ success: false, message: 'Bot is already running' });
  }

  const startCommand = `start "Upwork Bot" cmd /k "cd /d ${BOT_PATH} && npm start"`;

  botWindowProcess = exec(startCommand, (error) => {
    if (error) {
      console.error('❌ Failed to start bot:', error);
      return res.status(500).json({ success: false, message: 'Failed to start bot' });
    }
  });

  return res.json({ success: true, message: '✅ Bot launched in new window' });
});

app.post('/stop-bot', (req, res) => {
  // Force kill by window title
  const stopCommand = `taskkill /FI "WINDOWTITLE eq Upwork Bot" /T /F`;

  exec(stopCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to stop bot:', stderr);
      return res.status(500).json({ success: false, message: 'Failed to stop bot' });
    }
    botWindowProcess = null;
    return res.json({ success: true, message: '🛑 Bot stopped successfully' });
  });
});

app.get('/status', (req, res) => {
  res.json({ running: !!botWindowProcess });
});

app.listen(port, () => {
  console.log(`🤖 Bot agent running at http://localhost:${port}`);
});
