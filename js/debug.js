// Debug script to check script loading
console.log('Debug script loaded');
console.log('ArcipediaUtils:', typeof window.ArcipediaUtils);
console.log('ComponentRenderer:', typeof window.ComponentRenderer);
console.log('wikiAPI:', typeof wikiAPI);

// Test API call
async function testAPI() {
    try {
        console.log('Testing API...');
        const result = await wikiAPI.fetchRandomArticles(2);
        console.log('API test result:', result);
    } catch (error) {
        console.error('API test failed:', error);
    }
}

// Run test after a delay
setTimeout(testAPI, 1000);
