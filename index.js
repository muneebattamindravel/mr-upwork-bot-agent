const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let botWindowPid = null;
let batFilePath = path.join(__dirname, 'start-bot-temp.bat');
const botDir = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper';

app.get('/status', (req, res) => {
  const status = botWindowPid ? 'running' : 'stopped';
  res.json({ status });
});

app.post('/start-bot', (req, res) => {
  if (botWindowPid) {
    return res.json({ message: 'Bot already running' });
  }

  // Create a .bat file that runs npm start in the bot directory
  const batContent = `@echo off\ncd /d "${botDir}"\nnpm start\npause`;
  fs.writeFileSync(batFilePath, batContent);

  // Spawn a new cmd window using the bat file
  const child = spawn('cmd.exe', ['/c', 'start', '""', batFilePath], {
    detached: true,
    shell: true,
  });

  botWindowPid = child.pid;
  console.log('[✅ BOT STARTED]');
  res.json({ message: 'Bot started' });
});

app.post('/stop-bot', (req, res) => {
  if (!botWindowPid) {
    return res.json({ message: 'No bot process found' });
  }

  // Try to close all cmd windows running the scraper by name (npm.exe or node.exe)
  exec('taskkill /F /IM node.exe /T', (err, stdout, stderr) => {
    if (err) {
      console.error('Error stopping bot:', err.message);
      return res.status(500).json({ message: 'Failed to stop bot', error: err.message });
    }

    console.log('[🛑 BOT STOPPED]');
    botWindowPid = null;
    res.json({ message: 'Bot stopped' });
  });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
