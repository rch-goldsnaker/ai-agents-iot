import type { ToolFunction, TemperatureToolParams, TemperatureToolResult } from './types';
import ThingsBoardAuthService from '../services/thingsBoardAuth';

/**
 * Tool to get temperature data from ThingsBoard
 */
export const temperatureTool: ToolFunction<TemperatureToolParams, TemperatureToolResult> = async (params) => {
  try {
    console.log('🌡️ TemperatureTool: Executing with params:', params);
    
    const { entityId, keys = 'temperature', useStrictDataTypes = true } = params;
    
    // Get ThingsBoard configuration and auth service
    const authService = ThingsBoardAuthService.getInstance();
    const config = authService.getConfig();
    
    // Use provided entityId or default from environment
    const targetEntityId = entityId || config.defaultEntityId;

    console.log('🌡️ TemperatureTool: Target Entity ID:', targetEntityId);
    console.log('🌡️ TemperatureTool: Keys:', keys);

    if (!targetEntityId) {
      throw new Error('Entity ID is required and no default entity ID configured');
    }

    // Get access token dynamically
    const accessToken = await authService.getAccessToken();

    // Build the API URL
    const url = new URL(`${config.url}/api/plugins/telemetry/${config.entityType}/${targetEntityId}/values/timeseries?useStrictDataTypes=false`);

    console.log('🌡️ TemperatureTool: Making request to:', url.toString());

    // Make the API request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🌡️ TemperatureTool: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌡️ TemperatureTool: API Error:', errorText);
      throw new Error(`ThingsBoard API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('🌡️ TemperatureTool: Raw response:', JSON.stringify(data, null, 2));
    console.log('🌡️ TemperatureTool: Available keys:', Object.keys(data));
    
    // Process the response to extract values from the new format
    // Response format: { "temperature": [{"ts": 1758215705509, "value": "19"}], "ledState": [...], ... }
    let latestTemperature = null;
    let allSensorData: Record<string, any> = {};
    
    // Extract all available sensor data
    for (const [key, values] of Object.entries(data)) {
      if (Array.isArray(values) && values.length > 0) {
        const latestValue = values[0]; // First item is typically the most recent
        allSensorData[key] = {
          value: latestValue.value,
          timestamp: new Date(latestValue.ts).toISOString(),
          rawTimestamp: latestValue.ts
        };
        
        console.log(`🌡️ TemperatureTool: Found ${key}:`, allSensorData[key]);
      }
    }
    
    // Prioritize temperature data
    if (data.temperature && Array.isArray(data.temperature) && data.temperature.length > 0) {
      const temp = data.temperature[0];
      latestTemperature = {
        source: 'temperature',
        value: parseFloat(temp.value),
        timestamp: new Date(temp.ts).toISOString(),
        unit: '°C',
        rawTimestamp: temp.ts
      };
      console.log('🌡️ TemperatureTool: Temperature found:', latestTemperature);
    }
    
    // If no direct temperature, look for temperature-related keys
    if (!latestTemperature) {
      const tempKeys = Object.keys(data).filter(key => 
        key.toLowerCase().includes('temp') || 
        key.toLowerCase().includes('temperature')
      );
      
      if (tempKeys.length > 0) {
        const tempKey = tempKeys[0];
        const tempData = data[tempKey];
        if (Array.isArray(tempData) && tempData.length > 0) {
          const temp = tempData[0];
          latestTemperature = {
            source: tempKey,
            value: parseFloat(temp.value),
            timestamp: new Date(temp.ts).toISOString(),
            unit: '°C',
            rawTimestamp: temp.ts
          };
          console.log('🌡️ TemperatureTool: Temperature found in key:', tempKey, latestTemperature);
        }
      }
    }

    // Get sensor ID if available in the data
    let sensorId = targetEntityId;

    // Build result
    const result: TemperatureToolResult = {
      temperature: latestTemperature ? latestTemperature.value.toFixed(2) : 'No data',
      unit: '°C',
      source: latestTemperature ? latestTemperature.source : 'none',
      sensorId,
      message: latestTemperature 
        ? `Latest temperature: ${latestTemperature.value.toFixed(2)}°C from ${latestTemperature.source} at ${latestTemperature.timestamp}`
        : 'No temperature data found in response',
      timestamp: latestTemperature ? latestTemperature.timestamp : new Date().toISOString(),
      allSensorData // Include all sensor data for debugging/future use
    };

    console.log('🌡️ TemperatureTool: Final result:', result);
    
    return {
      success: true,
      data: result,
      metadata: {
        toolName: 'getTemperature',
        executedAt: new Date().toISOString(),
        originalParams: params,
        entityId: targetEntityId,
        dataKeysFound: Object.keys(data),
        sensorDataCount: Object.keys(allSensorData).length
      }
    };
    
  } catch (error) {
    console.error('❌ TemperatureTool: Error occurred:', error);
    
    return {
      success: false,
      error: `TemperatureTool error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        toolName: 'getTemperature',
        executedAt: new Date().toISOString(),
        originalParams: params
      }
    };
  }
};