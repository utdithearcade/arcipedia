// Wikipedia API interaction layer
const API_BASE_URL = 'https://en.wikipedia.org/w/api.php';

class WikipediaAPI {
    constructor() {
        this.origin = '*';
    }

    async fetchRandomArticles(count = 10) {
        try {
            // First try real random articles
            const params = new URLSearchParams({
                action: 'query',
                format: 'json',
                list: 'random',
                rnnamespace: '0',
                rnlimit: count,
                origin: this.origin
            });

            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (!data.query || !data.query.random) {
                throw new Error('No random articles found');
            }

            // Get page details
            const pageIds = data.query.random.map(page => page.id).join('|');
            const articles = await this.fetchArticlesByIds(pageIds, count);
            
            // If we got some articles, return them
            if (articles.length > 0) {
                return articles;
            }
            
            // Fallback to famous articles
            console.log('Random articles returned no results, using fallback articles');
            return await this.getFallbackArticles(count);
            
        } catch (error) {
            console.error('Error fetching random articles:', error);
            // Fallback to famous articles
            return await this.getFallbackArticles(count);
        }
    }

    async getFallbackArticles(count = 10) {
        const famousArticles = [
            'Albert Einstein', 'Leonardo da Vinci', 'Marie Curie', 'Isaac Newton', 'Nelson Mandela',
            'William Shakespeare', 'Albert Einstein', 'Leonardo da Vinci', 'Marie Curie', 'Isaac Newton'
        ];
        
        const articles = [];
        const selectedArticles = famousArticles.slice(0, count);
        
        for (const title of selectedArticles) {
            try {
                const response = await fetch(`${API_BASE_URL}?action=query&format=json&titles=${encodeURIComponent(title)}&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=400&exintro=true&explaintext=true&exchars=200&origin=${this.origin}`);
                const data = await response.json();
                
                const pages = data.query.pages;
                const page = Object.values(pages)[0];
                
                if (page && !page.missing) {
                    articles.push({
                        id: page.pageid,
                        title: page.title,
                        extract: page.extract || 'No description available.',
                        thumbnail: page.thumbnail?.source || null,
                        originalImage: page.original?.source || null,
                        url: `https://en.wikipedia.org/wiki/${page.title.replace(/ /g, '_')}`,
                        articleUrl: `article.html?title=${encodeURIComponent(page.title)}`
                    });
                }
            } catch (error) {
                console.log(`Failed to fetch fallback article ${title}:`, error);
            }
        }
        
        return articles;
    }

    async fetchCategoryArticles(category, count = 10) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            list: 'categorymembers',
            cmtitle: `Category:${category}`,
            cmlimit: count,
            cmnamespace: '0', // Main namespace only
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (!data.query || !data.query.categorymembers) {
                console.warn(`No articles found in category: ${category}`);
                return [];
            }

            const pageIds = data.query.categorymembers
                .filter(member => member.ns === 0) // Only main namespace
                .map(member => member.pageid)
                .join('|');
                
            if (!pageIds) {
                console.warn(`No valid page IDs found in category: ${category}`);
                return [];
            }
            
            return await this.fetchArticlesByIds(pageIds);
        } catch (error) {
            console.error('Error fetching category articles:', error);
            // Return empty array instead of throwing to allow graceful fallback
            return [];
        }
    }

    async fetchArticlesByIds(pageIds, targetCount = 10) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            pageids: pageIds,
            prop: 'pageimages|extracts',
            piprop: 'thumbnail',
            pithumbsize: '400',
            pilicense: 'any',
            urlwidth: '400',
            exintro: 'true',
            explaintext: 'true',
            exchars: '500',
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            const articles = this.parseRandomArticles(data);
            
            // Prioritize articles with images, but include others if needed
            const withImages = articles.filter(article => article.thumbnail);
            const withoutImages = articles.filter(article => !article.thumbnail);
            
            console.log(`Found ${withImages.length} articles with images, ${withoutImages.length} without`);
            
            // Return articles with images first, then fill with others if needed
            const result = [...withImages, ...withoutImages].slice(0, targetCount);
            
            return result;
        } catch (error) {
            console.error('Error fetching articles by IDs:', error);
            throw error;
        }
    }

    async fetchArticleContent(title) {
        const params = new URLSearchParams({
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'text',
            formatversion: '2',
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return this.parseArticleContent(data);
        } catch (error) {
            console.error('Error fetching article content:', error);
            throw error;
        }
    }

    async searchArticles(query, limit = 10) {
        const params = new URLSearchParams({
            action: 'opensearch',
            format: 'json',
            search: query,
            limit: limit,
            namespace: '0',
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return this.parseSearchResults(data);
        } catch (error) {
            console.error('Error searching articles:', error);
            throw error;
        }
    }

    parseRandomArticles(data) {
        if (!data.query || !data.query.pages) {
            console.warn('No pages found in API response');
            return [];
        }

        const pages = data.query.pages;
        return Object.values(pages)
            .filter(page => {
                // Filter out missing, invalid, or non-article pages
                if (page.missing || page.invalid) {
                    console.warn(`Skipping missing/invalid page: ${page.title || 'Unknown'}`);
                    return false;
                }
                if (page.ns !== 0) { // Only main namespace
                    console.warn(`Skipping non-main namespace page: ${page.title} (ns: ${page.ns})`);
                    return false;
                }
                return true;
            })
            .map(page => {
                // Clean title and generate proper URLs
                const cleanTitle = (page.title || '').trim();
                const encodedTitle = encodeURIComponent(cleanTitle);
                const wikiTitle = cleanTitle.replace(/ /g, '_');
                
                // Handle thumbnail URL properly
                let thumbnailUrl = null;
                if (page.thumbnail && page.thumbnail.source) {
                    // Ensure HTTPS and proper domain
                    thumbnailUrl = page.thumbnail.source.replace(/^http:\/\//, 'https://');
                    console.log(`Thumbnail for ${cleanTitle}:`, thumbnailUrl);
                } else {
                    console.log(`No thumbnail found for ${cleanTitle}`);
                }
                
                return {
                    id: page.pageid,
                    title: cleanTitle,
                    extract: (page.extract || '').trim() || 'No description available.',
                    thumbnail: thumbnailUrl,
                    originalImage: page.original?.source || null,
                    url: `https://en.wikipedia.org/wiki/${wikiTitle}`,
                    articleUrl: `article.html?title=${encodedTitle}`
                };
            });
    }

    parseArticleContent(data) {
        if (!data.parse) {
            throw new Error('Invalid article content response');
        }

        return {
            title: data.parse.title,
            content: data.parse.text,
            pageid: data.parse.pageid
        };
    }

    parseSearchResults(data) {
        if (!Array.isArray(data) || data.length < 4) {
            return [];
        }

        const [titles, descriptions, urls] = [data[0], data[1], data[2]];
        
        return titles.map((title, index) => ({
            title: title,
            description: descriptions[index] || '',
            url: urls[index] || ''
        }));
    }
}

// Create global API instance
const wikiAPI = new WikipediaAPI();
