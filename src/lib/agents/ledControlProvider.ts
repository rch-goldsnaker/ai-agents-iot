import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { AgentContext, AgentResponse } from './types';
import { ledControlTool, type LedControlToolParams } from '@/lib/tools';

const ledControlProviderSchema = z.object({
  needsLedControl: z.boolean().describe("Whether the user is asking to control LED (turn on/off)"),
  ledAction: z.enum(['turn_on', 'turn_off', 'unknown']).describe("The action to perform on the LED"),
  entityId: z.string().optional().nullable().describe("The entity ID of the device. Leave empty for default."),
  reasoning: z.string().describe("Brief explanation of the LED control classification")
});

export async function ledControlProviderAgent(context: AgentContext): Promise<AgentResponse> {
  try {
    console.log('💡 LedControlProvider: Starting LED control analysis');
    
    // Analyze if it really needs LED control
    const analysis = await generateObject({
      model: openai('gpt-4o'),
      system: `Analyze if the user is asking to control an LED (turn on/off). Look for keywords like:
      - "turn on", "encender", "prender", "on", "encender led"
      - "turn off", "apagar", "off", "apagar led"
      - "led", "light", "luz"
      
      Examples:
      - "turn on the LED" -> turn_on
      - "encender el led" -> turn_on
      - "prender la luz" -> turn_on
      - "turn off the LED" -> turn_off  
      - "apagar el led" -> turn_off
      - "apaga la luz" -> turn_off`,
      prompt: `User query: "${context.userQuery}"`,
      schema: ledControlProviderSchema,
    });

    console.log('💡 LedControlProvider: Analysis result:', {
      needsLedControl: analysis.object.needsLedControl,
      ledAction: analysis.object.ledAction,
      entityId: analysis.object.entityId,
      reasoning: analysis.object.reasoning
    });

    if (!analysis.object.needsLedControl || analysis.object.ledAction === 'unknown') {
      console.log('💡 LedControlProvider: Query not LED control related, returning to orchestrator');
      return {
        success: false,
        error: "Query is not related to LED control",
        nextAgent: 'orchestrator'
      };
    }

    // Determine the LED state based on the action
    const ledState = analysis.object.ledAction === 'turn_on';
    
    console.log('💡 LedControlProvider: Using LedControlTool to control LED');
    console.log('💡 LedControlProvider: LED State to set:', ledState ? 'ON (true)' : 'OFF (false)');
    
    // Use the LED control tool
    const toolParams: LedControlToolParams = {
      entityId: analysis.object.entityId || undefined,
      ledState: ledState
    };
    
    const toolResult = await ledControlTool(toolParams);
    
    if (!toolResult.success || !toolResult.data) {
      console.log('❌ LedControlProvider: LedControlTool failed:', toolResult.error);
      return {
        success: false,
        error: toolResult.error || "Failed to control LED",
        nextAgent: 'responseFormatter'
      };
    }
    
    console.log('💡 LedControlProvider: LedControlTool successful, LED controlled');
    
    return {
      success: true,
      data: toolResult.data,
      message: `LED control executed successfully: ${ledState ? 'ON' : 'OFF'}`,
      nextAgent: 'responseFormatter'
    };

  } catch (error) {
    console.log('❌ LedControlProvider: Error occurred:', error);
    return {
      success: false,
      error: `LedControlProvider error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      nextAgent: 'responseFormatter'
    };
  }
}