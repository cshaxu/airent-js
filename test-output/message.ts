import { LoadKey, toArrayMap, toObjectMap } from '../src';
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
  protected initialize(model: MessageModel) {
    super.initialize(model);

    /** associations */

    this.chatLoadConfig.getter = (sources: MessageEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.getDerivedChatId(),
        }));
    };

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load ChatEntity models */];
      return ChatEntity.fromArray(models);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load UserEntity models */];
      return UserEntity.fromArray(models);
    };

    this.userLoadConfig.setter = ((sources: MessageEntity[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.user = (one.userId === null) ? null : map.get(`${one.userId}`) ?? null));
    }) as (sources: MessageEntityBase[], targets: UserEntity[]) => Promise<void>;

    this.parentMessageLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load MessageEntity models */];
      return MessageEntity.fromArray(models);
    };

    this.mentorLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load UserEntity models */];
      return UserEntity.fromArray(models);
    };
  }

  /** computed sync fields */

  public getDerivedChatId(): string {
    throw new Error('not implemented');
  }

  public getHasContent(): boolean {
    throw new Error('not implemented');
  }

  public getMentorId(): string | null {
    throw new Error('not implemented');
  }
}
