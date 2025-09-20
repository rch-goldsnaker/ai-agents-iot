'use client';

/*
 * AI-IoT Chat Interface
 * 
 * This component implements a chat interface with generative UI for IoT devices.
 * It integrates with ThingsBoard for sensor data and device control, providing
 * enhanced visual interfaces for different types of tool outputs.
 * 
 * Key Features:
 * - Chat interface with AI assistant powered by OpenAI GPT-4o
 * - IoT tools integration (temperature sensors, LED control, device management)
 * - Generative UI: Custom visual components for tool outputs
 * - Responsive design with glassmorphism effects
 * - Real-time sensor data display with beautiful temperature UI
 */

// Type definitions for tool outputs
interface ToolPart {
  type: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  output?: unknown;
}

interface TemperatureToolOutput {
  temperature: string | number;
  unit?: string;
  timestamp?: string;
  sensorId?: string;
  source?: string;
}

interface LedControlToolOutput {
  ledState: boolean;
  message?: string;
  timestamp?: string;
  entityId?: string;
}

interface SensorAttribute {
  lastUpdateTs: number;
  key: string;
  value: string | number | boolean;
  timestamp: string;
}

interface SensorAttributesToolOutput {
  entityId?: string;
  attributes?: SensorAttribute[];
  attributeCount?: number;
  summary?: Record<string, unknown>;
  message?: string;
  timestamp?: string;
}

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { MessageAvatar } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Action,
  Actions
} from '@/components/ai-elements/actions';
import { Fragment, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { TemperatureUI } from '@/components/ai-elements/temperature-ui';
import { LedControlUI } from '@/components/ai-elements/led-control-ui';
import { SensorStatusUI } from '@/components/ai-elements/sensor-status-ui';

const models = [
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      },
    );
    setInput('');
  };

  return (
    <div className="w-full h-full flex flex-col px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4">
      <div className="flex flex-col h-full bg-gray-800/20 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-gray-700/30 glassmorphism-chat shadow-2xl p-2 sm:p-4 lg:p-6 gap-2 sm:gap-4 max-w-7xl mx-auto w-full">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      function regenerate(): void {
                        throw new Error('Function not implemented.');
                      }

                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            {message.role === 'assistant' && (
                              <MessageAvatar
                                src=""
                                name="AI"
                              />
                            )}
                            <MessageContent>
                              <Response>
                                {part.text}
                              </Response>
                            </MessageContent>
                            {message.role === 'user' && (
                              <MessageAvatar
                                src=""
                                name="User"
                              />
                            )}
                          </Message>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    case 'tool-call':
                      return (
                        <Tool
                          key={`${message.id}-${i}`}
                          defaultOpen={part.state === 'output-available' || part.state === 'output-error'}
                        >
                          <ToolHeader type={part.type} state={part.state} />
                          <ToolContent>
                            {/* Show input parameters when tool is running or completed */}
                            {(part.state === 'input-available' || part.state === 'output-available' || part.state === 'output-error') && (
                              <ToolInput input={part.input} />
                            )}
                            {/* Show successful output */}
                            {part.state === 'output-available' && (
                              <ToolOutput
                                output={part.output}
                                errorText={undefined}
                              />
                            )}
                            {/* Show error output */}
                            {part.state === 'output-error' && (
                              <ToolOutput
                                output={undefined}
                                errorText={part.errorText}
                              />
                            )}
                          </ToolContent>
                        </Tool>
                      );
                    default:
                      // Handle dynamic tool calls (e.g., 'tool-getTemperature', 'tool-controlLed')
                      // This enables generative UI for IoT tools by providing custom interfaces
                      if (part.type.startsWith('tool-')) {
                        const toolPart = part as ToolPart;
                        return (
                          <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                            <ToolHeader type={part.type as `tool-${string}`} state={toolPart.state || "output-available"} />
                            <ToolContent>
                              {/* Standard tool result display - shows raw JSON output */}
                              <div className="p-4">
                                <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2">
                                  Tool Result
                                </h4>
                                <div className="rounded-md bg-muted/50 p-3">
                                  <pre className="text-xs overflow-auto max-h-40">
                                    {JSON.stringify(toolPart.output, null, 2)}
                                  </pre>
                                </div>
                              </div>
                              
                              {/* Generative UI: Enhanced display for temperature sensor data */}
                              {part.type === 'tool-getTemperature' && (toolPart.output as TemperatureToolOutput)?.temperature && (
                                <div className="px-4 pb-4">
                                  <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-3">
                                    Temperature Display
                                  </h4>
                                  <TemperatureUI 
                                    data={{
                                      temperature: String((toolPart.output as TemperatureToolOutput).temperature),
                                      unit: (toolPart.output as TemperatureToolOutput).unit || '°C',
                                      timestamp: (toolPart.output as TemperatureToolOutput).timestamp || new Date().toISOString(),
                                      sensorId: (toolPart.output as TemperatureToolOutput).sensorId || 'Unknown',
                                      source: (toolPart.output as TemperatureToolOutput).source || 'IoT Sensor'
                                    }}
                                  />
                                </div>
                              )}

                              {/* Generative UI: Enhanced display for LED control */}
                              {part.type === 'tool-controlLED' && (toolPart.output as LedControlToolOutput)?.ledState !== undefined && (
                                <div className="px-4 pb-4">
                                  <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-3">
                                    LED Control Interface
                                  </h4>
                                  <LedControlUI 
                                    data={{
                                      ledState: (toolPart.output as LedControlToolOutput).ledState,
                                      message: (toolPart.output as LedControlToolOutput).message || `LED ${(toolPart.output as LedControlToolOutput).ledState ? 'turned ON' : 'turned OFF'}`,
                                      timestamp: (toolPart.output as LedControlToolOutput).timestamp || new Date().toISOString(),
                                      entityId: (toolPart.output as LedControlToolOutput).entityId || 'Unknown'
                                    }}
                                  />
                                </div>
                              )}

                              {/* Generative UI: Enhanced display for sensor status and attributes */}
                              {part.type === 'tool-getSensorAttributes' && (toolPart.output as SensorAttributesToolOutput)?.attributes && (
                                <div className="px-4 pb-4">
                                  <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-3">
                                    Sensor Status Dashboard
                                  </h4>
                                  <SensorStatusUI 
                                    data={{
                                      entityId: (toolPart.output as SensorAttributesToolOutput).entityId || 'Unknown',
                                      attributes: (toolPart.output as SensorAttributesToolOutput).attributes || [],
                                      attributeCount: (toolPart.output as SensorAttributesToolOutput).attributeCount || 0,
                                      summary: (toolPart.output as SensorAttributesToolOutput).summary || {},
                                      message: (toolPart.output as SensorAttributesToolOutput).message || 'Sensor data retrieved',
                                      timestamp: (toolPart.output as SensorAttributesToolOutput).timestamp || new Date().toISOString()
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* TODO: Add more generative UI components for other IoT tools
                                  - Environmental dashboard combining temperature, LED status, etc.
                                  - Real-time monitoring interface
                                  - Device control panel
                              */}
                            </ToolContent>
                          </Tool>
                        );
                      }
                      if (part.type === 'step-start') {
                        if (status === 'streaming' && message.id === messages.at(-1)?.id) {
                          return (
                            <div key={`${message.id}-${i}`} className="text-sm text-gray-500 mb-2 italic">
                              🔄 Processing...
                            </div>
                          );
                        }
                        return null;
                      }
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="flex-shrink-0" globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar className="flex flex-row gap-1.5 sm:gap-3 items-center justify-between">
            <PromptInputTools className="flex flex-wrap gap-0.5 sm:gap-1 items-center justify-start flex-1">
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch(!webSearch)}
                className="text-xs px-1.5 sm:px-2"
              >
                <GlobeIcon className="w-3 h-3" />
                <span className="hidden lg:inline text-xs">Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger className="w-auto min-w-[80px] sm:min-w-[90px] text-xs">
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit 
              disabled={!input && !status} 
              status={status}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm flex-shrink-0"
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;