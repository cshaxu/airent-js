import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { ChatEntityBase } from './generated/chat-base.js';
import {
  ChatFieldRequest,
  ChatResponse,
  ChatModel,
} from './generated/chat-type.js';
import { MessageEntity } from './message.js';
import { ChatUserEntity } from './chat-user.js';

export class ChatEntity extends ChatEntityBase {
  protected initialize() {
    super.initialize();

    /** associations */

    this.chatUsersLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load ChatUserEntity models */];
      return ChatUserEntity.fromArray(models);
    };

    this.messagesLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load MessageEntity models */];
      return MessageEntity.fromArray(models);
    };
  }
}
