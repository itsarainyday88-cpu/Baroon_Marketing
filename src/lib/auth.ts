import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'users.json');
        if (!fs.existsSync(dataPath)) return false;

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const users = JSON.parse(fileContent);

        // Check against username instead of email
        const user = users.find((u: any) => u.username === username);
        if (!user) return false;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid;
    } catch (error) {
        console.error('Auth error:', error);
        return false;
    }
}
