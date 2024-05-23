import { Select } from '../../src/index.js';
import { ChatFieldRequest, ChatResponse } from './chat-type.js';
import { UserFieldRequest, UserResponse } from './user-type.js';

/** enums */

export enum ChatUserRole { USER = 'USER', ASSISTANT = 'ASSISTANT' };

/** structs */

/** @deprecated */
export type ChatUserModel = { [key: string]: any };

/** @deprecated */
export type ChatUserFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  /** @deprecated */
  updatedAt?: boolean;
  chatId?: boolean;
  userId?: boolean;
  chat?: ChatFieldRequest;
  user?: UserFieldRequest;
};

/** @deprecated */
export type ChatUserResponse = {
  id?: string;
  createdAt?: Date;
  /** @deprecated */
  updatedAt?: Date;
  chatId?: string;
  userId?: string;
  chat?: ChatResponse;
  user?: UserResponse;
};

/** @deprecated */
export type SelectedChatUserResponse<S extends ChatUserFieldRequest> = Select<ChatUserResponse, S>;
