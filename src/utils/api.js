export const fetchYouTubeVideos = async (query, maxResults = 5) => {
  const API_KEY = 'AIzaSyBvbISMruUFnVbvRqFSvlLUEFiyxZlwltQ';
  // First, search for videos
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');

  // Then, get video statistics (views)
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  return detailsData.items.map(item => ({
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    views: parseInt(item.statistics.viewCount, 10)
  }));
};