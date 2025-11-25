// Article page functionality
class ArticlePage {
    constructor() {
        this.articleTitle = this.getArticleFromURL();
        
        this.init();
    }

    init() {
        // Inject shared components
        this.injectSharedComponents();
        
        // Initialize utilities
        if (typeof window.ArcipediaUtils !== 'undefined') {
            window.ArcipediaUtils.initDarkMode();
        }
        
        // Load article
        if (this.articleTitle) {
            this.loadArticle(this.articleTitle);
        } else {
            this.showError('No article specified');
        }

        // Setup refresh button
        this.setupRefreshButton();
    }

    injectSharedComponents() {
        if (typeof window.SharedComponents !== 'undefined') {
            document.getElementById('header').innerHTML = window.SharedComponents.createHeader();
            document.getElementById('footer').innerHTML = window.SharedComponents.createFooter();
        }
    }

    getArticleFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        // Clean and decode the title
        return title ? decodeURIComponent(title).trim() : null;
    }

    setupRefreshButton() {
        const refreshBtn = document.getElementById('refreshArticle');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadArticle(this.articleTitle);
            });
        }
    }

    async loadArticle(title) {
        const titleElement = document.getElementById('articleTitle');
        const contentElement = document.getElementById('articleContent');
        const loadingElement = document.getElementById('articleLoading');
        const errorElement = document.getElementById('articleError');
        const wikiLink = document.getElementById('wikiLink');
        const pageTitleElement = document.getElementById('articlePageTitle');

        // Show loading
        if (loadingElement) loadingElement.classList.remove('hidden');
        if (contentElement) contentElement.classList.add('hidden');
        if (errorElement) errorElement.classList.add('hidden');

        // Set title
        if (titleElement) titleElement.textContent = title;
        if (pageTitleElement) pageTitleElement.textContent = `${title} - Arcipedia`;
        if (wikiLink) {
            const wikiTitle = title.replace(/ /g, '_');
            wikiLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
        }

        try {
            if (typeof wikiAPI === 'undefined') {
                throw new Error('API not loaded');
            }

            const article = await wikiAPI.fetchArticleContent(title);
            const sanitizedContent = this.sanitizeArticleContent(article.content);
            
            if (contentElement) {
                contentElement.innerHTML = sanitizedContent;
                contentElement.classList.remove('hidden');
            }
            
            if (loadingElement) loadingElement.classList.add('hidden');
        } catch (error) {
            console.error('Error loading article:', error);
            this.showError('Failed to load article content');
        }
    }

    sanitizeArticleContent(html) {
        if (typeof window.ArcipediaUtils !== 'undefined') {
            return window.ArcipediaUtils.sanitizeHTML(html);
        }
        
        // Fallback sanitization if utils not available
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Remove unwanted elements
        const unwantedSelectors = [
            '.mw-editsection',
            '.reference',
            '.navbox',
            '.metadata',
            '.hatnote',
            '.dablink',
            '.rellink',
            '.reflist',
            '.toc',
            'sup.reference'
        ];

        unwantedSelectors.forEach(selector => {
            const elements = tempDiv.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        const WIKI_BASE = 'https://en.wikipedia.org';

        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (!src) return;

            if (src.startsWith('//')) {
                img.src = 'https:' + src;
            } else if (src.startsWith('/')) {
                img.src = WIKI_BASE + src;
            }
        });

        const links = tempDiv.querySelectorAll('a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;

            if (href.startsWith('//')) {
                a.href = 'https:' + href;
            } else if (href.startsWith('/')) {
                a.href = WIKI_BASE + href;
            }
        });

        return tempDiv.innerHTML;
    }

    showError(message) {
        const loadingElement = document.getElementById('articleLoading');
        const contentElement = document.getElementById('articleContent');
        const errorElement = document.getElementById('articleError');

        if (loadingElement) loadingElement.classList.add('hidden');
        if (contentElement) contentElement.classList.add('hidden');
        if (errorElement) {
            errorElement.classList.remove('hidden');
            const messageElement = errorElement.querySelector('p');
            if (messageElement) messageElement.textContent = message;
        }
    }
}

// Initialize article page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ArticlePage();
});
