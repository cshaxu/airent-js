import {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  toArrayMap,
  toObjectMap,
} from '../../src';

/** generated */
import {
  MessageFieldRequest,
  MessageResponse,
  MessageModel,
  Attachment,
  SenderType,
} from './message-type.js';

/** associations */
import { ChatEntity } from '../chat.js';
import { MessageEntity } from '../message.js';
import { UserEntity } from '../user.js';

export class MessageEntityBase extends BaseEntity<
  MessageModel, MessageFieldRequest, MessageResponse
> {
  public id: string;
  public createdAt: Date;
  public chatId: string;
  public userId: string | null;
  public content: string | null;
  public attachment: Attachment | null;
  public parentMessageId: string | null;

  protected chat?: ChatEntity;

  protected user?: UserEntity | null;

  protected parentMessage?: MessageEntity | null;

  protected mentor?: UserEntity | null;

  public constructor(
    model: MessageModel,
    group: MessageEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.chatId = model.chatId;
    this.userId = model.userId;
    this.content = model.content;
    this.attachment = model.attachmentJson as Attachment | null;
    this.parentMessageId = model.parentMessageId;

    this.initialize();
  }

  public async present(fieldRequest: MessageFieldRequest): Promise<MessageResponse> {
    return {
      id: fieldRequest.id === undefined ? undefined : this.id,
      createdAt: fieldRequest.createdAt === undefined ? undefined : this.createdAt,
      chatId: fieldRequest.chatId === undefined ? undefined : this.chatId,
      derivedChatId: fieldRequest.derivedChatId === undefined ? undefined : this.getDerivedChatId(),
      userId: fieldRequest.userId === undefined ? undefined : this.userId,
      content: fieldRequest.content === undefined ? undefined : this.content,
      attachment: fieldRequest.attachment === undefined ? undefined : this.attachment,
      chat: fieldRequest.chat === undefined ? undefined : await this.getChat().then((one) => one.present(fieldRequest.chat!)),
      user: fieldRequest.user === undefined ? undefined : await this.getUser().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.user!)),
      parentMessageId: fieldRequest.parentMessageId === undefined ? undefined : this.parentMessageId,
      parentMessage: fieldRequest.parentMessage === undefined ? undefined : await this.getParentMessage().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.parentMessage!)),
      mentorId: fieldRequest.mentorId === undefined ? undefined : this.getMentorId(),
      mentor: fieldRequest.mentor === undefined ? undefined : await this.getMentor().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.mentor!)),
    };
  }

  /** associations */

  protected chatLoadConfig: LoadConfig<MessageEntityBase, ChatEntity> = {
    name: 'MessageEntity.chat',
    filter: (one: MessageEntityBase) => one.chat === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.getDerivedChatId() !== null)
        .map((one) => ({
          id: one.getDerivedChatId(),
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load ChatEntity models */];
    //   return ChatEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: ChatEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.chat = map.get(`${one.getDerivedChatId()}`)!));
    },
  };

  public async getChat(): Promise<ChatEntity> {
    if (this.chat !== undefined) {
      return this.chat;
    }
    await this.load(this.chatLoadConfig);
    return this.chat!;
  }

  public setChat(chat?: ChatEntity): void {
    this.chat = chat;
  }

  protected userLoadConfig: LoadConfig<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.user',
    filter: (one: MessageEntityBase) => one.user === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.userId !== null)
        .map((one) => ({
          id: one.userId,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load UserEntity models */];
    //   return UserEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.user = map.get(`${one.userId}`) ?? null));
    },
  };

  public async getUser(): Promise<UserEntity | null> {
    if (this.user !== undefined) {
      return this.user;
    }
    await this.load(this.userLoadConfig);
    return this.user ?? null;
  }

  public setUser(user?: UserEntity | null): void {
    this.user = user;
  }

  protected parentMessageLoadConfig: LoadConfig<MessageEntityBase, MessageEntity> = {
    name: 'MessageEntity.parentMessage',
    filter: (one: MessageEntityBase) => one.parentMessage === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.parentMessageId !== null)
        .map((one) => ({
          id: one.parentMessageId,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load MessageEntity models */];
    //   return MessageEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: MessageEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.parentMessage = map.get(`${one.parentMessageId}`) ?? null));
    },
  };

  public async getParentMessage(): Promise<MessageEntity | null> {
    if (this.parentMessage !== undefined) {
      return this.parentMessage;
    }
    await this.load(this.parentMessageLoadConfig);
    return this.parentMessage ?? null;
  }

  public setParentMessage(parentMessage?: MessageEntity | null): void {
    this.parentMessage = parentMessage;
  }

  protected mentorLoadConfig: LoadConfig<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.mentor',
    filter: (one: MessageEntityBase) => one.mentor === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.getMentorId() !== null)
        .map((one) => ({
          id: one.getMentorId(),
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load UserEntity models */];
    //   return UserEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.mentor = map.get(`${one.getMentorId()}`) ?? null));
    },
  };

  public async getMentor(): Promise<UserEntity | null> {
    if (this.mentor !== undefined) {
      return this.mentor;
    }
    await this.load(this.mentorLoadConfig);
    return this.mentor ?? null;
  }

  public setMentor(mentor?: UserEntity | null): void {
    this.mentor = mentor;
  }

  /** computed sync fields */

  public getDerivedChatId(): string | null {
    throw new Error('not implemented');
  }

  public getHasContent(): boolean {
    throw new Error('not implemented');
  }

  public getMentorId(): string | null {
    throw new Error('not implemented');
  }
}
