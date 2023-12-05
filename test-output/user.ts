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
      const loadedModels = [/* TODO: load associated models */];
      return ChatUserEntity.fromArray(loadedModels);
    };

    this.messagesLoadConfig.getter = (sources: UserEntityBase[]) => {
      return sources
        .map((one) => ({
        }));
    };

    this.messagesLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models */];
      return MessageEntity.fromArray(loadedModels);
    };

    this.messagesLoadConfig.setter = ((sources: UserEntity[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.userId}`, (one) => one);
      sources.forEach((one) => (one.messages = map.get('TODO: map your source entity to key') ?? []));
    }) as (sources: UserEntityBase[], targets: MessageEntity[]) => Promise<void>;

    this.hasAnyMessageLoadConfig.getter = (sources: UserEntityBase[]) => {
      return sources
        .map((one) => ({
        }));
    };

    this.hasAnyMessageLoadConfig.loader = async (keys: LoadKey[]) => {
      return [/* TODO: load associated models */];
    };

    this.hasAnyMessageLoadConfig.setter = ((sources: UserEntity[], targets: boolean[]) => {
      const map = toObjectMap(targets, (one) => 'TODO: map your target entity to key', (one) => one);
      sources.forEach((one) => (one.hasAnyMessage = map.get('TODO: map your source entity to key')!));
    }) as (sources: UserEntityBase[], targets: boolean[]) => Promise<void>;
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
