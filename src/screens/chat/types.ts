export type ToolCallContent = {
  type: 'toolCall'
  id?: string
  name?: string
  arguments?: Record<string, unknown>
  partialJson?: string
}

export type ToolResultContent = {
  type: 'toolResult' | 'tool_result'
  toolCallId?: string
  toolName?: string
  content?: Array<{ type?: string; text?: string }>
  details?: Record<string, unknown>
  isError?: boolean
}

export type TextContent = {
  type: 'text'
  text?: string
  textSignature?: string
}

export type ThinkingContent = {
  type: 'thinking'
  thinking?: string
  thinkingSignature?: string
}

export type MessageContent =
  | TextContent
  | ToolCallContent
  | ToolResultContent
  | ThinkingContent

export type ChatAttachment = {
  id?: string
  name?: string
  contentType?: string
  size?: number
  url?: string
  dataUrl?: string
  previewUrl?: string
  width?: number
  height?: number
}

export type StreamingStatus = 'idle' | 'streaming' | 'complete' | 'error' | 'interrupted'

export type StreamToolCall = {
  id: string
  name: string
  phase: string
  args?: unknown
  preview?: string
  result?: string
}

export type ChatMessage = {
  role?: string
  content?: Array<MessageContent>
  /** Simple text shortcut (used by some server variants) */
  text?: string
  /** Alternative text body field used in some code paths */
  body?: string
  /** Alternative message field used in some code paths */
  message?: string
  attachments?: Array<ChatAttachment>
  toolCallId?: string
  toolName?: string
  details?: Record<string, unknown>
  isError?: boolean
  timestamp?: number
  /** Client-side optimistic ID — set for messages that haven't been confirmed by the server yet */
  __optimisticId?: string
  /** Client-side creation timestamp for optimistic messages */
  __createdAt?: number
  __streamingStatus?: StreamingStatus
  __streamingText?: string
  __streamingThinking?: string
  /** Real-time sequence number assigned by the chat store */
  __realtimeSequence?: number
  /** Source of the message (e.g. 'webchat', 'signal', 'telegram') */
  __realtimeSource?: string
  /** Timestamp when the message was received by the client */
  __receiveTime?: number
  /** Stream tool calls embedded on completed messages for pill rendering */
  __streamToolCalls?: Array<StreamToolCall>
  /** Alias for __streamToolCalls used by some code paths */
  streamToolCalls?: Array<StreamToolCall>
  /** Exec notification parsed from user messages */
  __execNotification?: Record<string, unknown>
  /** Flag marking assistant messages as narration-only (intermediate tool responses) */
  __isNarration?: boolean
  /** Legacy / server-variant ID fields */
  id?: string
  messageId?: string
  clientId?: string
  /** Server-variant snake_case client ID */
  client_id?: string
  /** Status for optimistic message tracking */
  status?: 'sending' | 'queued' | 'sent' | 'done' | 'error' | string
  /** Run ID associated with this message */
  runId?: string
  /** Legacy inline images field */
  inlineImages?: Array<unknown>
  /** Server-side timestamp fields (camelCase and snake_case variants) */
  createdAt?: number | string
  created_at?: number | string
  time?: number | string
  ts?: number | string
  /** History order index used for merge ordering in the chat store */
  historyIndex?: number
  /** Internal history index for persisted order hints */
  __historyIndex?: number
}

export type SessionTitleStatus = 'idle' | 'generating' | 'ready' | 'error'
export type SessionTitleSource = 'auto' | 'manual'

export type SessionSummary = {
  key?: string
  label?: string
  title?: string
  derivedTitle?: string
  updatedAt?: number
  lastMessage?: ChatMessage | null
  friendlyId?: string
  titleStatus?: SessionTitleStatus
  titleSource?: SessionTitleSource
  titleError?: string | null
  preview?: string | null
}

export type SessionListResponse = {
  sessions?: Array<SessionSummary>
}

export type HistoryResponse = {
  sessionKey: string
  sessionId?: string
  messages: Array<ChatMessage>
}

export type SessionMeta = {
  key: string
  friendlyId: string
  title?: string
  derivedTitle?: string
  label?: string
  updatedAt?: number
  lastMessage?: ChatMessage | null
  titleStatus?: SessionTitleStatus
  titleSource?: SessionTitleSource
  titleError?: string | null
  preview?: string | null
}

export type PathsPayload = {
  agentId: string
  stateDir: string
  sessionsDir: string
  storePath: string
}
