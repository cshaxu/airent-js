import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { ChatUserEntityBase } from './generated/chat-user-base.js';
import {
  ChatUserFieldRequest,
  ChatUserResponse,
  ChatUserModel,
} from './generated/chat-user-type.js';
import { ChatEntity } from './chat.js';
import { UserEntity } from './user.js';

/** @deprecated */
export class ChatUserEntity extends ChatUserEntityBase {
  protected initialize() {
    super.initialize();

    /** associations */

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load associated models */];
      return ChatEntity.fromArray(models);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load associated models */];
      return UserEntity.fromArray(models);
    };
  }
}
