import { ChatFieldRequest, ChatResponse } from './chat-type.js';
import { UserFieldRequest, UserResponse } from './user-type.js';

/** enums */

export enum SenderType { USER = "USER", CHATBOT = "CHATBOT" };

/** structs */

export type MessageModel = { [key: string] : any };

export type Attachment = { [key: string] : string };

export type MessageFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  chatId?: boolean;
  userId?: boolean;
  content?: boolean;
  attachment?: boolean;
  chat?: ChatFieldRequest | boolean;
  user?: UserFieldRequest | boolean;
  parentMessageId?: boolean;
  parentMessage?: MessageFieldRequest | boolean;
};

export type MessageResponse = {
  id?: string;
  createdAt?: Date;
  chatId?: string;
  userId?: string | null;
  content?: string | null;
  attachment?: Attachment | null;
  chat?: ChatResponse;
  user?: UserResponse | null;
  parentMessageId?: string | null;
  parentMessage?: MessageResponse | null;
};
