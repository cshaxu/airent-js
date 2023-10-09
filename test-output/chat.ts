import { toArrayMap, toObjectMap, nonNull, unique } from '../../src';
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

    this.chatUsersParams.loader = async (array: ChatEntityBase[]) => {    
      const ids = unique((nonNull(array.map((one) => one.id))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return ChatUserEntity.fromArray(loadedModels);
    };

    this.messagesParams.loader = async (array: ChatEntityBase[]) => {    
      const ids = unique((nonNull(array.map((one) => one.id))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return MessageEntity.fromArray(loadedModels);
    };
  }
}
