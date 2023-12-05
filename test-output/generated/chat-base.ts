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
  ChatFieldRequest,
  ChatResponse,
  ChatModel,
} from './chat-type.js';

/** associations */
import { ChatUserEntity } from '../chat-user.js';
import { MessageEntity } from '../message.js';

export class ChatEntityBase extends BaseEntity<
  ChatModel, ChatFieldRequest, ChatResponse
> {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  /** @deprecated */
  protected chatUsers?: ChatUserEntity[];

  protected messages?: MessageEntity[];

  public constructor(
    model: ChatModel,
    group: ChatEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.deletedAt = model.deletedAt;

    this.initialize();
  }

  public static defaultFieldRequest: ChatFieldRequest = {
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  };

  public async present(request?: ChatFieldRequest | boolean): Promise<ChatResponse> {
    if (request === false) {
      throw new Error('unprocessable field request');
    }
    const fieldRequest = request === true || request === undefined
      ? ChatEntityBase.defaultFieldRequest
      : request;
    return {
      id: fieldRequest?.id ? this.id : undefined,
      createdAt: fieldRequest?.createdAt ? this.createdAt : undefined,
      updatedAt: fieldRequest?.updatedAt ? this.updatedAt : undefined,
      deletedAt: fieldRequest?.deletedAt ? this.deletedAt : undefined,
      chatUsers: fieldRequest?.chatUsers ? await this.getChatUsers().then((a) => Promise.all(a.map((one) => one.present(fieldRequest?.chatUsers)))) : undefined,
      messages: fieldRequest?.messages ? await this.getMessages().then((a) => Promise.all(a.map((one) => one.present(fieldRequest?.messages)))) : undefined,
    };
  }

  /** self loaders */

  public static async getOne<ENTITY extends ChatEntityBase>(
    this: EntityConstructor<ChatModel, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
      .then((array: ENTITY[]) => array.at(0) ?? null);
  }

  public static async getMany<ENTITY extends ChatEntityBase>(
    this: EntityConstructor<ChatModel, ENTITY>,
    keys: LoadKey[]
  ): Promise<ENTITY[]> {
    const loadedModels = [/* TODO: load entity models */];
    return (this as any).fromArray(loadedModels);
  }

  /** associations */

  /** @deprecated */
  protected chatUsersLoadConfig: LoadConfig<ChatEntityBase, ChatUserEntity> = {
    name: 'ChatEntity.chatUsers',
    filter: (one: ChatEntityBase) => one.chatUsers === undefined,
    getter: (sources: ChatEntityBase[]) => {
      return sources
        .map((one) => ({
          chatId: one.id,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models */];
    //   return ChatUserEntity.fromArray(loadedModels);
    // },
    setter: (sources: ChatEntityBase[], targets: ChatUserEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.chatId}`, (one) => one);
      sources.forEach((one) => (one.chatUsers = map.get(`${one.id}`) ?? []));
    },
  };

  /** @deprecated */
  protected async loadChatUsers(): Promise<void> {
    await this.load(this.chatUsersLoadConfig);
  }

  /** @deprecated */
  public async getChatUsers(): Promise<ChatUserEntity[]> {
    if (this.chatUsers !== undefined) {
      return this.chatUsers;
    }
    await this.loadChatUsers();
    return this.chatUsers!;
  }

  /** @deprecated */
  public setChatUsers(chatUsers?: ChatUserEntity[]): void {
    this.chatUsers = chatUsers;
  }

  protected messagesLoadConfig: LoadConfig<ChatEntityBase, MessageEntity> = {
    name: 'ChatEntity.messages',
    filter: (one: ChatEntityBase) => one.messages === undefined,
    getter: (sources: ChatEntityBase[]) => {
      return sources
        .map((one) => ({
          chatId: one.id,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models */];
    //   return MessageEntity.fromArray(loadedModels);
    // },
    setter: (sources: ChatEntityBase[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.chatId}`, (one) => one);
      sources.forEach((one) => (one.messages = map.get(`${one.id}`) ?? []));
    },
  };

  protected async loadMessages(): Promise<void> {
    await this.load(this.messagesLoadConfig);
  }

  public async getMessages(): Promise<MessageEntity[]> {
    if (this.messages !== undefined) {
      return this.messages;
    }
    await this.loadMessages();
    return this.messages!;
  }

  public setMessages(messages?: MessageEntity[]): void {
    this.messages = messages;
  }
}
