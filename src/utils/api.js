const cache = {};

export const fetchYouTubeVideos = async (query, maxResults = 5) => {
  const cacheKey = `${query}_${maxResults}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const API_KEY = 'AIzaSyBE3EX69k4-pBdQiBlqcgh6giK6lKcWes4';
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  // Handle API errors
  if (!searchData.items) {
    throw new Error(searchData.error?.message || 'YouTube API error');
  }

  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  if (!detailsData.items) {
    throw new Error(detailsData.error?.message || 'YouTube API error');
  }

  const result = detailsData.items.map(item => ({
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    views: parseInt(item.statistics.viewCount, 10)
  }));

  cache[cacheKey] = result;
  return result;
};