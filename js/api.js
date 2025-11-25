// Wikipedia API interaction layer
const API_BASE_URL = 'https://en.wikipedia.org/w/api.php';

class WikipediaAPI {
    constructor() {
        this.origin = '*';
    }

    async fetchRandomArticles(count = 10) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            generator: 'random',
            grnnamespace: '0',
            grnlimit: count,
            prop: 'pageimages|extracts',
            piprop: 'thumbnail|original',
            pithumbsize: '400',
            pilicense: 'any',
            exintro: 'true',
            explaintext: 'true',
            exsentences: '3',
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return this.parseRandomArticles(data);
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
            cmnamespace: '0',
            origin: this.origin
        });

        try {
            const response = await fetch(`${API_BASE_URL}?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (!data.query || !data.query.categorymembers) {
                return [];
            }

            const pageIds = data.query.categorymembers.map(member => member.pageid).join('|');
            return await this.fetchArticlesByIds(pageIds);
        } catch (error) {
            console.error('Error fetching category articles:', error);
            throw error;
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
            exsentences: '3',
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
            return [];
        }

        const pages = data.query.pages;
        return Object.values(pages)
            .filter(page => !page.missing && !page.invalid)
            .map(page => ({
                id: page.pageid,
                title: page.title,
                extract: page.extract || '',
                thumbnail: page.thumbnail?.source || null,
                originalImage: page.original?.source || null,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
            }));
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
