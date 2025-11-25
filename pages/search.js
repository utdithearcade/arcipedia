// Search page functionality
class SearchPage {
    constructor() {
        this.searchTimeout = null;
        
        this.init();
    }

    init() {
        // Inject shared components
        this.injectSharedComponents();
        
        // Initialize utilities
        if (typeof window.ArcipediaUtils !== 'undefined') {
            window.ArcipediaUtils.initDarkMode();
        }
        
        // Setup search functionality
        this.setupSearch();
        
        // Focus on search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }

    injectSharedComponents() {
        if (typeof window.SharedComponents !== 'undefined') {
            document.getElementById('header').innerHTML = window.SharedComponents.createHeader();
            document.getElementById('footer').innerHTML = window.SharedComponents.createFooter();
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
        });
    }

    async handleSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        const loadingElement = document.getElementById('searchLoading');
        const emptyElement = document.getElementById('searchEmpty');
        
        if (!query.trim()) {
            this.showEmptyState();
            return;
        }

        this.showLoading();

        try {
            if (typeof wikiAPI === 'undefined') {
                throw new Error('API not loaded');
            }
            
            const results = await wikiAPI.searchArticles(query, 20);
            this.renderSearchResults(results);
        } catch (error) {
            console.error('Error searching articles:', error);
            this.showError('Search failed. Please try again.');
        }
    }

    renderSearchResults(results) {
        const container = document.getElementById('searchResults');
        const loadingElement = document.getElementById('searchLoading');
        const emptyElement = document.getElementById('searchEmpty');
        
        if (loadingElement) loadingElement.classList.add('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');

        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p class="text-slate-500 dark:text-slate-400">No results found</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => this.searchResultItem(result)).join('');
        container.innerHTML = resultsHTML;
    }

    searchResultItem(result) {
        const cleanTitle = (result.title || '').trim();
        const encodedTitle = encodeURIComponent(cleanTitle);
        const articleUrl = `article.html?title=${encodedTitle}`;
        
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer search-result-item" onclick="window.location.href='${articleUrl}'">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    ${cleanTitle}
                </h3>
                <p class="text-slate-600 dark:text-slate-400 line-clamp-3">
                    ${result.description || 'No description available.'}
                </p>
                <div class="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <span>Read article</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        `;
    }

    attachResultClickHandlers() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const title = item.dataset.title;
                window.location.href = `article.html?title=${encodeURIComponent(title)}`;
            });
        });
    }

    showLoading() {
        const container = document.getElementById('searchResults');
        const loadingElement = document.getElementById('searchLoading');
        const emptyElement = document.getElementById('searchEmpty');
        
        if (container) container.innerHTML = '';
        if (loadingElement) loadingElement.classList.remove('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');
    }

    showEmptyState() {
        const container = document.getElementById('searchResults');
        const loadingElement = document.getElementById('searchLoading');
        const emptyElement = document.getElementById('searchEmpty');
        
        if (container) container.innerHTML = '';
        if (loadingElement) loadingElement.classList.add('hidden');
        if (emptyElement) emptyElement.classList.remove('hidden');
    }

    showError(message) {
        const container = document.getElementById('searchResults');
        const loadingElement = document.getElementById('searchLoading');
        const emptyElement = document.getElementById('searchEmpty');
        
        if (loadingElement) loadingElement.classList.add('hidden');
        if (emptyElement) emptyElement.classList.add('hidden');
        
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <p class="text-slate-600 dark:text-slate-400">${message}</p>
                </div>
            `;
        }
    }
}

// Initialize search page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SearchPage();
});
