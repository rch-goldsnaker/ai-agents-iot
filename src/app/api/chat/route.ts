import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { orchestratorAgent, type AgentContext } from '@/lib/agents';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log('🚀 Chat API - Starting request');
    
    const {
      messages,
      model,
      webSearch,
    }: {
      messages: UIMessage[];
      model: string;
      webSearch: boolean;
    } = await req.json();

    // Obtener el último mensaje del usuario
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage?.parts.find(p => p.type === 'text')?.text || '';
    
    console.log('📝 User query:', userQuery);

    // Crear contexto para los agentes
    const context: AgentContext = {
      messages,
      userQuery,
      metadata: { model, webSearch }
    };

    console.log('🎯 Starting Orchestrator Agent');
    // Use the multi-agent system
    const agentResult = await orchestratorAgent(context);
    console.log('✅ Orchestrator Agent result:', { 
      success: agentResult.success, 
      hasMessage: !!agentResult.message,
      error: agentResult.error 
    });

    if (agentResult.success && agentResult.message) {
      console.log('✅ Multi-agent system successful, using generated response');
      // If agents generated a successful response, use streamText to send it
      const result = await streamText({
        model: openai('gpt-4o'),
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond with the exact message provided to you.'
          },
          {
            role: 'user', 
            content: `Please respond with this exact message: ${agentResult.message}`
          }
        ],
        temperature: 0,
      });

      return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
      });
    } else {
      console.log('⚠️ Multi-agent system failed, using fallback');
      // Fallback al sistema original si los agentes fallan
      const result = await streamText({
        model: openai('gpt-4o'),
        messages: convertToModelMessages(messages),
        system: 'You are a helpful assistant that can answer questions and help with tasks.',
        temperature: 0.7,
      });

      return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
      });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}