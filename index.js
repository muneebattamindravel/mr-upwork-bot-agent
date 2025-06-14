const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 4001;

let botProcess = null;

app.use(express.json());

app.post('/start-bot', (req, res) => {
  if (botProcess) {
    return res.status(400).json({ success: false, message: 'Bot is already running' });
  }

  const botDirectory = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper';

  botProcess = spawn('node', ['index.js'], {
    cwd: botDirectory,
    shell: true,
    detached: true,
    stdio: 'ignore', // use 'inherit' if you want to see logs in terminal
  });

  botProcess.unref(); // so it runs independently of parent
  res.json({ success: true, message: '✅ Bot started' });
});

app.post('/stop-bot', (req, res) => {
  if (!botProcess) {
    return res.status(400).json({ success: false, message: 'Bot is not running' });
  }

  process.kill(-botProcess.pid); // kill entire process group
  botProcess = null;
  res.json({ success: true, message: '🛑 Bot stopped' });
});

app.get('/status', (req, res) => {
  res.json({ running: !!botProcess });
});

app.listen(port, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${port}`);
});
