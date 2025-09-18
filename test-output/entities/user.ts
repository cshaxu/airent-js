// airent imports
import {
  AsyncLock,
  Awaitable,
  LoadConfig,
  LoadKey,
  Select,
  batch,
  clone,
  sequential,
  toArrayMap,
  toObjectMap,
} from '../../src/index.js';

// config imports
import { Context } from '../../test-sources/context.js';

// entity imports
import { UserModel } from '../../test-sources/models.js';
import { MessageEntity } from './message.js';
import { ChatUserEntity } from './chat-user.js';
import {
  UserFieldRequest,
  UserResponse,
  SelectedUserResponse,
} from '../generated/types/user.js';
import { UserEntityBase } from '../generated/entities/user.js';

export class UserEntity extends UserEntityBase {
  protected initialize(model: UserModel, context: Context) {
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
