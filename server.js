const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor backend de KayMusic Ultra activo');
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('Servidor backend de KayMusic Ultra funcionando correctamente');
});

// Ruta de streaming de audio
app.get('/stream/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl.getInfo(videoUrl);
    const audioFormats = info.formats.filter(f => f.mimeType.includes('audio'));
    console.log('Formatos disponibles:', JSON.stringify(audioFormats.map(f => ({ mimeType: f.mimeType, quality: f.qualityLabel, url: f.url.substring(0, 50) + '...' })), null, 2));

    const format = ytdl.chooseFormat(audioFormats, { filter: 'audioonly', quality: 'highestaudio' });
    if (!format) {
      return res.status(404).send('Audio no disponible');
    }

    // Configurar encabezados
    const contentType = format.mimeType || 'audio/mpeg'; // Prueba audio/mpeg o audio/webm
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Accept-Ranges', 'bytes');

    console.log('Formato seleccionado:', { mimeType: contentType, url: format.url.substring(0, 50) + '...' });

    // Stream del audio con manejo de errores
    const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
    stream.on('info', (info, format) => {
      console.log('Info del stream:', { mimeType: format.mimeType, bitrate: format.bitrate });
    });
    stream.pipe(res).on('error', (err) => {
      console.error('Error en el stream:', err.message);
      if (!res.headersSent) res.status(500).send('Error al transmitir audio: ' + err.message);
    });
  } catch (error) {
    console.error('Error en la ejecución:', error.message);
    res.status(500).send('Error al obtener el audio: ' + error.message);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));