import {
  AsyncLock,
  BaseEntity,
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
import { UserEntity } from '../user.js';
import { MessageEntity } from '../message.js';

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

  public static defaultFieldRequest: MessageFieldRequest = {
    id: true,
    createdAt: true,
    chatId: true,
    derivedChatId: true,
    userId: true,
    content: true,
    attachment: true,
    parentMessageId: true,
    mentorId: true,
  };

  public async present(request?: MessageFieldRequest | boolean): Promise<MessageResponse> {
    if (request === false) {
      throw new Error('unprocessable field request');
    }
    const fieldRequest = request === true || request === undefined
      ? MessageEntityBase.defaultFieldRequest
      : request;
    return {
      id: fieldRequest?.id ? this.id : undefined,
      createdAt: fieldRequest?.createdAt ? this.createdAt : undefined,
      chatId: fieldRequest?.chatId ? this.chatId : undefined,
      derivedChatId: fieldRequest?.derivedChatId ? this.getDerivedChatId() : undefined,
      userId: fieldRequest?.userId ? this.userId : undefined,
      content: fieldRequest?.content ? this.content : undefined,
      attachment: fieldRequest?.attachment ? this.attachment : undefined,
      chat: fieldRequest?.chat ? await this.getChat().then((one) => one.present(fieldRequest?.chat)) : undefined,
      user: fieldRequest?.user ? await this.getUser().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest?.user)) : undefined,
      parentMessageId: fieldRequest?.parentMessageId ? this.parentMessageId : undefined,
      parentMessage: fieldRequest?.parentMessage ? await this.getParentMessage().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest?.parentMessage)) : undefined,
      mentorId: fieldRequest?.mentorId ? this.getMentorId() : undefined,
      mentor: fieldRequest?.mentor ? await this.getMentor().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest?.mentor)) : undefined,
    };
  }

  /** associations */

  protected chatLoadConfig: LoadConfig<MessageEntityBase, ChatEntity> = {
    name: 'MessageEntity.chat',
    filter: (one: MessageEntityBase) => one.chat === undefined,
    getter: (sources: MessageEntityBase[]) => sources
      .filter((one) => one.getDerivedChatId() !== null)
      .map((one) => ({
        id: one.getDerivedChatId(),
      })),
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models */];
    //   return ChatEntity.fromArray(loadedModels);
    // },
    setter: (sources: MessageEntityBase[], targets: ChatEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.chat = map.get(`${one.getDerivedChatId()}`)!));
    },
  };

  protected async loadChat(): Promise<void> {
    await this.load(this.chatLoadConfig);
  }

  public async getChat(): Promise<ChatEntity> {
    if (this.chat !== undefined) {
      return this.chat;
    }
    await this.loadChat();
    return this.chat!;
  }

  public setChat(chat?: ChatEntity): void {
    this.chat = chat;
  }

  protected userLoadConfig: LoadConfig<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.user',
    filter: (one: MessageEntityBase) => one.user === undefined,
    getter: (sources: MessageEntityBase[]) => sources
      .filter((one) => one.userId !== null)
      .map((one) => ({
        id: one.userId,
      })),
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models */];
    //   return UserEntity.fromArray(loadedModels);
    // },
    setter: (sources: MessageEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.user = map.get(`${one.userId}`) ?? null));
    },
  };

  protected async loadUser(): Promise<void> {
    await this.load(this.userLoadConfig);
  }

  public async getUser(): Promise<UserEntity | null> {
    if (this.user !== undefined) {
      return this.user;
    }
    await this.loadUser();
    return this.user ?? null;
  }

  public setUser(user?: UserEntity | null): void {
    this.user = user;
  }

  protected parentMessageLoadConfig: LoadConfig<MessageEntityBase, MessageEntity> = {
    name: 'MessageEntity.parentMessage',
    filter: (one: MessageEntityBase) => one.parentMessage === undefined,
    getter: (sources: MessageEntityBase[]) => sources
      .filter((one) => one.parentMessageId !== null)
      .map((one) => ({
        id: one.parentMessageId,
      })),
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models */];
    //   return MessageEntity.fromArray(loadedModels);
    // },
    setter: (sources: MessageEntityBase[], targets: MessageEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.parentMessage = map.get(`${one.parentMessageId}`) ?? null));
    },
  };

  protected async loadParentMessage(): Promise<void> {
    await this.load(this.parentMessageLoadConfig);
  }

  public async getParentMessage(): Promise<MessageEntity | null> {
    if (this.parentMessage !== undefined) {
      return this.parentMessage;
    }
    await this.loadParentMessage();
    return this.parentMessage ?? null;
  }

  public setParentMessage(parentMessage?: MessageEntity | null): void {
    this.parentMessage = parentMessage;
  }

  protected mentorLoadConfig: LoadConfig<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.mentor',
    filter: (one: MessageEntityBase) => one.mentor === undefined,
    getter: (sources: MessageEntityBase[]) => sources
      .filter((one) => one.getMentorId() !== null)
      .map((one) => ({
        id: one.getMentorId(),
      })),
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models */];
    //   return UserEntity.fromArray(loadedModels);
    // },
    setter: (sources: MessageEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.mentor = map.get(`${one.getMentorId()}`) ?? null));
    },
  };

  protected async loadMentor(): Promise<void> {
    await this.load(this.mentorLoadConfig);
  }

  public async getMentor(): Promise<UserEntity | null> {
    if (this.mentor !== undefined) {
      return this.mentor;
    }
    await this.loadMentor();
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
