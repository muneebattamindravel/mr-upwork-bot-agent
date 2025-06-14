const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let botProcess = null;
let botWindowPid = null;
const botDir = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper';
const batFilePath = path.join(__dirname, 'start-bot-temp.bat');

app.get('/status', (req, res) => {
  const status = botProcess ? 'running' : 'stopped';
  res.json({ status });
});

app.post('/start-bot', (req, res) => {
  if (botProcess) {
    return res.json({ message: 'Bot already running' });
  }

  const batContent = `@echo off\ncd /d "${botDir}"\nnpm start\npause`;
  fs.writeFileSync(batFilePath, batContent);

  // Start a new cmd.exe window to run the .bat file
  const child = spawn('cmd.exe', ['/c', 'start', '"bot-window"', batFilePath], {
    detached: true,
    shell: true,
  });

  botProcess = child;
  botWindowPid = child.pid;

  console.log(`[✅ BOT STARTED] PID: ${botWindowPid}`);
  res.json({ message: 'Bot started' });
});

app.post('/stop-bot', (req, res) => {
  if (!botWindowPid) {
    return res.status(400).json({ message: 'No running bot to stop' });
  }

  // Kill window by title (works only if we named it in /start)
  exec(`taskkill /FI "WINDOWTITLE eq bot-window*" /F`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error stopping bot:', err.message);
      return res.status(500).json({ message: 'Failed to stop bot', error: err.message });
    }

    console.log('[🛑 BOT STOPPED]');
    botProcess = null;
    botWindowPid = null;
    res.json({ message: 'Bot stopped' });
  });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
