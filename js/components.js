// HTML Templates with Tailwind classes

class ComponentRenderer {
    // Article card template for feed
    static articleCard(article) {
        const cleanTitle = (article.title || '').trim();
        const hasImage = !!article.thumbnail;
        const imageUrl = article.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(cleanTitle)}/400/300.jpg`;
        
        return `
            <article class="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer" onclick="window.location.href='${article.articleUrl}'">
                <div class="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img 
                        src="${imageUrl}" 
                        alt="${cleanTitle}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400x300/1e293b/64748b?text=${encodeURIComponent(cleanTitle.substring(0, 20))}'; console.log('Image failed to load:', '${imageUrl}');"
                    >
                    ${!hasImage ? `
                        <div class="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                            <div class="text-center p-4">
                                <svg class="w-12 h-12 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-xs text-slate-500 dark:text-slate-400">No Image Available</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        ${cleanTitle}
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                        ${article.extract || 'No description available.'}
                    </p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xs text-slate-500 dark:text-slate-500">
                            Wikipedia
                        </span>
                        <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </article>
        `;
    }

    // Search result template
    static searchResult(result) {
        const cleanTitle = (result.title || '').trim();
        const encodedTitle = encodeURIComponent(cleanTitle);
        const articleUrl = `article.html?title=${encodedTitle}`;
        
        return `
            <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer rounded-lg transition-colors search-result-item" onclick="window.location.href='${articleUrl}'">
                <h4 class="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    ${cleanTitle}
                </h4>
                <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    ${result.description || 'No description available.'}
                </p>
            </div>
        `;
    }

    // Loading skeleton for articles
    static articleSkeleton() {
        return `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div class="aspect-video bg-slate-200 dark:bg-slate-700"></div>
                <div class="p-6">
                    <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                    <div class="space-y-2">
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Loading skeleton for search
    static searchSkeleton() {
        return `
            <div class="p-4 animate-pulse">
                <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div class="space-y-1">
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                </div>
            </div>
        `;
    }

    // Empty state for feed
    static emptyFeed(message = 'No articles found') {
        return `
            <div class="col-span-full py-16 text-center">
                <svg class="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                </svg>
                <p class="text-slate-500 dark:text-slate-400 text-lg">${message}</p>
                <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Refresh Feed
                </button>
            </div>
        `;
    }

    // Empty state for search
    static emptySearch(query = '') {
        return `
            <div class="p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p class="text-slate-500 dark:text-slate-400">
                    ${query ? `No results found for "${query}"` : 'Try searching for something...'}
                </p>
            </div>
        `;
    }

    // Category chip active state
    static updateCategoryChip(activeCategory) {
        const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            const category = chip.dataset.category;
            if (category === activeCategory) {
                chip.className = 'category-chip px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white whitespace-nowrap';
            } else {
                chip.className = 'category-chip px-4 py-2 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 whitespace-nowrap';
            }
        });
    }

    // Render multiple article cards
    static renderArticles(articles, containerId = 'feedContainer') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        console.log(`Rendering ${articles.length} articles in container ${containerId}`);

        if (articles.length === 0) {
            container.innerHTML = this.emptyFeed();
            return;
        }

        const articlesHTML = articles.map(article => this.articleCard(article)).join('');
        container.innerHTML = articlesHTML;
        console.log('Articles rendered successfully');
    }

    // Append articles to existing container
    static appendArticles(articles, containerId = 'feedContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const articlesHTML = articles.map(article => this.articleCard(article)).join('');
        container.insertAdjacentHTML('beforeend', articlesHTML);
    }

    // Render search results
    static renderSearchResults(results, containerId = 'searchResults') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = this.emptySearch();
            return;
        }

        const resultsHTML = results.map(result => this.searchResult(result)).join('');
        container.innerHTML = resultsHTML;
    }

    // Show loading skeletons
    static showLoadingSkeletons(count = 6, containerId = 'feedContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeletons = Array(count).fill('').map(() => this.articleSkeleton()).join('');
        container.innerHTML = skeletons;
    }

    // Show search loading
    static showSearchLoading(containerId = 'searchResults') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeletons = Array(3).fill('').map(() => this.searchSkeleton()).join('');
        container.innerHTML = skeletons;
    }
}

// Export for use in other modules
window.ComponentRenderer = ComponentRenderer;
