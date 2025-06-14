const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_WINDOW_TITLE = 'UpworkScraperBot';
let botStarted = false;

app.get('/status', (req, res) => {
  res.json({ status: botStarted ? 'running' : 'stopped' });
});

app.post('/start-bot', (req, res) => {
  if (botStarted) {
    return res.json({ message: 'Bot already running' });
  }

  const workingDir = `"C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper"`;
  const batCommand = `start "${BOT_WINDOW_TITLE}" cmd /k "cd /d ${workingDir} && npm start"`;

  exec(batCommand, (error) => {
    if (error) {
      console.error('[❌ BOT START ERROR]', error.message);
      return res.status(500).json({ message: 'Failed to start bot', error: error.message });
    }

    console.log('[✅ BOT STARTED]');
    botStarted = true;
    res.json({ message: 'Bot started successfully' });
  });
});

app.post('/stop-bot', (req, res) => {
  if (!botStarted) {
    return res.json({ message: 'Bot not running' });
  }

  const killCommand = `taskkill /FI "WINDOWTITLE eq ${BOT_WINDOW_TITLE}" /T /F`;

  exec(killCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('[❌ Failed to kill bot process]', error.message);
      return res.status(500).json({ message: 'Failed to stop bot', error: error.message });
    }

    console.log('[🛑 BOT STOPPED]');
    botStarted = false;
    res.json({ message: 'Bot stopped successfully' });
  });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
