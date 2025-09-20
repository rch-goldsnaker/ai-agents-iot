import type { ToolFunction, LedControlToolParams, LedControlToolResult } from './types';
import ThingsBoardAuthService from '../services/thingsBoardAuth';
import { z } from 'zod';

/**
 * Tool to control the sensor LED state (turn on/off)
 */
export const ledControlTool: ToolFunction<LedControlToolParams, LedControlToolResult> = async (params) => {
  try {
    console.log('💡 LedControlTool: Executing with params:', params);
    
    const { entityId, ledState } = params;
    
    // Get ThingsBoard configuration and auth service
    const authService = ThingsBoardAuthService.getInstance();
    const config = authService.getConfig();

    // Use provided entityId or default from environment
    const targetEntityId = entityId || config.defaultEntityId;

    console.log('💡 LedControlTool: Target Entity ID:', targetEntityId);
    console.log('💡 LedControlTool: LED State:', ledState ? 'ON (true)' : 'OFF (false)');

    if (!targetEntityId) {
      throw new Error('Entity ID is required and no default entity ID configured');
    }

    if (typeof ledState !== 'boolean') {
      throw new Error('LED state must be a boolean value (true for ON, false for OFF)');
    }

    // Get access token dynamically
    const accessToken = await authService.getAccessToken();

    // Build the API URL for shared attributes
    const url = `${config.url}/api/plugins/telemetry/${targetEntityId}/SHARED_SCOPE`;
    
    // Prepare the request body
    const requestBody = {
      ledState: ledState
    };

    console.log('💡 LedControlTool: Making POST request to:', url);
    console.log('💡 LedControlTool: Request body:', JSON.stringify(requestBody, null, 2));

    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('💡 LedControlTool: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💡 LedControlTool: API Error:', errorText);
      throw new Error(`ThingsBoard API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    // For successful LED control, ThingsBoard typically returns empty response or simple confirmation
    let responseData = {};
    try {
      const responseText = await response.text();
      if (responseText.trim()) {
        responseData = JSON.parse(responseText);
      }
    } catch {
      console.log('💡 LedControlTool: Empty or non-JSON response (normal for LED control)');
    }

    console.log('💡 LedControlTool: Response data:', responseData);

    // Build result
    const result: LedControlToolResult = {
      success: true,
      ledState: ledState,
      entityId: targetEntityId,
      message: `LED successfully ${ledState ? 'turned ON' : 'turned OFF'}`,
      timestamp: new Date().toISOString()
    };

    console.log('💡 LedControlTool: Final result:', result);
    
    return {
      success: true,
      data: result,
      metadata: {
        toolName: 'ledControl',
        executedAt: new Date().toISOString(),
        originalParams: params,
        entityId: targetEntityId,
        action: ledState ? 'turn_on' : 'turn_off'
      }
    };
    
  } catch (error) {
    console.error('❌ LedControlTool: Error occurred:', error);
    
    return {
      success: false,
      error: `LedControlTool error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        toolName: 'ledControl',
        executedAt: new Date().toISOString(),
        originalParams: params
      }
    };
  }
};

/**
 * AI SDK compatible LED control tool definition
 */
export const ledControlAITool = {
  description: 'Control LED state (turn on/off). Use this when users want to turn on, turn off, enable, disable, or control the LED.',
  inputSchema: z.object({
    ledState: z.boolean().describe('LED state: true to turn ON, false to turn OFF'),
    entityId: z.string().optional().describe('Entity ID of the device (optional, uses default if not provided)'),
  }),
  execute: async (params: { ledState: boolean; entityId?: string }) => {
    const result = await ledControlTool(params);
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to control LED');
    }
  },
};