import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { AgentContext, AgentResponse } from './types';
import { temperatureTool, type TemperatureToolParams } from '@/lib/tools';

const temperatureProviderSchema = z.object({
  entityId: z.string().optional().nullable().describe("The entity ID of the device. Leave empty for default."),
  keys: z.string().optional().nullable().describe("Comma-separated list of telemetry keys. Leave empty for default 'temperature'."),
  useStrictDataTypes: z.boolean().optional().describe("Whether to use strict data types. Defaults to true."),
  needsIoTData: z.boolean().describe("Whether the user is asking for IoT sensor data (temperature, humidity, etc.)")
});

export async function temperatureProviderAgent(context: AgentContext): Promise<AgentResponse> {
  try {
    console.log('🌡️ TemperatureProvider: Starting IoT data analysis');
    
    // Analyze if it really needs IoT/sensor information
    const analysis = await generateObject({
      model: openai('gpt-4o'),
      system: 'Analyze if the user is asking for IoT sensor data like temperature, humidity, or other sensor readings. Extract any specific entity IDs or sensor keys mentioned. If no specific parameters are mentioned, set those fields to null.',
      prompt: `User query: "${context.userQuery}"`,
      schema: temperatureProviderSchema,
    });

    console.log('🌡️ TemperatureProvider: Analysis result:', {
      needsIoTData: analysis.object.needsIoTData,
      entityId: analysis.object.entityId,
      keys: analysis.object.keys,
      useStrictDataTypes: analysis.object.useStrictDataTypes
    });

    if (!analysis.object.needsIoTData) {
      console.log('🌡️ TemperatureProvider: Query not IoT-related, returning to orchestrator');
      return {
        success: false,
        error: "Query is not related to IoT sensor data",
        nextAgent: 'orchestrator'
      };
    }

    console.log('🌡️ TemperatureProvider: Using TemperatureTool to fetch sensor data');
    
    // Use the Temperature tool to get sensor data
    const toolParams: TemperatureToolParams = {
      entityId: analysis.object.entityId || undefined,
      keys: analysis.object.keys || 'temperature',
      useStrictDataTypes: analysis.object.useStrictDataTypes ?? true
    };
    
    const toolResult = await temperatureTool(toolParams);
    
    if (!toolResult.success || !toolResult.data) {
      console.log('❌ TemperatureProvider: TemperatureTool failed:', toolResult.error);
      return {
        success: false,
        error: toolResult.error || "Failed to get IoT sensor data",
        nextAgent: 'responseFormatter'
      };
    }
    
    console.log('🌡️ TemperatureProvider: TemperatureTool successful, sensor data received');
    
    return {
      success: true,
      data: toolResult.data,
      message: `IoT sensor data retrieved successfully`,
      nextAgent: 'responseFormatter'
    };

  } catch (error) {
    console.log('❌ TemperatureProvider: Error occurred:', error);
    return {
      success: false,
      error: `TemperatureProvider error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      nextAgent: 'responseFormatter'
    };
  }
}