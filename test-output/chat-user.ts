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
      const loadedModels = [/* TODO: load associated models with the above keys */];
      return ChatEntity.fromArray(loadedModels);
    };

    this.userParams.loader = async (array: ChatUserEntityBase[]) => { 
      const userIds = unique((nonNull(array.map((one) => one.userId))));
      const loadedModels = [/* TODO: load associated models with the above keys */];
      return UserEntity.fromArray(loadedModels);
    };
  }
}
