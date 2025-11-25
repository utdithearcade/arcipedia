// Test image loading specifically
async function testImageLoading() {
    console.log('=== Testing Image Loading ===');
    
    try {
        // Test with specific page that has images
        const response = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=3&origin=*');
        const data = await response.json();
        
        if (data.query && data.query.random) {
            const pageIds = data.query.random.map(page => page.id).join('|');
            
            // Get pages with images
            const detailResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageIds}&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=400&exintro=true&explaintext=true&exchars=200&origin=*`);
            const detailData = await detailResponse.json();
            
            console.log('API Response:', detailData);
            
            if (detailData.query && detailData.query.pages) {
                Object.values(detailData.query.pages).forEach(page => {
                    console.log(`Page: ${page.title}`);
                    console.log(`Thumbnail: ${page.thumbnail ? page.thumbnail.source : 'None'}`);
                    console.log(`Extract: ${page.extract ? page.extract.substring(0, 100) + '...' : 'None'}`);
                    console.log('---');
                });
            }
        }
        
        console.log('✅ Image loading test completed');
    } catch (error) {
        console.error('❌ Image loading test failed:', error);
    }
}

// Run test
testImageLoading();
