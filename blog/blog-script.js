// AirLink Blog Frontend Logic
// Fetches posts from GAS backend and handles the UI

const BLOG_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxEzjn6GZ9JD9XH32zny1hgKgNO9anjIrNBMjG-gmLobMSMi0EsoQg3wjRW0M4792ejlA/exec';

let blogPosts = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
    setupModal();
});

/**
 * Fetches blog posts from the GAS backend
 */
async function fetchPosts() {
    const grid = document.getElementById('blog-grid');
    
    try {
        const response = await fetch(`${BLOG_BACKEND_URL}?action=getPosts`);
        const result = await response.json();
        
        if (result.status === 'success') {
            blogPosts = result.posts;
            renderPosts(blogPosts);
        } else {
            showError(result.message || 'Failed to load posts.');
        }
    } catch (err) {
        console.error('Blog Fetch Error:', err);
        // If the URL is just placeholder, show a more helpful message
        if (BLOG_BACKEND_URL.includes('YOUR_BLOG_BACKEND')) {
            showError('Blog Backend not yet connected. Please deploy your Google Apps Script and update BLOG_BACKEND_URL.');
        } else {
            showError('Unable to connect to the blog server. Please try again later.');
        }
    }
}

/**
 * Renders the blog posts into the grid
 */
function renderPosts(posts) {
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = ''; // Clear loader

    if (posts.length === 0) {
        grid.innerHTML = '<div class="loader-container"><p>No posts found on Blogger.</p></div>';
        return;
    }

    posts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'blog-card glass';
        card.setAttribute('data-reveal', '');
        card.style.animationDelay = `${index * 0.1}s`;
        
        const date = new Date(post.published).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        card.innerHTML = `
            <div class="blog-thumbnail">
                <img src="${post.thumbnail}" alt="${post.title}" loading="lazy">
            </div>
            <div class="blog-card-content">
                <span class="blog-date">${date}</span>
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <div class="blog-footer">
                    <div class="author-info">
                        ${post.authorImage ? `<img src="${post.authorImage}" alt="${post.author}" class="author-img">` : '<i class="fa-solid fa-user-circle" style="font-size: 1.5rem; color: var(--primary-color)"></i>'}
                        <span class="author-name">${post.author}</span>
                    </div>
                    <span style="color: var(--primary-color); font-size: 0.8rem; font-weight: 700;">READ MORE <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openPost(post));
        grid.appendChild(card);
    });
}

/**
 * Shows an error message in the grid
 */
function showError(msg) {
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = `
        <div class="loader-container" style="text-align: center; max-width: 600px;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--error-color); margin-bottom: 1rem;"></i>
            <h3 style="color: white; margin-bottom: 0.5rem;">Connection Error</h3>
            <p style="color: var(--text-dim);">${msg}</p>
            <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 1.5rem;">Try Again</button>
        </div>
    `;
}

/**
 * Setup modal closing logic
 */
function setupModal() {
    const overlay = document.getElementById('post-modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scroll
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

/**
 * Opens a full post in the immersive modal
 */
function openPost(post) {
    const overlay = document.getElementById('post-modal-overlay');
    const content = document.getElementById('modal-content');
    
    const date = new Date(post.published).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    content.innerHTML = `
        <article class="full-post">
            <header class="full-post-header">
                <span class="blog-date">${date}</span>
                <h2>${post.title}</h2>
                <div class="full-post-meta">
                    <span><i class="fa-solid fa-user"></i> ${post.author}</span>
                    <span><i class="fa-solid fa-clock"></i> ${Math.ceil(post.content.split(' ').length / 200)} min read</span>
                </div>
            </header>
            
            <div class="full-post-body">
                ${post.content}
            </div>
            
            <div style="margin-top: 4rem; text-align: center;">
                <a href="${post.link}" target="_blank" class="btn btn-secondary">
                    View on Blogger <i class="fa-solid fa-external-link" style="margin-left: 8px;"></i>
                </a>
            </div>
        </article>
    `;

    overlay.style.display = 'flex';
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden'; // Disable background scroll
}
