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

  public static async getOne<ENTITY extends ChatUserEntityBase>(
    this: EntityConstructor<ChatUserModel, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
      .then((array: ENTITY[]) => array.at(0) ?? null);
  }

  public static async getMany<ENTITY extends ChatUserEntityBase>(
    this: EntityConstructor<ChatUserModel, ENTITY>,
    keys: LoadKey[]
  ): Promise<ENTITY[]> {
    const models = [/* TODO: load entity models */];
    return (this as any).fromArray(models);
  }

  /** associations */

  protected chatLoadConfig: LoadConfig<ChatUserEntityBase, ChatEntity> = {
    name: 'ChatUserEntity.chat',
    filter: (one: ChatUserEntityBase) => one.chat === undefined,
    getter: (sources: ChatUserEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.chatId,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load associated models */];
    //   return ChatEntity.fromArray(models);
    // },
    setter: (sources: ChatUserEntityBase[], targets: ChatEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.chat = map.get(`${one.chatId}`)!));
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

  protected userLoadConfig: LoadConfig<ChatUserEntityBase, UserEntity> = {
    name: 'ChatUserEntity.user',
    filter: (one: ChatUserEntityBase) => one.user === undefined,
    getter: (sources: ChatUserEntityBase[]) => {
      return sources
        .map((one) => ({
          id: one.userId,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load associated models */];
    //   return UserEntity.fromArray(models);
    // },
    setter: (sources: ChatUserEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => `${one.id}`, (one) => one);
      sources.forEach((one) => (one.user = map.get(`${one.userId}`)!));
    },
  };

  public async getUser(): Promise<UserEntity> {
    if (this.user !== undefined) {
      return this.user;
    }
    await this.load(this.userLoadConfig);
    return this.user!;
  }

  public setUser(user?: UserEntity): void {
    this.user = user;
  }
}
