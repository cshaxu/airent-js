import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { Context } from '../test-resources/context.js';
import { ChatEntityBase } from './generated/chat-base.js';
import {
  ChatFieldRequest,
  ChatResponse,
  SelectedChatResponse,
  ChatModel,
} from './generated/chat-type.js';
import { MessageEntity } from './message.js';
import { ChatUserEntity } from './chat-user.js';

export class ChatEntity extends ChatEntityBase {
  protected initialize(model: ChatModel, context: Context) {
    super.initialize(model, context);

    /** associations */

    this.chatUsersLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load ChatUserEntity models */];
      return ChatUserEntity.fromArray(models, this.context);
    };

    this.messagesLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load MessageEntity models */];
      return MessageEntity.fromArray(models, this.context);
    };
  }
}
