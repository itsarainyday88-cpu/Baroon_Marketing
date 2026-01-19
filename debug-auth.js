const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const targetUser = users.find(u => u.username === 'Baroon');

if (!targetUser) {
    console.log('User "Baroon" not found in DB.');
} else {
    console.log('User found:', targetUser.username);
    console.log('Stored Hash:', targetUser.password);

    bcrypt.compare('1234', targetUser.password).then(res => {
        console.log('Password "1234" match result:', res);

        if (!res) {
            console.log('Generating new hash for "1234"...');
            bcrypt.hash('1234', 10).then(newHash => {
                console.log('New Hash:', newHash);
                targetUser.password = newHash;
                fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
                console.log('DB updated with new hash.');
            });
        }
    });
}
