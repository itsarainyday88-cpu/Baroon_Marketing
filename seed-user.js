const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedUser() {
    const password = '1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        {
            id: '1',
            name: 'Baroon',
            email: 'itsarainyday88@gmail.com',
            password: hashedPassword
        }
    ];

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
    console.log('User seeded successfully');
}

seedUser();
