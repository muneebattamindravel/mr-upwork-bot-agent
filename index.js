const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

let botWindowPid = null;
const BOT_TITLE = 'UPWORK_SCRAPER_BOT_WINDOW';
const BAT_PATH = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\start-bot.bat';

app.get('/status', (req, res) => {
  res.json({ status: botWindowPid ? 'running' : 'stopped', pid: botWindowPid });
});

app.post('/start-bot', (req, res) => {
  if (botWindowPid) {
    return res.json({ message: 'Bot already running', pid: botWindowPid });
  }

  // 🔄 Start bot in new CMD window
  spawn('cmd.exe', ['/c', 'start', `"${BOT_TITLE}"`, 'cmd', '/k', BAT_PATH], {
    detached: true,
    shell: true,
  });

  console.log('[🟡 BOT LAUNCHING...]');

  // ⏳ Detect the CMD process via WMIC after a short delay
  setTimeout(() => {
    const wmicCommand = `wmic process where "CommandLine like '%${BOT_TITLE}%'" get ProcessId`;

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
  }, 2000);
});

app.post('/stop-bot', (req, res) => {
  if (!botWindowPid) {
    return res.json({ message: 'Bot is not running' });
  }

  const killCommand = `taskkill /PID ${botWindowPid} /T /F`;

  exec(killCommand, (err, stdout, stderr) => {
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
