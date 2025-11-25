// Simple test to verify API works
async function simpleTest() {
    console.log('=== Simple API Test ===');
    
    try {
        // Test basic API call
        const response = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1&origin=*');
        const data = await response.json();
        console.log('Basic API test:', data);
        
        if (data.query && data.query.random && data.query.random.length > 0) {
            const pageId = data.query.random[0].id;
            console.log('Got page ID:', pageId);
            
            // Test getting page details
            const detailResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&exchars=200&origin=*`);
            const detailData = await detailResponse.json();
            console.log('Page details:', detailData);
        }
        
        console.log('✅ Simple test passed');
    } catch (error) {
        console.error('❌ Simple test failed:', error);
    }
}

// Run test immediately
simpleTest();
