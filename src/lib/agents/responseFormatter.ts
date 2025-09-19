import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { AgentContext, AgentResponse } from './types';
import type { TemperatureToolResult, LedControlToolResult, SensorAttributesToolResult } from '@/lib/tools';

export async function responseFormatterAgent(
  context: AgentContext, 
  data?: TemperatureToolResult | LedControlToolResult | SensorAttributesToolResult, 
  error?: string
): Promise<AgentResponse> {
  try {
    console.log('📝 ResponseFormatter: Starting response generation');
    
    // Detect data type
    let dataType = 'none';
    if (data) {
      if ('temperature' in data) dataType = 'ThingsBoardData';
      else if ('ledState' in data) dataType = 'LedControlData';
      else if ('attributes' in data) dataType = 'SensorAttributesData';
    }
    
    console.log('📝 ResponseFormatter: Inputs:', {
      hasData: !!data,
      dataType: dataType,
      hasError: !!error,
      userQuery: context.userQuery
    });
    
    let prompt = `User asked: "${context.userQuery}"\n\n`;
    
    if (error) {
      console.log('📝 ResponseFormatter: Generating error response');
      prompt += `There was an error: ${error}\nPlease provide a helpful error message to the user.`;
    } else if (data && 'temperature' in data) {
      // This is TemperatureToolResult
      const sensorData = data as TemperatureToolResult;
      console.log('📝 ResponseFormatter: Generating IoT sensor response with data:', sensorData);
      prompt += `IoT sensor data retrieved:
- Temperature: ${sensorData.temperature}${sensorData.unit}
- Source: ${sensorData.source}
- Timestamp: ${sensorData.timestamp}
- Sensor ID: ${sensorData.sensorId}
- Message: ${sensorData.message}

Provide a friendly, natural response to the user that includes this sensor information. Focus on the temperature reading and make it conversational.`;
    } else if (data && 'ledState' in data) {
      // This is LedControlToolResult
      const ledData = data as LedControlToolResult;
      console.log('📝 ResponseFormatter: Generating LED control response with data:', ledData);
      prompt += `LED control action completed:
- LED State: ${ledData.ledState ? 'ON' : 'OFF'}
- Action: ${ledData.ledState ? 'Turned ON' : 'Turned OFF'}
- Device ID: ${ledData.entityId}
- Timestamp: ${ledData.timestamp}
- Status: ${ledData.success ? 'Successful' : 'Failed'}
- Message: ${ledData.message}

Provide a friendly, natural response to the user confirming the LED control action. Be conversational and confirm what was done.`;
    } else if (data && 'attributes' in data) {
      // This is SensorAttributesToolResult
      const attributesData = data as SensorAttributesToolResult;
      console.log('📝 ResponseFormatter: Generating sensor attributes response with data:', attributesData);
      
      // Create a formatted list of key attributes for the prompt
      const keyAttributes = [
        attributesData.summary.macAddress ? `MAC Address: ${attributesData.summary.macAddress}` : null,
        attributesData.summary.localIp ? `Local IP: ${attributesData.summary.localIp}` : null,
        attributesData.summary.ssid ? `WiFi Network: ${attributesData.summary.ssid}` : null,
        attributesData.summary.rssi ? `Signal Strength (RSSI): ${attributesData.summary.rssi} dBm` : null,
        attributesData.summary.ledState !== undefined ? `LED State: ${attributesData.summary.ledState ? 'ON' : 'OFF'}` : null,
        attributesData.summary.ledMode !== undefined ? `LED Mode: ${attributesData.summary.ledMode}` : null,
        attributesData.summary.active !== undefined ? `Device Active: ${attributesData.summary.active ? 'Yes' : 'No'}` : null,
      ].filter(Boolean).join('\n- ');
      
      prompt += `Sensor attributes retrieved successfully:
- Device ID: ${attributesData.entityId}
- Total Attributes: ${attributesData.attributeCount}
- Retrieved at: ${attributesData.timestamp}

Key Device Information:
- ${keyAttributes}

Provide a friendly, natural response to the user presenting the sensor attributes and device status. Focus on the most important information like connectivity, status, and key settings. Make it conversational and easy to understand.`;
    } else {
      console.log('📝 ResponseFormatter: Generating general response');
      prompt += `Please provide a general helpful response to the user's query.`;
    }

    const response = await generateText({
      model: openai('gpt-4o'),
      system: 'You are a helpful assistant that provides friendly, natural responses. When given sensor or time information, present it in a conversational way that is easy to understand.',
      prompt,
      temperature: 0.7,
    });

    console.log('📝 ResponseFormatter: Response generated successfully');
    console.log('📝 ResponseFormatter: Response preview:', response.text.substring(0, 100) + '...');

    return {
      success: true,
      message: response.text,
      data: { responseData: data, originalQuery: context.userQuery }
    };

  } catch (error) {
    console.log('❌ ResponseFormatter: Error occurred:', error);
    return {
      success: false,
      error: `ResponseFormatter error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      message: "Sorry, there was a problem processing your query. Please try again."
    };
  }
}