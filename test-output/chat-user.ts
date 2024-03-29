import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { ChatUserEntityBase } from './generated/chat-user-base.js';
import {
  ChatUserFieldRequest,
  ChatUserResponse,
  SelectedChatUserResponse,
  ChatUserModel,
} from './generated/chat-user-type.js';
import { ChatEntity } from './chat.js';
import { UserEntity } from './user.js';

/** @deprecated */
export class ChatUserEntity extends ChatUserEntityBase {
  protected initialize(model: ChatUserModel) {
    super.initialize(model);

    /** associations */

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load ChatEntity models */];
      return ChatEntity.fromArray(models);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load UserEntity models */];
      return UserEntity.fromArray(models);
    };
  }
}
