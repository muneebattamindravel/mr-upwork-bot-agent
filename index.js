const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

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

  const batPath = `"C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\start-bot.bat"`;

  // Start the bot in a new CMD window
  exec(`start "${BOT_TITLE}" cmd /k ${batPath}`, (err) => {
    if (err) {
      console.error('[❌ START ERROR]', err.message);
      return res.status(500).json({ message: 'Failed to start bot', error: err.message });
    }

    // Wait 2 seconds to allow window to open
    setTimeout(() => {
      // Use WMIC to get the PID of the CMD with the matching title
      const wmicCommand = `wmic process where "CommandLine like '%${BOT_TITLE}%'" get ProcessId`;

      exec(wmicCommand, (err, stdout) => {
        if (err) {
          console.error('[❌ PID DETECTION FAILED]', err.message);
          return res.status(500).json({ message: 'Bot started, but PID not found' });
        }

        const match = stdout.match(/(\d+)/g);
        if (match && match.length > 0) {
          botWindowPid = parseInt(match[0]);
          console.log(`[✅ BOT STARTED] PID: ${botWindowPid}`);
          res.json({ message: 'Bot started successfully', pid: botWindowPid });
        } else {
          console.warn('[⚠️ BOT STARTED but PID not detected]');
          res.json({ message: 'Bot started, but PID not detected' });
        }
      });
    }, 2000);
  });
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
