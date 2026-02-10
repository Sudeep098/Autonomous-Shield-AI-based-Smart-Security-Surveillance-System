// Quick MongoDB Suspects API Test
const testAPI = async () => {
    console.log('Testing /api/suspects endpoint...\n');

    try {
        const response = await fetch('http://localhost:5000/api/suspects');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('\n✅ SUCCESS! Suspects found:', data.length);
            console.log('\nFirst 3 suspects:');
            console.log(JSON.stringify(data.slice(0, 3), null, 2));
        } else {
            console.log('\n❌ ERROR Response');
            const text = await response.text();
            console.log(text.substring(0, 500));
        }
    } catch (error) {
        console.log('\n❌ FETCH ERROR:', error.message);
    }
};

testAPI();
