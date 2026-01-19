
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
const officeParser = require('office-text-extractor');
import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore
const PDFParser = require('pdf2json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            const pdfParser = new PDFParser(null, 1); // 1 = text content only

            text = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", () => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (
            file.type.includes('presentation') ||
            file.type.includes('spreadsheet') ||
            file.type.includes('document') ||
            file.name.endsWith('.pptx') ||
            file.name.endsWith('.docx') ||
            file.name.endsWith('.xlsx')) {
            // Use office-text-extractor for PPTX/DOCX/XLSX
            text = await officeParser.getText(buffer);
        } else if (file.type.startsWith('image/')) {
            // Use Gemini Vision to describe the image
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = "Describe this image in detail. Focusing on visual elements, text, and design.";
            const imagePart = {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: file.type,
                },
            };
            const result = await model.generateContent([prompt, imagePart]);
            text = `[Image Description by Gemini]:\n${result.response.text()}`;
        } else {
            // Assume text/plain or markdown
            text = buffer.toString('utf-8');
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
