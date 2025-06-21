const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/stream/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  res.setHeader('Content-Type', 'audio/webm'); // <- Usa el tipo correcto

  const ytdlpPath = 'C:\\Users\\USER\\AppData\\Roaming\\Python\\Python313\\Scripts\\yt-dlp.exe';
  const ytdlp = spawn(ytdlpPath, ['-f', 'bestaudio', '--no-playlist', '-o', '-', videoUrl]);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on('data', (data) => {
    console.error(`yt-dlp stderr: ${data}`);
  });

  ytdlp.on('error', (err) => {
    console.error('Error al iniciar yt-dlp:', err);
    if (!res.headersSent) res.status(500).send('Error interno al iniciar yt-dlp');
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error(`yt-dlp salió con código ${code}`);
      if (!res.headersSent) res.status(500).send('Error al finalizar yt-dlp');
    }
  });
});

const port = 3001;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
