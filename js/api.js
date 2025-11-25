// Wikipedia API interaction layer
const API_BASE_URL = 'https://en.wikipedia.org/w/api.php';

class WikipediaAPI {
    constructor() {
        this.origin = '*';
    }

    async fetchRandomArticles(count = 10) {
        // Use list=random instead of generator=random for better results
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            list: 'random',
            rnnamespace: '0', // Main namespace only
            rnlimit: count,
            origin: this.origin
        });

        try {
            // First get random page IDs
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (!data.query || !data.query.random) {
                return [];
            }

            // Extract page IDs and get page details
            const pageIds = data.query.random.map(page => page.id).join('|');
            return await this.fetchArticlesByIds(pageIds);
        } catch (error) {
            console.error('Error fetching random articles:', error);
            throw error;
        }
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

    async fetchArticlesByIds(pageIds) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            pageids: pageIds,
            prop: 'pageimages|extracts',
            piprop: 'thumbnail|original',
            pithumbsize: '400',
            pilicense: 'any',
            exintro: 'true',
            explaintext: 'true',
            exchars: '500', // Use exchars instead of exsentences (more reliable)
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return this.parseRandomArticles(data);
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
                
                return {
                    id: page.pageid,
                    title: cleanTitle,
                    extract: (page.extract || '').trim() || 'No description available.',
                    thumbnail: page.thumbnail?.source || null,
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
