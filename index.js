const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let botWindowPid = null;

app.get('/status', (req, res) => {
  const status = botWindowPid ? 'running' : 'stopped';
  res.json({ status });
});

app.post('/start-bot', (req, res) => {
  if (botWindowPid) {
    return res.json({ message: 'Bot already running' });
  }

  const batFilePath = path.join(__dirname, 'start-bot-temp.bat');
  const nodePath = 'C:\\Program Files\\nodejs\\node.exe';
  const scriptPath = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\index.js';

  // ✅ Write temporary bat file
  const batContent = `@echo off\n"${nodePath}" "${scriptPath}"\npause`;
  fs.writeFileSync(batFilePath, batContent);

  // ✅ Launch new window with bat file
  const child = spawn('cmd.exe', ['/c', 'start', '""', batFilePath], {
    detached: true,
    shell: true
  });

  botWindowPid = child.pid;

  console.log('[✅ BOT STARTED]');
  res.json({ message: 'Bot started' });
});

app.post('/stop-bot', (req, res) => {
  if (!botWindowPid) {
    return res.json({ message: 'No bot process found' });
  }

  try {
    // Windows doesn't kill CMD GUI windows with `kill(pid)`, so we use taskkill
    exec(`taskkill /PID ${botWindowPid} /T /F`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error stopping bot:', error.message);
        return res.status(500).json({ message: 'Failed to stop bot', error: error.message });
      }

      console.log('[🛑 BOT STOPPED]');
      botWindowPid = null;
      res.json({ message: 'Bot stopped' });
    });
  } catch (err) {
    console.error('Stop error:', err.message);
    res.status(500).json({ message: 'Failed to stop bot', error: err.message });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
