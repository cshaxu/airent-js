// airent imports
import { LoadKey, toArrayMap, toObjectMap } from '../src/index.js';

// config imports
import { Context } from '../test-resources/context.js';

// entity imports
import { UserModel } from '../test-resources/models.js';
import { MessageEntity } from './message.js';
import { ChatUserEntity } from './chat-user.js';
import {
  UserFieldRequest,
  UserResponse,
  SelectedUserResponse,
} from './generated/user-type.js';
import { UserEntityBase } from './generated/user-base.js';

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
