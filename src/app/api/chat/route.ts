import { NextResponse } from 'next/server';
import { generateAgentResponseStream } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agentId, message, history, mode } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    const generator = generateAgentResponseStream(agentId, message, history, mode);

                    for await (const chunk of generator) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                } catch (error: any) {
                    console.error('Streaming Error:', error);
                    // If error occurs mid-stream, we can't change the status code, 
                    // but we can send an error message inline or close hard.
                    controller.error(error);
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('------- CHAT API ERROR -------');
        console.error('Agent ID:', (request as any).body?.agentId);
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('------------------------------');

        return NextResponse.json({
            error: `Server Error: ${error.message || 'Unknown error'}`
        }, { status: 500 });
    }
}
