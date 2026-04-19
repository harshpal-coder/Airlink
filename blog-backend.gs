/* 
  AIRLINK BLOG BACKEND v1.0
  -------------------------
  - Syncs Blogger posts via JSON feed
  - Provides a clean API for the frontend
*/

// REPLACE THIS WITH YOUR ACTUAL BLOGGER BLOG ID
// You can find it in your Blogger dashboard URL: https://www.blogger.com/blog/posts/YOUR_BLOG_ID
const BLOG_ID = "3435707311722665171"; 

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getPosts') {
    return getBlogPosts();
  }
  
  return ContentService.createTextOutput("AirLink Blog Backend Active");
}

/**
 * Fetches blog posts from Blogger JSON feed
 */
function getBlogPosts() {
  const url = `https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=50`;
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Could not fetch blog posts. Please check if the Blog ID is correct and the blog is public.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(response.getContentText());
    const entries = data.feed.entry || [];
    
    const formattedPosts = entries.map(entry => {
      // Find the first image in the content if there's no media:thumbnail
      let thumbnail = "";
      if (entry['media$thumbnail']) {
        thumbnail = entry['media$thumbnail'].url.replace('s72-c', 's1600'); // Get high res
      } else {
        const imgRegex = /<img[^>]+src="([^">]+)"/;
        const match = entry.content.$t.match(imgRegex);
        if (match) thumbnail = match[1];
      }

      return {
        id: entry.id.$t.split('post-').pop(),
        title: entry.title.$t,
        published: entry.published.$t,
        updated: entry.updated.$t,
        summary: entry.summary ? entry.summary.$t : entry.content.$t.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...',
        content: entry.content.$t,
        author: entry.author[0].name.$t,
        authorImage: entry.author[0]['gd$image'] ? entry.author[0]['gd$image'].src : "",
        link: entry.link.find(l => l.rel === 'alternate').href,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000", // Fallback tech image
        categories: entry.category ? entry.category.map(c => c.term) : []
      };
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      posts: formattedPosts
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
