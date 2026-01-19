import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { codeStore } from '../send-code/route';

export async function POST(request: Request) {
    try {
        const { email, password, code } = await request.json();

        // Verify code again
        const record = codeStore.get(email);
        if (!record || record.code !== code) {
            return NextResponse.json({ error: 'Invalid verification session' }, { status: 400 });
        }

        const dataPath = path.join(process.cwd(), 'data', 'users.json');
        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: 'User database not found' }, { status: 500 });
        }

        const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const userIndex = users.findIndex((u: any) => u.email === email);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users[userIndex].password = hashedPassword;

        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

        // Consume code
        codeStore.delete(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
    }
}
