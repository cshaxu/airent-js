// airent imports
import { Select } from '../../../src/index.js';

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
};

export type ChatResponse = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  /** @deprecated */
  chatUsers?: ChatUserResponse[];
  messages?: MessageResponse[];
};

export type SelectedChatResponse<S extends ChatFieldRequest> = Select<ChatResponse, S>;
