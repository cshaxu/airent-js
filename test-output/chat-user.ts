import { LoadKey, toArrayMap, toObjectMap, nonNull, unique } from '../../src';
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

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
      return ChatEntity.fromArray(loadedModels);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
      return UserEntity.fromArray(loadedModels);
    };
  }
}
