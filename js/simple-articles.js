// Simple working version without complex image logic
async function loadSimpleArticles() {
    console.log('=== Loading Simple Articles ===');
    
    try {
        updateDebug('Fetching articles...');
        
        // Get some famous articles that definitely have images
        const famousArticles = [
            'Albert Einstein',
            'Leonardo da Vinci', 
            'Marie Curie',
            'Isaac Newton',
            'Nelson Mandela',
            'Albert Einstein',
            'Leonardo da Vinci',
            'Marie Curie',
            'Isaac Newton',
            'Nelson Mandela'
        ];
        
        const articles = [];
        
        for (let i = 0; i < 6; i++) {
            const title = famousArticles[i];
            try {
                const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=400&exintro=true&explaintext=true&exchars=200&origin=*`);
                const data = await response.json();
                
                const pages = data.query.pages;
                const page = Object.values(pages)[0];
                
                if (page && !page.missing) {
                    articles.push({
                        id: page.pageid,
                        title: page.title,
                        extract: page.extract || 'No description available.',
                        thumbnail: page.thumbnail?.source || null,
                        url: `https://en.wikipedia.org/wiki/${page.title.replace(/ /g, '_')}`,
                        articleUrl: `article.html?title=${encodeURIComponent(page.title)}`
                    });
                }
            } catch (error) {
                console.log(`Failed to fetch ${title}:`, error);
            }
        }
        
        updateDebug(`Loaded ${articles.length} articles`);
        
        const container = document.getElementById('feedContainer');
        if (container && articles.length > 0) {
            container.innerHTML = articles.map(article => {
                const cleanTitle = article.title.trim();
                const imageUrl = article.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(cleanTitle)}/400/300.jpg`;
                
                return `
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer" onclick="window.location.href='${article.articleUrl}'">
                        <div class="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
                            <img 
                                src="${imageUrl}" 
                                alt="${cleanTitle}" 
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onerror="this.src='https://via.placeholder.com/400x300/1e293b/64748b?text=No+Image'; console.log('Image failed');"
                            >
                        </div>
                        <div class="p-6">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                ${cleanTitle}
                            </h3>
                            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                                ${article.extract}
                            </p>
                            <div class="mt-4 flex items-center justify-between">
                                <a href="${article.url}" target="_blank" class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" onclick="event.stopPropagation()">
                                    View on Wikipedia →
                                </a>
                                <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            updateDebug('Articles rendered successfully');
        }
    } catch (error) {
        updateDebug('ERROR: ' + error.message);
        console.error('Error:', error);
    }
}
