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
      const loadedModels = [/* TODO: load associated models with the above keys */];
      return ChatEntity.fromArray(loadedModels);
    };

    this.userParams.loader = async (array: MessageEntityBase[]) => {
      const userIds = unique((nonNull(array.map((one) => one.userId))));
      const loadedModels = [/* TODO: load associated models with the above keys */];
      return UserEntity.fromArray(loadedModels);
    };

    this.parentMessageParams.loader = async (array: MessageEntityBase[]) => {
      const parentMessageIds = unique((nonNull(array.map((one) => one.parentMessageId))));
      const loadedModels = [/* TODO: load associated models with the above keys */];
      return MessageEntity.fromArray(loadedModels);
    };

    this.mentorParams.loader = async (array: MessageEntityBase[]) => {
      const mentorIds = unique((nonNull(array.map((one) => one.getMentorId()))));
      const loadedModels = [/* TODO: load associated models with the above keys */];
      return UserEntity.fromArray(loadedModels);
    };
  }

  /** computed sync fields */

  public getHasContent(): boolean {
    throw new Error('not implemented');
  }

  public getMentorId(): string | null {
    throw new Error('not implemented');
  }
}
