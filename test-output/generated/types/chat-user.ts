// airent imports
import { Awaitable, Select } from '../../../src/index.js';

// entity imports
import { ChatFieldRequest, ChatResponse } from './chat.js';
import { UserFieldRequest, UserResponse } from './user.js';

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
  roles?: boolean;
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
  roles?: ChatUserRole[];
};

/** @deprecated */
export type SelectedChatUserResponse<S extends ChatUserFieldRequest> = Select<ChatUserResponse, S>;
