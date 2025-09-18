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
import { MessageModel } from '../../test-sources/models.js';
import { ChatEntity } from './chat.js';
import { UserEntity } from './user.js';
import {
  MessageFieldRequest,
  MessageResponse,
  SelectedMessageResponse,
  Attachment,
  SenderType,
} from '../generated/types/message.js';
import { MessageEntityBase } from '../generated/entities/message.js';

export class MessageEntity extends MessageEntityBase {
  protected initialize(model: MessageModel, context: Context) {
    super.initialize(model, context);

    /** associations */

    this.chatLoadConfig.getter = (sources: MessageEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.getDerivedChatId(),
        }));
    };

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load ChatEntity models */];
      return ChatEntity.fromArray(models, this.context);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load UserEntity models */];
      return UserEntity.fromArray(models, this.context);
    };

    this.userLoadConfig.setter = ((sources: MessageEntity[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }));
      sources.forEach((one) => (one.user = (one.userId === null) ? null : map.get(JSON.stringify({ id: one.userId })) ?? null));
    }) as (sources: MessageEntityBase[], targets: UserEntity[]) => Promise<void>;

    this.parentMessageLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load MessageEntity models */];
      return MessageEntity.fromArray(models, this.context);
    };

    this.mentorLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load UserEntity models */];
      return UserEntity.fromArray(models, this.context);
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
