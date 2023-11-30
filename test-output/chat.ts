import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { ChatEntityBase } from './generated/chat-base.js';
import {
  ChatFieldRequest,
  ChatResponse,
  ChatModel,
} from './generated/chat-type.js';
import { ChatUserEntity } from './chat-user.js';
import { MessageEntity } from './message.js';

export class ChatEntity extends ChatEntityBase {
  protected initialize() {
    super.initialize();

    /** associations */

    this.chatUsersLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models */];
      return ChatUserEntity.fromArray(loadedModels);
    };

    this.messagesLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models */];
      return MessageEntity.fromArray(loadedModels);
    };
  }
}
