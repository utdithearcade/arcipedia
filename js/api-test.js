// Test API endpoints to verify they work correctly
async function testAPIEndpoints() {
    console.log('Testing Wikipedia API endpoints...');
    
    try {
        // Test 1: Random articles
        console.log('1. Testing random articles...');
        const randomArticles = await wikiAPI.fetchRandomArticles(3);
        console.log('Random articles result:', randomArticles);
        
        // Test 2: Category articles
        console.log('2. Testing category articles...');
        const categoryArticles = await wikiAPI.fetchCategoryArticles('Technology', 3);
        console.log('Category articles result:', categoryArticles);
        
        // Test 3: Search
        console.log('3. Testing search...');
        const searchResults = await wikiAPI.searchArticles('Einstein', 3);
        console.log('Search results:', searchResults);
        
        // Test 4: Article content
        if (randomArticles.length > 0) {
            console.log('4. Testing article content...');
            const articleContent = await wikiAPI.fetchArticleContent(randomArticles[0].title);
            console.log('Article content loaded:', articleContent.title ? 'Success' : 'Failed');
        }
        
        console.log('✅ All API tests completed');
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

// Run tests after page loads
setTimeout(testAPIEndpoints, 1000);
