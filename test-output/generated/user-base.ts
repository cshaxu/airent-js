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
  UserFieldRequest,
  UserResponse,
  UserModel,
} from './user-type.js';

/** associations */
import { MessageEntity } from '../message.js';
import { ChatUserEntity } from '../chat-user.js';

export class UserEntityBase extends BaseEntity<
  UserModel, UserFieldRequest, UserResponse
> {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public email: string;
  public firstName: string | null;
  public lastName: string | null;
  public imageUrl: string | null;

  /** @deprecated */
  protected chatUsers?: ChatUserEntity[];

  protected messages?: MessageEntity[];

  protected hasAnyMessage?: boolean;

  public constructor(
    model: UserModel,
    group: UserEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.email = model.email;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.imageUrl = model.image;

    this.initialize();
  }

  public static defaultFieldRequest: UserFieldRequest = {
    id: true,
    createdAt: true,
    updatedAt: true,
    email: true,
    firstName: true,
    lastName: true,
    imageUrl: true,
  };

  public async present(request?: UserFieldRequest | boolean): Promise<UserResponse> {
    if (request === false) {
      throw new Error('unprocessable field request');
    }
    const fieldRequest = request === true || request === undefined
      ? UserEntityBase.defaultFieldRequest
      : request;
    return {
      id: fieldRequest?.id ? this.id : undefined,
      createdAt: fieldRequest?.createdAt ? this.createdAt : undefined,
      updatedAt: fieldRequest?.updatedAt ? this.updatedAt : undefined,
      email: fieldRequest?.email ? this.email : undefined,
      firstName: fieldRequest?.firstName ? this.firstName : undefined,
      lastName: fieldRequest?.lastName ? this.lastName : undefined,
      imageUrl: fieldRequest?.imageUrl ? this.imageUrl : undefined,
      chatUsers: fieldRequest?.chatUsers ? await this.getChatUsers().then((a) => Promise.all(a.map((one) => one.present(fieldRequest?.chatUsers)))) : undefined,
      firstMessage: fieldRequest?.firstMessage ? await this.getFirstMessage().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest?.firstMessage)) : undefined,
      hasAnyMessage: fieldRequest?.hasAnyMessage ? await this.getHasAnyMessage() : undefined,
    };
  }

  /** self loaders */

  public static async getOne<ENTITY extends UserEntityBase>(
    this: EntityConstructor<UserModel, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
      .then((array: ENTITY[]) => array.at(0) ?? null);
  }

  public static async getMany<ENTITY extends UserEntityBase>(
    this: EntityConstructor<UserModel, ENTITY>,
    keys: LoadKey[]
  ): Promise<ENTITY[]> {
    const models = [/* TODO: load models for UserEntity */];
    return (this as any).fromArray(models);
  }

  /** associations */

  /** @deprecated */
  protected chatUsersLoadConfig: LoadConfig<UserEntityBase, ChatUserEntity> = {
    name: 'UserEntity.chatUsers',
    filter: (one: UserEntityBase) => one.chatUsers === undefined,
    getter: (sources: UserEntityBase[]) => {
      return sources
        .map((one) => ({
          userId: one.id,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load ChatUserEntity models */];
    //   return ChatUserEntity.fromArray(models);
    // },
    setter: (sources: UserEntityBase[], targets: ChatUserEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.userId}`, (one) => one);
      sources.forEach((one) => (one.chatUsers = map.get(`${one.id}`) ?? []));
    },
  };

  /** @deprecated */
  public async getChatUsers(): Promise<ChatUserEntity[]> {
    if (this.chatUsers !== undefined) {
      return this.chatUsers;
    }
    await this.load(this.chatUsersLoadConfig);
    return this.chatUsers!;
  }

  /** @deprecated */
  public setChatUsers(chatUsers?: ChatUserEntity[]): void {
    this.chatUsers = chatUsers;
  }

  protected messagesLoadConfig: LoadConfig<UserEntityBase, MessageEntity> = {
    name: 'UserEntity.messages',
    filter: (one: UserEntityBase) => one.messages === undefined,
    // TODO: build your association key getter
    // getter: (sources: UserEntityBase[]) => {
    //   return sources
    //     .map((one) => ({
    //     }));
    // },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load MessageEntity models */];
    //   return MessageEntity.fromArray(models);
    // },
    // TODO: build your association value setter
    // setter: (sources: UserEntityBase[], targets: MessageEntity[]) => {
    //   const map = toArrayMap(targets, (one) => `${one.userId}`, (one) => one);
    //   sources.forEach((one) => (one.messages = map.get('TODO: map your source entity to key') ?? []));
    // },
  };

  public async getMessages(): Promise<MessageEntity[]> {
    if (this.messages !== undefined) {
      return this.messages;
    }
    await this.load(this.messagesLoadConfig);
    return this.messages!;
  }

  public setMessages(messages?: MessageEntity[]): void {
    this.messages = messages;
  }

  protected hasAnyMessageLoadConfig: LoadConfig<UserEntityBase, boolean> = {
    name: 'UserEntity.hasAnyMessage',
    filter: (one: UserEntityBase) => one.hasAnyMessage === undefined,
    // TODO: build your association key getter
    // getter: (sources: UserEntityBase[]) => {
    //   return sources
    //     .map((one) => ({
    //     }));
    // },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   return [/* TODO: load associated models */];
    // },
    // TODO: build your association value setter
    // setter: (sources: UserEntityBase[], targets: boolean[]) => {
    //   const map = toObjectMap(targets, (one) => 'TODO: map your target entity to key', (one) => one);
    //   sources.forEach((one) => (one.hasAnyMessage = map.get('TODO: map your source entity to key')!));
    // },
  };

  public async getHasAnyMessage(): Promise<boolean> {
    if (this.hasAnyMessage !== undefined) {
      return this.hasAnyMessage;
    }
    await this.load(this.hasAnyMessageLoadConfig);
    return this.hasAnyMessage!;
  }

  public setHasAnyMessage(hasAnyMessage?: boolean): void {
    this.hasAnyMessage = hasAnyMessage;
  }

  /** computed sync fields */

  public getIsAdmin(): boolean {
    throw new Error('not implemented');
  }

  /** computed async fields */

  /** @deprecated */
  public async getFirstMessage(): Promise<MessageEntity | null> {
    throw new Error('not implemented');
  }
}
