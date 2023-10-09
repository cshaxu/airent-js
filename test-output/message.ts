import { toArrayMap, toObjectMap, nonNull, unique } from '../../src';
import { MessageEntityBase } from './generated/message-base.js';
import {
  MessageFieldRequest,
  MessageResponse,
  MessageModel,
  Attachment,
  SenderType,
} from './generated/message-type.js';
import { ChatEntity } from './chat.js';
import { UserEntity } from './user.js';

export class MessageEntity extends MessageEntityBase {
  protected initialize() {
    super.initialize();

    /** associations */

    this.chatParams.loader = async (array: MessageEntityBase[]) => {    
      const chatIds = unique((nonNull(array.map((one) => one.chatId))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return ChatEntity.fromArray(loadedModels);
    };

    this.userParams.loader = async (array: MessageEntityBase[]) => {    
      const userIds = unique((nonNull(array.map((one) => one.userId))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return UserEntity.fromArray(loadedModels);
    };

    this.parentMessageParams.loader = async (array: MessageEntityBase[]) => {    
      const parentMessageIds = unique((nonNull(array.map((one) => one.parentMessageId))));
      // TODO: load models with the above keys
      const loadedModels = [];
      return MessageEntity.fromArray(loadedModels);
    };
  }

  /** computed sync fields */

    public getHasContent(): boolean {
    throw new Error('not implemented');
  }
}
