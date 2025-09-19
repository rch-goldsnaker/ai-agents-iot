export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface TemperatureToolParams {
  entityId?: string;
  keys?: string;
  useStrictDataTypes?: boolean;
}

export interface TemperatureToolResult {
  temperature: string;
  unit: string;
  source: string;
  sensorId: string;
  message: string;
  timestamp?: string;
  allSensorData?: Record<string, { value: string; timestamp: string; rawTimestamp: number }>;
}

export interface LedControlToolParams {
  entityId?: string;
  ledState: boolean;
}

export interface LedControlToolResult {
  success: boolean;
  ledState: boolean;
  entityId: string;
  message: string;
  timestamp: string;
}

export interface SensorAttributesToolParams {
  entityId?: string;
}

export interface SensorAttribute {
  lastUpdateTs: number;
  key: string;
  value: string | number | boolean;
  timestamp: string; // ISO formatted timestamp
}

export interface SensorAttributesToolResult {
  entityId: string;
  attributes: SensorAttribute[];
  attributeCount: number;
  message: string;
  timestamp: string;
  summary: {
    macAddress?: string;
    localIp?: string;
    ssid?: string;
    rssi?: number;
    ledState?: boolean;
    ledMode?: number;
    active?: boolean;
  };
}

export type ToolFunction<TParams = Record<string, unknown>, TResult = unknown> = (
  params: TParams
) => Promise<ToolResult<TResult>>;