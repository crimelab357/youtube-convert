const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { Handler } = require('@netlify/functions');

ffmpeg.setFfmpegPath(ffmpegPath);

const handler = async (event, context) => {
  try {
    const { url, format, quality } = event.queryStringParameters;
    
    if (!url || !ytdl.validateURL(url)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid YouTube URL' })
      };
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    if (format === 'mp3') {
      // For MP3 conversion
      const bitrate = quality === 'high' ? '320k' : quality === 'medium' ? '192k' : '128k';
      
      // This would need to be adapted for Netlify Functions
      // Since we can't stream directly in serverless functions,
      // we'll return a URL to download from
      return {
        statusCode: 200,
        body: JSON.stringify({
          downloadUrl: `/.netlify/functions/download?url=${encodeURIComponent(url)}&format=mp3&quality=${quality}`,
          title: `${title}.mp3`,
          info: {
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url
          }
        })
      };
    } else {
      // For MP4
      let filter;
      if (quality === '1080') filter = '137+140';
      else if (quality === '720') filter = '22';
      else if (quality === '480') filter = '135+140';
      else filter = '18'; // 360p
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          downloadUrl: `/.netlify/functions/download?url=${encodeURIComponent(url)}&format=mp4&quality=${quality}`,
          title: `${title}.mp4`,
          info: {
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url
          }
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

module.exports = { handler };