import type { ToolFunction, SensorAttributesToolParams, SensorAttributesToolResult, SensorAttribute } from './types';
import ThingsBoardAuthService from '../services/thingsBoardAuth';
import { z } from 'zod';

/**
 * Tool to get sensor attributes from ThingsBoard
 */
export const sensorAttributesTool: ToolFunction<SensorAttributesToolParams, SensorAttributesToolResult> = async (params) => {
  try {
    console.log('📊 SensorAttributesTool: Executing with params:', params);
    
    const { entityId } = params;
    
    // Get ThingsBoard configuration and auth service
    const authService = ThingsBoardAuthService.getInstance();
    const config = authService.getConfig();

    // Use provided entityId or default from environment
    const targetEntityId = entityId || config.defaultEntityId;

    console.log('📊 SensorAttributesTool: Target Entity ID:', targetEntityId);

    if (!targetEntityId) {
      throw new Error('Entity ID is required and no default entity ID configured');
    }

    // Get access token dynamically
    const accessToken = await authService.getAccessToken();

    // Build the API URL for device attributes
    const url = `${config.url}/api/plugins/telemetry/${config.entityType}/${targetEntityId}/values/attributes`;

    console.log('📊 SensorAttributesTool: Making GET request to:', url);

    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('📊 SensorAttributesTool: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📊 SensorAttributesTool: API Error:', errorText);
      throw new Error(`ThingsBoard API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const rawData = await response.json();
    console.log('📊 SensorAttributesTool: Raw response length:', rawData.length);
    console.log('📊 SensorAttributesTool: Raw response sample:', JSON.stringify(rawData.slice(0, 3), null, 2));

    // Process the response array into structured attributes
    const attributes = rawData.map((item: any) => ({
      lastUpdateTs: item.lastUpdateTs,
      key: item.key,
      value: item.value,
      timestamp: new Date(item.lastUpdateTs).toISOString()
    }));

    console.log('📊 SensorAttributesTool: Processed attributes count:', attributes.length);

    // Get the latest values for each unique key (since there might be multiple entries for the same key)
    const latestAttributes = new Map<string, SensorAttribute>();
    attributes.forEach((attr: SensorAttribute) => {
      const existing = latestAttributes.get(attr.key);
      if (!existing || attr.lastUpdateTs > existing.lastUpdateTs) {
        latestAttributes.set(attr.key, attr);
      }
    });

    const uniqueAttributes = Array.from(latestAttributes.values());
    console.log('📊 SensorAttributesTool: Unique attributes count:', uniqueAttributes.length);

    // Create a summary with key information
    const summary: any = {};
    uniqueAttributes.forEach((attr: SensorAttribute) => {
      switch (attr.key) {
        case 'macAddress':
          summary.macAddress = attr.value;
          break;
        case 'localIp':
          summary.localIp = attr.value;
          break;
        case 'ssid':
          summary.ssid = attr.value;
          break;
        case 'rssi':
          summary.rssi = attr.value;
          break;
        case 'ledState':
          summary.ledState = attr.value;
          break;
        case 'ledMode':
          summary.ledMode = attr.value;
          break;
        case 'active':
          summary.active = attr.value;
          break;
      }
    });

    console.log('📊 SensorAttributesTool: Summary:', summary);

    // Build result
    const result: SensorAttributesToolResult = {
      entityId: targetEntityId,
      attributes: uniqueAttributes,
      attributeCount: uniqueAttributes.length,
      message: `Retrieved ${uniqueAttributes.length} sensor attributes successfully`,
      timestamp: new Date().toISOString(),
      summary
    };

    console.log('📊 SensorAttributesTool: Final result preview:', {
      entityId: result.entityId,
      attributeCount: result.attributeCount,
      summaryKeys: Object.keys(result.summary)
    });
    
    return {
      success: true,
      data: result,
      metadata: {
        toolName: 'sensorAttributes',
        executedAt: new Date().toISOString(),
        originalParams: params,
        entityId: targetEntityId,
        rawAttributeCount: rawData.length,
        uniqueAttributeCount: uniqueAttributes.length
      }
    };
    
  } catch (error) {
    console.error('❌ SensorAttributesTool: Error occurred:', error);
    
    return {
      success: false,
      error: `SensorAttributesTool error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        toolName: 'sensorAttributes',
        executedAt: new Date().toISOString(),
        originalParams: params
      }
    };
  }
};

/**
 * AI SDK compatible sensor attributes tool definition
 */
export const sensorAttributesAITool = {
  description: 'Get sensor attributes and device information like MAC address, IP, WiFi status, LED status, and device configuration. Use this when users ask about device status, sensor info, attributes, configuration, or device details.',
  inputSchema: z.object({
    entityId: z.string().optional().describe('Entity ID of the device (optional, uses default if not provided)'),
  }),
  execute: async (params: { entityId?: string }) => {
    const result = await sensorAttributesTool(params);
    
    if (result.success) {
      return {
        success: true,
        entityId: result.data?.entityId || 'Unknown',
        attributes: result.data?.attributes || [],
        attributeCount: result.data?.attributeCount || 0,
        summary: result.data?.summary || {},
        message: result.data?.message || 'Attributes retrieved successfully',
        timestamp: result.data?.timestamp || new Date().toISOString()
      };
    } else {
      throw new Error(result.error || 'Failed to get sensor attributes');
    }
  },
};