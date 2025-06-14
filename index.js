const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');

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

  const botPath = `"C:\\Program Files\\nodejs\\node.exe"`; // wrap in quotes
  const scriptPath = `"C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\index.js"`; // wrap in quotes

  // ✅ Start a new CMD window that stays open with bot logs
  const child = spawn(
    'cmd.exe',
    ['/c', 'start', '""', 'cmd', '/k', `${botPath} ${scriptPath}`],
    {
      detached: true,
      shell: true
    }
  );

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
