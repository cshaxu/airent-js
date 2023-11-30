import { LoadKey, toArrayMap, toObjectMap } from '../../src';
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

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
      return ChatEntity.fromArray(loadedModels);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
      return UserEntity.fromArray(loadedModels);
    };

    this.parentMessageLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
      return MessageEntity.fromArray(loadedModels);
    };

    this.mentorLoadConfig.loader = async (keys: LoadKey[]) => {
      const loadedModels = [/* TODO: load associated models with load keys */];
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
