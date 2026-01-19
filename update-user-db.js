const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

users[0].username = 'Baroon';

fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
console.log('User DB updated with username: Baroon');
