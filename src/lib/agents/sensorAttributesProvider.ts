import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { AgentContext, AgentResponse } from './types';
import { sensorAttributesTool, type SensorAttributesToolParams } from '@/lib/tools';

const sensorAttributesProviderSchema = z.object({
  needsSensorAttributes: z.boolean().describe("Whether the user is asking for sensor attributes, status, info, or configuration"),
  entityId: z.string().optional().nullable().describe("The entity ID of the device. Leave empty for default."),
  reasoning: z.string().describe("Brief explanation of the sensor attributes classification")
});

export async function sensorAttributesProviderAgent(context: AgentContext): Promise<AgentResponse> {
  try {
    console.log('📊 SensorAttributesProvider: Starting sensor attributes analysis');
    
    // Analyze if it really needs sensor attributes information
    const analysis = await generateObject({
      model: openai('gpt-4o'),
      system: `Analyze if the user is asking for sensor attributes, device status, or configuration information. Look for keywords like:
      - "attributes", "atributos", "status", "estado"
      - "sensor info", "device info", "información del sensor"
      - "configuration", "configuración", "config"
      - "properties", "propiedades"
      - "MAC address", "IP", "SSID", "WiFi"
      - "device status", "estado del dispositivo"
      - "sensor details", "detalles del sensor"
      
      Examples:
      - "Show me sensor attributes" -> true
      - "¿Cuáles son los atributos del sensor?" -> true
      - "What's the device status?" -> true
      - "Sensor information" -> true
      - "Device configuration" -> true
      - "MAC address of the device" -> true
      - "What temperature?" -> false (this is for sensor data, not attributes)`,
      prompt: `User query: "${context.userQuery}"`,
      schema: sensorAttributesProviderSchema,
    });

    console.log('📊 SensorAttributesProvider: Analysis result:', {
      needsSensorAttributes: analysis.object.needsSensorAttributes,
      entityId: analysis.object.entityId,
      reasoning: analysis.object.reasoning
    });

    if (!analysis.object.needsSensorAttributes) {
      console.log('📊 SensorAttributesProvider: Query not sensor attributes related, returning to orchestrator');
      return {
        success: false,
        error: "Query is not related to sensor attributes",
        nextAgent: 'orchestrator'
      };
    }

    console.log('📊 SensorAttributesProvider: Using SensorAttributesTool to fetch attributes');
    
    // Use the sensor attributes tool
    const toolParams: SensorAttributesToolParams = {
      entityId: analysis.object.entityId || undefined
    };
    
    const toolResult = await sensorAttributesTool(toolParams);
    
    if (!toolResult.success || !toolResult.data) {
      console.log('❌ SensorAttributesProvider: SensorAttributesTool failed:', toolResult.error);
      return {
        success: false,
        error: toolResult.error || "Failed to get sensor attributes",
        nextAgent: 'responseFormatter'
      };
    }
    
    console.log('📊 SensorAttributesProvider: SensorAttributesTool successful, attributes retrieved');
    
    return {
      success: true,
      data: toolResult.data,
      message: `Sensor attributes retrieved successfully: ${toolResult.data.attributeCount} attributes found`,
      nextAgent: 'responseFormatter'
    };

  } catch (error) {
    console.log('❌ SensorAttributesProvider: Error occurred:', error);
    return {
      success: false,
      error: `SensorAttributesProvider error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      nextAgent: 'responseFormatter'
    };
  }
}