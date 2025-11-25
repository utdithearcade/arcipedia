// Utility functions for Arcipedia

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// HTML sanitization to remove unwanted Wikipedia elements
function sanitizeHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove unwanted elements
    const unwantedSelectors = [
        '.mw-editsection',
        '.infobox',
        '.reference',
        '.navbox',
        '.metadata',
        '.hatnote',
        '.dablink',
        '.rellink',
        '.reflist',
        '.toc',
        '.thumb',
        '.gallery',
        'table',
        'sup.reference'
    ];

    unwantedSelectors.forEach(selector => {
        const elements = tempDiv.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });

    return tempDiv.innerHTML;
}

// Dark mode management
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const html = document.documentElement;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        html.classList.add('dark');
    }

    darkModeToggle?.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Intersection Observer for infinite scrolling
function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
    };

    const observerOptions = { ...defaultOptions, ...options };
    
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
            }
        });
    }, observerOptions);
}

// Loading states
function showLoading(elementId = 'loadingSentinel') {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideLoading(elementId = 'loadingSentinel') {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Modal management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// URL management for article navigation
function navigateToArticle(title) {
    const url = `/article/${encodeURIComponent(title)}`;
    history.pushState({ article: title }, '', url);
}

function getArticleFromURL() {
    const path = window.location.pathname;
    const match = path.match(/^\/article\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
}

// Error handling
function showError(message, elementId = 'feedContainer') {
    const container = document.getElementById(elementId);
    if (container) {
        const errorHTML = `
            <div class="col-span-full p-8 text-center">
                <div class="text-red-500 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <p class="text-slate-600 dark:text-slate-400">${message}</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Try Again
                </button>
            </div>
        `;
        container.innerHTML = errorHTML;
    }
}

// Image lazy loading
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Category mapping for better API results
const categoryMappings = {
    technology: 'Technology',
    history: 'History',
    science: 'Science',
    art: 'Art'
};

function getCategoryForAPI(category) {
    return categoryMappings[category] || category;
}

// Export functions for use in other modules
window.ArcipediaUtils = {
    debounce,
    sanitizeHTML,
    initDarkMode,
    createIntersectionObserver,
    showLoading,
    hideLoading,
    openModal,
    closeModal,
    navigateToArticle,
    getArticleFromURL,
    showError,
    lazyLoadImages,
    getCategoryForAPI
};
