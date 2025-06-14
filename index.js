const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// ✅ Load .env from scraper folder
dotenv.config({
  path: path.join('C:', 'Users', 'Administrator', 'Desktop', 'mr-upwork-bot-scrapper', '.env'),
});

const app = express();
app.use(cors());
app.use(express.json());

let botWindowPid = null;

const BOT_ID = process.env.BOT_ID;
const BAT_PATH = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\start-bot.bat';

if (!BOT_ID) {
  console.error('❌ BOT_ID not found in .env. Exiting...');
  process.exit(1);
}

console.log(`🤖 Loaded BOT_ID: ${BOT_ID}`);

app.get('/status', (req, res) => {
  res.json({ status: botWindowPid ? 'running' : 'stopped', pid: botWindowPid });
});

app.post('/start-bot', (req, res) => {
  if (botWindowPid) {
    return res.json({ message: 'Bot already running', pid: botWindowPid });
  }

  spawn('cmd.exe', ['/c', 'start', '', 'cmd', '/k', BAT_PATH], {
    detached: true,
    shell: true,
  });

  console.log('[🟡 BOT LAUNCHING...]');

  setTimeout(() => {
    const wmicCommand = `wmic process where "CommandLine like '%BOT_ID=${BOT_ID}%'" get ProcessId`;

    exec(wmicCommand, (err, stdout) => {
      if (err) {
        console.error('[❌ PID DETECTION FAILED]', err.message);
        return res.status(500).json({ message: 'Failed to detect PID', error: err.message });
      }

      const match = stdout.match(/(\d+)/g);
      if (match && match.length > 0) {
        botWindowPid = parseInt(match[0]);
        console.log(`[✅ BOT STARTED] PID: ${botWindowPid}`);
        res.json({ message: `✅ Bot started`, pid: botWindowPid });
      } else {
        console.warn('[⚠️ BOT STARTED but PID not found]');
        res.json({ message: '⚠️ Bot started, but PID not found' });
      }
    });
  }, 2500);
});

app.post('/stop-bot', (req, res) => {
  if (!botWindowPid) {
    return res.json({ message: 'Bot is not running' });
  }

  const killCommand = `taskkill /PID ${botWindowPid} /T /F`;

  exec(killCommand, (err) => {
    if (err) {
      console.error('[❌ STOP ERROR]', err.message);
      return res.status(500).json({ message: 'Failed to stop bot', error: err.message });
    }

    console.log(`[🛑 BOT STOPPED] PID: ${botWindowPid}`);
    botWindowPid = null;
    res.json({ message: '✅ Bot stopped successfully' });
  });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
