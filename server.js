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
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
    if (!format) return res.status(404).send('Audio no disponible');
    console.log('URL del formato:', format.url.substring(0, 50) + '...');
    ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(res)
      .on('error', (err) => {
        console.error('Error en ytdl-core:', err);
        if (!res.headersSent) res.status(500).send('Error al transmitir audio');
      });
  } catch (error) {
    console.error('Error en la ejecución:', error);
    res.status(500).send('Error al obtener el audio');
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));