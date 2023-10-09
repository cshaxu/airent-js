import { toArrayMap, toObjectMap, nonNull, unique } from '../../src';
import { ChatUserEntityBase } from './generated/chat-user-base.js';
import {
  ChatUserFieldRequest,
  ChatUserResponse,
  ChatUserModel,
} from './generated/chat-user-type.js';
import { UserEntity } from './user.js';
import { ChatEntity } from './chat.js';

/** @deprecated */
export class ChatUserEntity extends ChatUserEntityBase {
  protected initialize() {
    super.initialize();

    /** associations */

    this.chatParams.loader = async (array: ChatUserEntityBase[]) => {    
      const chatIds = unique((nonNull(array.map((one) => one.chatId))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return ChatEntity.fromArray(loadedModels);
    };

    this.userParams.loader = async (array: ChatUserEntityBase[]) => {    
      const userIds = unique((nonNull(array.map((one) => one.userId))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return UserEntity.fromArray(loadedModels);
    };
  }
}
