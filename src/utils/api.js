import parseISO8601Duration from './parse.js';
const cache = {};

export const fetchYouTubeVideos = async (query, maxResults=25) => {
  const cacheKey = `${query}_${maxResults}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const API_KEY = 'AIzaSyBqOBij-KWOWX3Jts5KxZ76nLpLWeKepyU';
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  // Handle API errors
  if (!searchData.items) {
    throw new Error(searchData.error?.message || 'YouTube API error');
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  // FIX: Add contentDetails to the part list
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  if (!detailsData.items) {
    throw new Error(detailsData.error?.message || 'YouTube API error');
  }

 const result = detailsData.items
  .map(item => {
    const durationHours = parseISO8601Duration(item.contentDetails.duration);
    return {
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      views: parseInt(item.statistics.viewCount, 10),
      durationHours,
      durationSeconds: durationHours * 3600 // Add this property for filtering
    };
  })
  .filter(
    v =>
      v.durationSeconds >= 600 && // At least 1 minute
      !/shorts?/i.test(v.title)
  );

// Place this line right here:
cache[cacheKey] = result;

return result;
};

export const fetchCourseraCourses = async (query) => {
  return [
    {
      id: 1,
      name: `Coursera courses for "${query}"`,
      link: `https://www.coursera.org/search?query=${encodeURIComponent(query)}`
    }
  ];
};  
