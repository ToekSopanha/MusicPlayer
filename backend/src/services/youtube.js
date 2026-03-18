import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

const getApiKey = () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YouTube API key not configured');
  return apiKey;
};

export const searchVideos = async (query, maxResults = 20) => {
  try {
    const response = await axios.get(`${YOUTUBE_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        key: getApiKey()
      }
    });

    const videoIds = response.data.items.map(item => item.id.videoId).join(',');

    const detailsResponse = await axios.get(`${YOUTUBE_BASE}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: getApiKey()
      }
    });

    const detailsMap = {};
    detailsResponse.data.items.forEach(item => {
      detailsMap[item.id] = {
        duration: item.contentDetails?.duration,
        viewCount: item.statistics?.viewCount,
        likeCount: item.statistics?.likeCount
      };
    });

    return response.data.items.map(item => {
      const videoId = item.id.videoId;
      const details = detailsMap[videoId] || {};
      return {
        id: videoId,
        videoId: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        publishedAt: item.snippet.publishedAt,
        duration: details.duration,
        viewCount: details.viewCount,
        stream_url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    });
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    throw new Error('Failed to search YouTube');
  }
};

export const getVideoById = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_BASE}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: getApiKey()
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const item = response.data.items[0];
    return {
      id: item.id,
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration,
      viewCount: item.statistics?.viewCount,
      likeCount: item.statistics?.likeCount,
      stream_url: `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id}`
    };
  } catch (error) {
    console.error('YouTube video error:', error.message);
    throw new Error('Failed to get video');
  }
};

export const getPopularVideos = async (maxResults = 20) => {
  try {
    const response = await axios.get(`${YOUTUBE_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        videoCategoryId: '10',
        maxResults,
        key: getApiKey()
      }
    });

    return response.data.items.map(item => ({
      id: item.id,
      videoId: item.id,
      title: item.snippet.title,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount,
      stream_url: `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id}`
    }));
  } catch (error) {
    console.error('YouTube popular error:', error.message);
    throw new Error('Failed to get popular videos');
  }
};

function parseDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export default { searchVideos, getVideoById, getPopularVideos, parseDuration };
