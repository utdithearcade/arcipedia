// Shared header component
function createHeader() {
    return `
        <header class="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <a href="index.html" class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Arcipedia
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="search.html" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </a>
                        <button id="darkModeToggle" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Shared category chips component
function createCategoryChips(activeCategory = 'random') {
    const chips = [
        { id: 'random', label: 'Random' },
        { id: 'technology', label: 'Technology' },
        { id: 'history', label: 'History' },
        { id: 'science', label: 'Science' },
        { id: 'art', label: 'Art' }
    ];

    return `
        <div class="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div class="flex space-x-2 overflow-x-auto" id="categoryChips">
                    ${chips.map(chip => `
                        <a href="index.html?category=${chip.id}" class="category-chip px-4 py-2 rounded-full text-sm font-medium ${chip.id === activeCategory ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'} whitespace-nowrap">
                            ${chip.label}
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Shared footer component
function createFooter() {
    return `
        <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="text-center text-slate-600 dark:text-slate-400">
                    <p>&copy; 2024 Arcipedia. Powered by Wikipedia API.</p>
                    <p class="mt-2 text-sm">Discover knowledge, one article at a time.</p>
                </div>
            </div>
        </footer>
    `;
}

// Export components
window.SharedComponents = {
    createHeader,
    createCategoryChips,
    createFooter
};
