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
        body: 'Invalid YouTube URL'
      };
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    if (format === 'mp3') {
      const bitrate = quality === 'high' ? '320k' : quality === 'medium' ? '192k' : '128k';
      
      // This is a simplified version - in production you'd need to handle streaming
      return {
        statusCode: 302,
        headers: {
          'Location': ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }).url
        }
      };
    } else {
      // For MP4
      let filter;
      if (quality === '1080') filter = '137+140';
      else if (quality === '720') filter = '22';
      else if (quality === '480') filter = '135+140';
      else filter = '18'; // 360p
      
      return {
        statusCode: 302,
        headers: {
          'Location': ytdl.chooseFormat(info.formats, { filter: format => format.itag === filter }).url
        }
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }
};

module.exports = { handler };