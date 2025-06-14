const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

let botWindowPid = null;
const BOT_TITLE = 'UPWORK_SCRAPER_BOT_WINDOW'; // must match the .bat

app.get('/status', (req, res) => {
  res.json({ status: botWindowPid ? 'running' : 'stopped', pid: botWindowPid });
});

app.post('/start-bot', (req, res) => {
  if (botWindowPid) {
    return res.json({ message: 'Bot already running' });
  }

  const batPath = 'C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\start-bot.bat';
  const BOT_TITLE = 'UPWORK_SCRAPER_BOT_WINDOW';

  // 🔄 Start bot in a new CMD window via spawn (non-blocking)
  spawn('cmd.exe', ['/c', 'start', `"${BOT_TITLE}"`, 'cmd', '/k', batPath], {
    detached: true,
    shell: true,
  });

  console.log('[🟡 BOT LAUNCHING...]');

  // ✅ Respond immediately to client to avoid hang
  

  // ⏳ In background, wait and detect the real PID
  setTimeout(() => {
    const wmicCommand = `wmic process where "CommandLine like '%${BOT_TITLE}%'" get ProcessId`;

    exec(wmicCommand, (err, stdout) => {
      if (err) return console.error('[❌ PID DETECTION FAILED]', err.message);

      const match = stdout.match(/(\d+)/g);
      if (match && match.length > 0) {
        botWindowPid = parseInt(match[0]);
        console.log(`[✅ BOT STARTED] PID: ${botWindowPid}`);
        res.json({ message: `[✅ BOT STARTED] PID: ${botWindowPid}` });
      } else {
        console.warn('[⚠️ BOT STARTED but PID not found]');
        res.json({ message: `[⚠️ BOT STARTED but PID not found]` });
      }
    });
  }, 2000); // Wait 2s for window to open
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
    res.json({ message: 'Bot stopped successfully' });
  });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🤖 Bot agent listening at http://localhost:${PORT}`);
});
