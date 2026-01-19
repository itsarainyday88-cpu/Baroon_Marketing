async function testChatApi() {
    console.log('Testing /api/chat...');
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: 'Marketer',
                message: 'Hello',
                history: []
            })
        });

        console.log('Status:', response.status);
        if (!response.ok) {
            console.log('Error:', await response.text());
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            process.stdout.write(decoder.decode(value));
        }
        console.log('\nStream completed.');
    } catch (e) {
        console.error('Fetch Failed:', e.message);
    }
}

testChatApi();
