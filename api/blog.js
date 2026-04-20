// Serverless function to proxy requests to the Google Apps Script blog backend.
// This allows Googlebot to see the content because it's served from the same domain.

export default async function handler(req, res) {
  const BLOG_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxEzjn6GZ9JD9XH32zny1hgKgNO9anjIrNBMjG-gmLobMSMi0EsoQg3wjRW0M4792ejlA/exec';
  const action = req.query.action || 'getPosts';

  try {
    const response = await fetch(`${BLOG_BACKEND_URL}?action=${action}`);
    const data = await response.json();
    
    // Set headers for caching and CORS (if needed)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts from backend' });
  }
}
