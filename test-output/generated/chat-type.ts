import { ChatUserFieldRequest, ChatUserResponse } from './chat-user-type.js';
import { MessageFieldRequest, MessageResponse } from './message-type.js';

/** structs */

export type ChatModel = { [key: string]: any };

export type ChatFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  deletedAt?: boolean;
  /** @deprecated */
  chatUsers?: ChatUserFieldRequest | boolean;
  messages?: MessageFieldRequest | boolean;
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
