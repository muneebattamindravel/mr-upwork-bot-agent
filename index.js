const express = require('express');
const app = express();
const { exec } = require('child_process');
const cors = require('cors');

app.use(cors());
app.use(express.json());

let botStarted = false;

app.post('/start-bot', (req, res) => {
  if (botStarted) return res.send('Bot already started');

  exec(`start "MR-BOT-WINDOW" cmd /k "C:\\Users\\Administrator\\Desktop\\mr-upwork-bot-scrapper\\start-bot.bat"`, (error) => {
    if (error) {
      console.error('❌ Failed to start bot:', error);
      return res.status(500).send('Failed to start bot');
    }

    console.log('✅ Bot window launched');
    botStarted = true;
    res.send('Bot started');
  });
});

app.post('/stop-bot', (req, res) => {
  exec(`taskkill /FI "WINDOWTITLE eq MR-BOT-WINDOW" /F`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to stop bot:', error.message);
      return res.status(500).send('Failed to stop bot');
    }

    console.log('✅ Bot window terminated');
    botStarted = false;
    res.send('Bot stopped');
  });
});

app.get('/status', (req, res) => {
  res.send('Bot agent is running');
});

app.listen(4001, () => {
  console.log('🤖 Bot agent listening at http://localhost:4001');
});
