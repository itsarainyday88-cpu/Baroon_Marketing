const bcrypt = require('bcryptjs');

const password = '1234';
const hash = '$2b$10$IuYn1bIMcNdIY.bScjgWWufW6deMxeyR98Xk5.yf6uHCV1bKvHWDu';

async function verify() {
    console.log(`Checking password '${password}' against hash...`);
    const isValid = await bcrypt.compare(password, hash);
    console.log('Is Valid:', isValid);

    if (!isValid) {
        console.log('Generating new hash...');
        const newHash = await bcrypt.hash(password, 10);
        console.log('New Hash:', newHash);
    }
}

verify();
