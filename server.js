const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/', (req, res) => {
  res.send('Servidor backend de KayMusic Ultra activo');
});

app.get('/test', (req, res) => {
  res.send('Servidor backend de KayMusic Ultra funcionando correctamente');
});

app.get('/stream/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Accept-Ranges', 'bytes');

  try {
    const info = await ytdl.getInfo(videoUrl, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Cookie': 'YOUR_YOUTUBE_COOKIE_HERE' // Opcional, ver nota abajo
        }
      },
      lang: 'en', // Forzar idioma para evitar bloqueos regionales
    });
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
    if (!format) return res.status(404).send('Audio no disponible');
    console.log('URL del formato:', format.url.substring(0, 50) + '...');
    ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    }).pipe(res)
      .on('error', (err) => {
        console.error('Error en ytdl-core:', err.message, 'Video ID:', videoId);
        if (!res.headersSent) res.status(500).send('Error al transmitir audio: ' + err.message);
      });
  } catch (error) {
    console.error('Error en la ejecución:', error.message, 'Video ID:', videoId);
    res.status(500).send('Error al obtener el audio: ' + error.message);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));