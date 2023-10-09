import { toArrayMap, toObjectMap, nonNull, unique } from '../../src';
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

    this.chatUsersParams.loader = async (array: UserEntityBase[]) => {    
      const ids = unique((nonNull(array.map((one) => one.id))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return ChatUserEntity.fromArray(loadedModels);
    };

    this.messagesParams.loader = async (array: UserEntityBase[]) => {    
      const ids = unique((nonNull(array.map((one) => one.id))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return MessageEntity.fromArray(loadedModels);
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
