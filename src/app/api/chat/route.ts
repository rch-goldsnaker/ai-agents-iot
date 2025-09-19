import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { aiSDKTools } from '@/lib/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log('🚀 Chat API - Starting request');
    
    const {
      messages,
    }: {
      messages: UIMessage[];
      model: string;
      webSearch: boolean;
    } = await req.json();

    console.log('📝 Processing messages with AI SDK tools');

    // Use streamText with native tools support
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      system: `You are a helpful IoT assistant that can control devices and get sensor data.
        Available tools:
        - getTemperature: Get current temperature from IoT sensors
        - controlLED: Turn device LED on or off  
        - getSensorAttributes: Get device information and sensor attributes

        Use tools when users ask about:
        - Temperature, sensor readings, IoT data → use getTemperature
        - Turn on/off LED, LED control → use controlLED  
        - Device status, sensor info, configuration, attributes → use getSensorAttributes

        IMPORTANT: After using any tool, always provide a natural, conversational response that:
        1. Explains what the tool did
        2. Interprets the results in a helpful way
        3. Provides context or additional insights when appropriate
        4. Uses a friendly, informative tone

        Respond in the same language as the user's question.`,
      tools: aiSDKTools,
      stopWhen: stepCountIs(3),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}