// Tool exports
export { temperatureTool } from './temperatureTool';
export { ledControlTool } from './ledControlTool';
export { sensorAttributesTool } from './sensorAttributesTool';

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
import { temperatureTool } from './temperatureTool';
import { ledControlTool } from './ledControlTool';
import { sensorAttributesTool } from './sensorAttributesTool';

// Tool registry for easy access
export const TOOLS = {
  getTemperature: temperatureTool,
  ledControl: ledControlTool,
  sensorAttributes: sensorAttributesTool,
} as const;

export type ToolName = keyof typeof TOOLS;