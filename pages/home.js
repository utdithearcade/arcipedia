// Home page functionality
class HomePage {
    constructor() {
        this.currentCategory = this.getCategoryFromURL();
        this.isLoading = false;
        this.observer = null;
        
        console.log('HomePage constructor called');
        this.init();
    }

    init() {
        console.log('Initializing HomePage...');
        this.setupApp();
    }

    setupApp() {
        try {
            // Inject shared components
            this.injectSharedComponents();
            
            // Initialize utilities
            if (typeof window.ArcipediaUtils !== 'undefined') {
                window.ArcipediaUtils.initDarkMode();
            } else {
                console.warn('ArcipediaUtils not available');
            }
            
            // Setup infinite scroll
            this.setupInfiniteScroll();
            
            // Load initial articles
            this.loadInitialArticles();
            
            console.log('HomePage setup complete');
        } catch (error) {
            console.error('Error setting up HomePage:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    injectSharedComponents() {
        try {
            if (typeof window.SharedComponents !== 'undefined') {
                const headerEl = document.getElementById('header');
                const categoryEl = document.getElementById('categoryChips');
                const footerEl = document.getElementById('footer');
                
                if (headerEl) headerEl.innerHTML = window.SharedComponents.createHeader();
                if (categoryEl) categoryEl.innerHTML = window.SharedComponents.createCategoryChips(this.currentCategory);
                if (footerEl) footerEl.innerHTML = window.SharedComponents.createFooter();
                
                console.log('Shared components injected successfully');
            } else {
                console.warn('SharedComponents not available');
            }
        } catch (error) {
            console.error('Error injecting shared components:', error);
        }
    }

    getCategoryFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || 'random';
    }

    setupInfiniteScroll() {
        const sentinel = document.getElementById('loadingSentinel');
        if (!sentinel) {
            console.warn('Loading sentinel not found');
            return;
        }

        if (typeof window.ArcipediaUtils === 'undefined') {
            console.warn('ArcipediaUtils not available for infinite scroll');
            return;
        }

        try {
            this.observer = window.ArcipediaUtils.createIntersectionObserver(
                () => {
                    if (!this.isLoading) {
                        console.log('Loading more articles via infinite scroll...');
                        this.loadMoreArticles();
                    }
                },
                { rootMargin: '200px' }
            );

            this.observer.observe(sentinel);
            console.log('Infinite scroll observer setup complete');
        } catch (error) {
            console.error('Error setting up infinite scroll:', error);
        }
    }

    async loadInitialArticles() {
        console.log('Loading initial articles...');
        
        // Check if components are loaded
        if (typeof window.ComponentRenderer === 'undefined') {
            console.error('ComponentRenderer not loaded');
            this.showError('Application components not loaded. Please refresh the page.');
            return;
        }
        
        if (typeof wikiAPI === 'undefined') {
            console.error('wikiAPI not loaded');
            this.showError('API not loaded. Please refresh the page.');
            return;
        }
        
        this.isLoading = true;
        window.ComponentRenderer.showLoadingSkeletons();

        try {
            console.log('Fetching articles...');
            const articles = await this.fetchArticles();
            console.log('Articles fetched:', articles.length);
            
            if (articles.length === 0) {
                console.log('No articles found, showing empty state');
                window.ComponentRenderer.renderArticles([]);
            } else {
                window.ComponentRenderer.renderArticles(articles);
                this.attachArticleClickHandlers();
            }
        } catch (error) {
            console.error('Error loading initial articles:', error);
            this.showError('Failed to load articles. Please try again.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadMoreArticles() {
        this.isLoading = true;
        this.showLoading();

        try {
            const articles = await this.fetchArticles();
            window.ComponentRenderer.appendArticles(articles);
            this.attachArticleClickHandlers();
        } catch (error) {
            console.error('Error loading more articles:', error);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async fetchArticles() {
        try {
            console.log(`Fetching ${this.currentCategory} articles...`);
            
            if (this.currentCategory === 'random') {
                return await wikiAPI.fetchRandomArticles(10);
            } else {
                const category = window.ArcipediaUtils?.getCategoryForAPI?.(this.currentCategory) || this.currentCategory;
                console.log(`Fetching category: ${category}`);
                const articles = await wikiAPI.fetchCategoryArticles(category, 10);
                
                // If category fails, fallback to random
                if (articles.length === 0) {
                    console.log('Category returned no results, falling back to random');
                    return await wikiAPI.fetchRandomArticles(10);
                }
                
                return articles;
            }
        } catch (error) {
            console.error('Error in fetchArticles:', error);
            
            // Fallback to random if anything fails
            try {
                console.log('Attempting fallback to random articles...');
                return await wikiAPI.fetchRandomArticles(10);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw error;
            }
        }
    }

    attachArticleClickHandlers() {
        document.querySelectorAll('[data-article-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                const title = card.querySelector('h3').textContent;
                window.location.href = `article.html?title=${encodeURIComponent(title)}`;
            });
        });
    }

    showLoading() {
        const element = document.getElementById('loadingSentinel');
        if (element) element.classList.remove('hidden');
    }

    hideLoading() {
        const element = document.getElementById('loadingSentinel');
        if (element) element.classList.add('hidden');
    }

    showError(message) {
        const container = document.getElementById('feedContainer');
        if (container) {
            container.innerHTML = `
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
        }
    }
}

// Initialize home page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
