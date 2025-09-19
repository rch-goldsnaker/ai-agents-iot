// Tool exports
export { temperatureTool, temperatureAITool } from './temperatureTool';
export { ledControlTool, ledControlAITool } from './ledControlTool';
export { sensorAttributesTool, sensorAttributesAITool } from './sensorAttributesTool';

// Types exports
export type { 
  ToolResult, 
  TemperatureToolParams,
  TemperatureToolResult,
  LedControlToolParams,
  LedControlToolResult,
  SensorAttributesToolParams,
  SensorAttributesToolResult,
  SensorAttribute,
  ToolFunction 
} from './types';

// Import for registry
import { temperatureTool, temperatureAITool } from './temperatureTool';
import { ledControlTool, ledControlAITool } from './ledControlTool';
import { sensorAttributesTool, sensorAttributesAITool } from './sensorAttributesTool';

// Tool registry for easy access
export const TOOLS = {
  getTemperature: temperatureTool,
  ledControl: ledControlTool,
  sensorAttributes: sensorAttributesTool,
} as const;

// AI SDK Tools for streamText
export const aiSDKTools = {
  getTemperature: temperatureAITool,
  controlLED: ledControlAITool,
  getSensorAttributes: sensorAttributesAITool,
} as const;

export type ToolName = keyof typeof TOOLS;