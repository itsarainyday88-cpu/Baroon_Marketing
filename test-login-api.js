async function testLoginApi() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'baroon', password: '1234' })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

testLoginApi();
