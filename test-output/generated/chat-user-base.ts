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
  ChatUserFieldRequest,
  ChatUserResponse,
  ChatUserModel,
} from './chat-user-type.js';

/** associations */
import { UserEntity } from '../user.js';
import { ChatEntity } from '../chat.js';

/** @deprecated */
export class ChatUserEntityBase extends BaseEntity<
  ChatUserModel, ChatUserFieldRequest, ChatUserResponse
> {
  public id: string;
  public createdAt: Date;
  /** @deprecated */
  public updatedAt: Date;
  public chatId: string;
  public userId: string;

  protected chat?: ChatEntity;
  protected user?: UserEntity;

  public constructor(
    model: ChatUserModel,
    group: ChatUserEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.chatId = model.chatId;
    this.userId = model.userId;

    this.initialize();
  }

  public static defaultFieldRequest: ChatUserFieldRequest = {
    id: true,
    createdAt: true,
    updatedAt: true,
    chatId: true,
    userId: true,
  };

  public async present(request?: ChatUserFieldRequest | boolean): Promise<ChatUserResponse> {
    if (request === false) {
      throw new Error('unprocessable field request');
    }
    const fieldRequest = request === true || request === undefined
      ? ChatUserEntityBase.defaultFieldRequest
      : request;
    return {
      id: fieldRequest?.id ? this.id : undefined,
      createdAt: fieldRequest?.createdAt ? this.createdAt : undefined,
      updatedAt: fieldRequest?.updatedAt ? this.updatedAt : undefined,
      chatId: fieldRequest?.chatId ? this.chatId : undefined,
      userId: fieldRequest?.userId ? this.userId : undefined,
      chat: fieldRequest?.chat ? await this.getChat().then((one) => one.present(fieldRequest?.chat)) : undefined,
      user: fieldRequest?.user ? await this.getUser().then((one) => one.present(fieldRequest?.user)) : undefined,
    };
  }

/** self loaders */

public static async getOne<ENTITY extends ChatUserEntityBase>(this: any, key: LoadKey): Promise<ENTITY | null> {
  return await this.getMany([key]).then((array: ENTITY[]) => array.at(0) ?? null);
}

public static async getMany<ENTITY extends ChatUserEntityBase>(this: any, keys: LoadKey[]): Promise<ENTITY[]> {
  const loadedModels = [/* TODO: load models with load keys */];
  return this.fromArray(loadedModels);
}

  /** associations */

  protected chatLoadConfig: LoadConfig<ChatUserEntityBase, ChatEntity> = {
    name: 'ChatUserEntity.chat',
    filter: (one: ChatUserEntityBase) => one.chat === undefined,
    getter: (sources: ChatUserEntityBase[]) => sources
      .map((one) => ({
        id: one.chatId,
      })),
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models with load keys */];
    //   return ChatEntity.fromArray(loadedModels);
    // },
    setter: (sources: ChatUserEntityBase[], targets: ChatEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.chat = map.get(`${one.chatId}`)!));
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

  protected userLoadConfig: LoadConfig<ChatUserEntityBase, UserEntity> = {
    name: 'ChatUserEntity.user',
    filter: (one: ChatUserEntityBase) => one.user === undefined,
    getter: (sources: ChatUserEntityBase[]) => sources
      .map((one) => ({
        id: one.userId,
      })),
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const loadedModels = [/* TODO: load associated models with load keys */];
    //   return UserEntity.fromArray(loadedModels);
    // },
    setter: (sources: ChatUserEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.user = map.get(`${one.userId}`)!));
    },
  };

  protected async loadUser(): Promise<void> {
    await this.load(this.userLoadConfig);
  }

  public async getUser(): Promise<UserEntity> {
    if (this.user !== undefined) {
      return this.user;
    }
    await this.loadUser();
    return this.user!;
  }

  public setUser(user?: UserEntity): void {
    this.user = user;
  }
}
