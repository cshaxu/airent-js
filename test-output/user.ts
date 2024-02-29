import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { UserEntityBase } from './generated/user-base.js';
import {
  UserFieldRequest,
  UserResponse,
  UserModel,
} from './generated/user-type.js';
import { MessageEntity } from './message.js';
import { ChatUserEntity } from './chat-user.js';

export class UserEntity extends UserEntityBase {
  protected initialize(model: UserModel) {
    super.initialize(model);

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

  /** computed sync fields */

  public getIsAdmin(): boolean {
    throw new Error('not implemented');
  }

  /** computed async fields */

  /** @deprecated */
  public async getFirstMessage(): Promise<MessageEntity | null> {
    throw new Error('not implemented');
  }

  public async getHasAnyMessage(): Promise<boolean> {
    throw new Error('not implemented');
  }
}
