import { UIMessage } from 'ai';

export interface AgentContext {
  messages: UIMessage[];
  userQuery: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  nextAgent?: string;
}

export type AgentType = 'orchestrator' | 'temperatureProvider' | 'ledControlProvider' | 'sensorAttributesProvider' | 'responseFormatter';