const express = require('express');
const ytdl = require('yt-dlp-exec');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/test', (req, res) => {
  res.send('Servidor backend de KayMusic Ultra funcionando correctamente');
});

app.get('/stream/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  res.setHeader('Content-Type', 'audio/webm');

  try {
    const process = ytdl.exec([
      '-f', 'bestaudio',
      '--no-playlist',
      '-o', '-',
      videoUrl
    ]);

    process.stdout.pipe(res);

    process.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    process.on('error', (err) => {
      console.error('Error al iniciar yt-dlp:', err);
      if (!res.headersSent) res.status(500).send('Error interno al iniciar yt-dlp');
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp salió con código ${code}`);
        if (!res.headersSent) res.status(500).send('Error al finalizar yt-dlp');
      }
    });
  } catch (err) {
    console.error('Error en la ejecución:', err);
    if (!res.headersSent) res.status(500).send('Error al procesar la solicitud');
  }
});

const port = process.env.PORT || 3001; // Usa el puerto de Render
app.listen(port, () => console.log(`Servidor en puerto ${port}`));