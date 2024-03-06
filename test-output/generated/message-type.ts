import { Select } from '../../src';
import { ChatFieldRequest, ChatResponse } from './chat-type.js';
import { UserFieldRequest, UserResponse } from './user-type.js';

/** enums */

export enum SenderType { USER = "USER", CHATBOT = "CHATBOT" };

/** structs */

export type MessageModel = { [key: string]: any };

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
};

export type SelectedMessageResponse<S extends MessageFieldRequest> = Select<MessageResponse, S>;
