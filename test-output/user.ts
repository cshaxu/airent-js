import { LoadKey, toArrayMap, toObjectMap } from '../src';
import { UserEntityBase } from './generated/user-base.js';
import {
  UserFieldRequest,
  UserResponse,
  UserModel,
} from './generated/user-type.js';
import { ChatUserEntity } from './chat-user.js';
import { MessageEntity } from './message.js';

export class UserEntity extends UserEntityBase {
  protected initialize() {
    super.initialize();

    /** associations */

    this.chatUsersLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
      return ChatUserEntity.fromArray(loadedModels);
    };

    this.messagesLoadConfig.getter = (sources: UserEntityBase[]) => sources
      .map((one) => ({
      }));

    this.messagesLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models here */];
      return MessageEntity.fromArray(loadedModels);
    };

    this.messagesLoadConfig.setter = ((sources: UserEntity[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => one.userId, (one) => one);
      sources.forEach((one) => (one.messages = map.get('TODO: map your source entity to key') ?? []));
    }) as (sources: UserEntityBase[], targets: MessageEntity[]) => Promise<void>;

    this.hasAnyMessageLoadConfig.loader = async (keys: LoadKey[]) => {
      return [/* TODO: load associated models here */];
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
}
