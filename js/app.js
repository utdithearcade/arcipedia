// Main application controller

class ArcipediaApp {
    constructor() {
        this.currentCategory = 'random';
        this.isLoading = false;
        this.observer = null;
        this.searchTimeout = null;
        
        this.init();
    }

    init() {
        // Wait for all scripts to load
        if (typeof window.ArcipediaUtils === 'undefined') {
            console.error('ArcipediaUtils not loaded');
            return;
        }
        
        // Initialize utilities
        window.ArcipediaUtils.initDarkMode();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup infinite scroll
        this.setupInfiniteScroll();
        
        // Load initial articles
        this.loadInitialArticles();
        
        // Handle browser back/forward
        this.setupURLHandling();
    }

    setupEventListeners() {
        // Category chips
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchOverlay = document.getElementById('searchOverlay');
        const closeSearch = document.getElementById('closeSearch');
        const searchInput = document.getElementById('searchInput');

        searchBtn?.addEventListener('click', () => {
            window.ArcipediaUtils.openModal('searchOverlay');
            searchInput?.focus();
        });

        closeSearch?.addEventListener('click', () => {
            window.ArcipediaUtils.closeModal('searchOverlay');
            searchInput.value = '';
            document.getElementById('searchResults').innerHTML = '';
        });

        // Search input with debouncing
        searchInput?.addEventListener('input', 
            window.ArcipediaUtils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300)
        );

        // Close search on overlay click
        searchOverlay?.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                window.ArcipediaUtils.closeModal('searchOverlay');
                searchInput.value = '';
                document.getElementById('searchResults').innerHTML = '';
            }
        });

        // Article modal
        const closeArticle = document.getElementById('closeArticle');
        closeArticle?.addEventListener('click', () => {
            window.ArcipediaUtils.closeModal('articleModal');
            history.back();
        });

        // Close article on overlay click
        const articleModal = document.getElementById('articleModal');
        articleModal?.addEventListener('click', (e) => {
            if (e.target === articleModal) {
                window.ArcipediaUtils.closeModal('articleModal');
                history.back();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!searchOverlay.classList.contains('hidden')) {
                    window.ArcipediaUtils.closeModal('searchOverlay');
                } else if (!articleModal.classList.contains('hidden')) {
                    window.ArcipediaUtils.closeModal('articleModal');
                }
            }
            
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.ArcipediaUtils.openModal('searchOverlay');
                searchInput?.focus();
            }
        });
    }

    setupInfiniteScroll() {
        const sentinel = document.getElementById('loadingSentinel');
        if (!sentinel) return;

        this.observer = window.ArcipediaUtils.createIntersectionObserver(
            () => {
                if (!this.isLoading) {
                    this.loadMoreArticles();
                }
            },
            { rootMargin: '200px' }
        );

        this.observer.observe(sentinel);
    }

    setupURLHandling() {
        window.addEventListener('popstate', (e) => {
            const article = window.ArcipediaUtils.getArticleFromURL();
            if (article) {
                this.openArticle(article, false);
            } else {
                window.ArcipediaUtils.closeModal('articleModal');
            }
        });

        // Check for article in URL on load
        const article = window.ArcipediaUtils.getArticleFromURL();
        if (article) {
            this.openArticle(article, false);
        }
    }

    async loadInitialArticles() {
        if (typeof window.ComponentRenderer === 'undefined' || typeof wikiAPI === 'undefined') {
            console.error('Required components not loaded');
            window.ArcipediaUtils.showError('Application components not loaded. Please refresh the page.');
            return;
        }
        
        this.isLoading = true;
        window.ComponentRenderer.showLoadingSkeletons();

        try {
            const articles = await this.fetchArticles();
            window.ComponentRenderer.renderArticles(articles);
            this.attachArticleClickHandlers();
        } catch (error) {
            console.error('Error loading initial articles:', error);
            window.ArcipediaUtils.showError('Failed to load articles. Please try again.');
        } finally {
            this.isLoading = false;
            window.ArcipediaUtils.hideLoading();
        }
    }

    async loadMoreArticles() {
        this.isLoading = true;
        window.ArcipediaUtils.showLoading();

        try {
            const articles = await this.fetchArticles();
            window.ComponentRenderer.appendArticles(articles);
            this.attachArticleClickHandlers();
        } catch (error) {
            console.error('Error loading more articles:', error);
            // Don't show error for infinite scroll failures, just stop loading
        } finally {
            this.isLoading = false;
            window.ArcipediaUtils.hideLoading();
        }
    }

    async fetchArticles() {
        if (this.currentCategory === 'random') {
            return await wikiAPI.fetchRandomArticles(10);
        } else {
            const category = window.ArcipediaUtils.getCategoryForAPI(this.currentCategory);
            return await wikiAPI.fetchCategoryArticles(category, 10);
        }
    }

    switchCategory(category) {
        if (this.currentCategory === category || this.isLoading) return;

        this.currentCategory = category;
        window.ComponentRenderer.updateCategoryChip(category);
        
        // Reset and reload
        this.loadInitialArticles();
    }

    async handleSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }

        window.ComponentRenderer.showSearchLoading();

        try {
            const results = await wikiAPI.searchArticles(query, 10);
            window.ComponentRenderer.renderSearchResults(results);
            this.attachSearchClickHandlers();
        } catch (error) {
            console.error('Error searching articles:', error);
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <p>Search failed. Please try again.</p>
                </div>
            `;
        }
    }

    attachArticleClickHandlers() {
        document.querySelectorAll('[data-article-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                const title = card.querySelector('h3').textContent;
                this.openArticle(title);
            });
        });
    }

    attachSearchClickHandlers() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const title = item.dataset.title;
                window.ArcipediaUtils.closeModal('searchOverlay');
                document.getElementById('searchInput').value = '';
                document.getElementById('searchResults').innerHTML = '';
                this.openArticle(title);
            });
        });
    }

    async openArticle(title, updateURL = true) {
        window.ArcipediaUtils.openModal('articleModal');
        
        const titleElement = document.getElementById('articleTitle');
        const contentElement = document.getElementById('articleContent');
        
        // Show loading state
        titleElement.textContent = title;
        contentElement.innerHTML = `
            <div class="animate-pulse space-y-4">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
        `;

        try {
            const article = await wikiAPI.fetchArticleContent(title);
            const sanitizedContent = window.ArcipediaUtils.sanitizeHTML(article.content);
            
            titleElement.textContent = article.title;
            contentElement.innerHTML = sanitizedContent;
            
            if (updateURL) {
                window.ArcipediaUtils.navigateToArticle(title);
            }
        } catch (error) {
            console.error('Error loading article:', error);
            contentElement.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <p class="text-slate-600 dark:text-slate-400">Failed to load article content.</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ArcipediaApp();
});
