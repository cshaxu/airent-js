// airent imports
import { Awaitable, Select } from '../../../src/index.js';

// entity imports
import { MessageModel } from '../../../test-sources/models.js';
import { ChatFieldRequest, ChatResponse } from './chat.js';
import { UserFieldRequest, UserResponse } from './user.js';

/** enums */

export enum SenderType { USER = "USER", CHATBOT = "CHATBOT" };

/** structs */

export type Attachment = { [key: string]: string };

export type MessageFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  chatId?: boolean;
  derivedChatId?: boolean;
  userId?: boolean;
  content?: boolean;
  attachment?: boolean;
  chat?: ChatFieldRequest;
  user?: UserFieldRequest;
  parentMessageId?: boolean;
  parentMessage?: MessageFieldRequest;
  mentorId?: boolean;
  mentor?: UserFieldRequest;
  senderType?: boolean;
};

export type MessageResponse = {
  id?: string;
  createdAt?: Date;
  chatId?: string;
  derivedChatId?: string;
  userId?: string | null;
  content?: string | null;
  attachment?: Attachment | null;
  chat?: ChatResponse;
  user?: UserResponse | null;
  parentMessageId?: string | null;
  parentMessage?: MessageResponse | null;
  mentorId?: string | null;
  mentor?: UserResponse | null;
  senderType?: SenderType;
};

export type SelectedMessageResponse<S extends MessageFieldRequest> = Select<MessageResponse, S>;
