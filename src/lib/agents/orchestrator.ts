import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { AgentContext, AgentResponse, AgentType } from './types';
import { temperatureProviderAgent } from './temperatureProvider';
import { ledControlProviderAgent } from './ledControlProvider';
import { sensorAttributesProviderAgent } from './sensorAttributesProvider';
import { responseFormatterAgent } from './responseFormatter';

const orchestratorSchema = z.object({
  intent: z.enum(['iot_sensor_query', 'led_control', 'sensor_attributes', 'general_chat', 'other']).describe("The type of user intent"),
  confidence: z.number().min(0).max(1).describe("Confidence in the intent classification"),
  needsIoTData: z.boolean().describe("Whether this query requires IoT sensor data"),
  needsLedControl: z.boolean().describe("Whether this query requires LED control (turn on/off)"),
  needsSensorAttributes: z.boolean().describe("Whether this query requires sensor attributes/status/config"),
  reasoning: z.string().describe("Brief explanation of the classification")
});

export async function orchestratorAgent(context: AgentContext): Promise<AgentResponse> {
  try {
    console.log('🎯 Orchestrator: Analyzing user intent');
    
    // Analyze user intention
    const analysis = await generateObject({
      model: openai('gpt-4o'),
      system: `You are an intent classifier. Analyze user queries and determine if they need IoT sensor data, LED control, or sensor attributes.
      
      Examples:
      - "What's the temperature?" -> iot_sensor_query
      - "¿Cuál es la temperatura?" -> iot_sensor_query
      - "Temperature sensor data" -> iot_sensor_query
      - "How hot is it?" -> iot_sensor_query
      - "Sensor readings" -> iot_sensor_query
      - "IoT data" -> iot_sensor_query
      - "Turn on the LED" -> led_control
      - "Turn off the LED" -> led_control
      - "Show sensor attributes" -> sensor_attributes
      - "Device status" -> sensor_attributes
      - "Sensor information" -> sensor_attributes
      - "MAC address" -> sensor_attributes
      - "Device configuration" -> sensor_attributes
      - "Hello" -> general_chat
      - "How are you?" -> general_chat
      - "Tell me a joke" -> other`,
      prompt: `Classify this user query: "${context.userQuery}"`,
      schema: orchestratorSchema,
    });

    const intent = analysis.object;
    console.log('🎯 Orchestrator: Intent analysis result:', {
      intent: intent.intent,
      confidence: intent.confidence,
      needsIoTData: intent.needsIoTData,
      needsLedControl: intent.needsLedControl,
      needsSensorAttributes: intent.needsSensorAttributes,
      reasoning: intent.reasoning
    });

    // Decide which agent to use based on intention
    if (intent.needsSensorAttributes && intent.confidence > 0.7) {
      console.log('📊 Orchestrator: Routing to SensorAttributesProvider agent');
      // Use sensor attributes agent
      const attributesResult = await sensorAttributesProviderAgent(context);
      
      if (attributesResult.success && attributesResult.data) {
        console.log('📝 Orchestrator: SensorAttributesProvider successful, routing to ResponseFormatter');
        // Format response with attributes data
        return await responseFormatterAgent(context, attributesResult.data);
      } else {
        console.log('❌ Orchestrator: SensorAttributesProvider failed, routing to ResponseFormatter with error');
        // Error in sensorAttributesProvider, format error response
        return await responseFormatterAgent(context, undefined, attributesResult.error);
      }
    } else if (intent.needsLedControl && intent.confidence > 0.7) {
      console.log('💡 Orchestrator: Routing to LedControlProvider agent');
      // Use LED control agent
      const ledResult = await ledControlProviderAgent(context);
      
      if (ledResult.success && ledResult.data) {
        console.log('📝 Orchestrator: LedControlProvider successful, routing to ResponseFormatter');
        // Formatear respuesta con los datos de control LED
        return await responseFormatterAgent(context, ledResult.data);
      } else {
        console.log('❌ Orchestrator: LedControlProvider failed, routing to ResponseFormatter with error');
        // Error in ledControlProvider, format error response
        return await responseFormatterAgent(context, undefined, ledResult.error);
      }
    } else if (intent.needsIoTData && intent.confidence > 0.7) {
      console.log('🌡️ Orchestrator: Routing to TemperatureProvider agent');
      // Use IoT/sensors agent
      const iotResult = await temperatureProviderAgent(context);
      
      if (iotResult.success && iotResult.data) {
        console.log('📝 Orchestrator: TemperatureProvider successful, routing to ResponseFormatter');
        // Format response with sensor data
        return await responseFormatterAgent(context, iotResult.data);
      } else {
        console.log('❌ Orchestrator: TemperatureProvider failed, routing to ResponseFormatter with error');
        // Error in temperatureProvider, format error response
        return await responseFormatterAgent(context, undefined, iotResult.error);
      }
    } else {
      console.log('💬 Orchestrator: Routing directly to ResponseFormatter (general query)');
      // For general queries, use only the formatter
      return await responseFormatterAgent(context);
    }

  } catch (error) {
    return {
      success: false,
      error: `Orchestrator error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: "Sorry, there was a problem processing your query."
    };
  }
}