// airent imports
import {
  AsyncLock,
  Awaitable,
  LoadConfig,
  LoadKey,
  Select,
  batch,
  sequential,
  toArrayMap,
  toObjectMap,
} from '../../src/index.js';

// config imports
import { Context } from '../../test-sources/context.js';

// entity imports
import { MessageEntity } from './message.js';
import { ChatUserEntity } from './chat-user.js';
import {
  ChatFieldRequest,
  ChatResponse,
  SelectedChatResponse,
  ChatModel,
} from '../generated/types/chat.js';
import { ChatEntityBase } from '../generated/entities/chat.js';

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
