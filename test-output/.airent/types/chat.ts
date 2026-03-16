// airent imports
import { Awaitable, Select } from '../../../src/index.js';

// entity imports
import { MessageFieldRequest, MessageResponse } from './message.js';
import { ChatUserFieldRequest, ChatUserResponse } from './chat-user.js';

/** structs */

export type ChatModel = { [key: string]: any };

export type ChatFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  deletedAt?: boolean;
  /** @deprecated */
  chatUsers?: ChatUserFieldRequest;
  messages?: MessageFieldRequest;
  flags?: boolean;
};

export type ChatResponse = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  /** @deprecated */
  chatUsers?: ChatUserResponse[];
  messages?: MessageResponse[];
  flags?: string[];
};

export type SelectedChatResponse<S extends ChatFieldRequest> = Select<ChatResponse, S>;
