import {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
  sequential,
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

    this.initialize(model);
  }

  public async present<S extends UserFieldRequest>(fieldRequest: S): Promise<Select<UserResponse, S>> {
    return {
      ...(fieldRequest.id !== undefined && { id: this.id }),
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.updatedAt !== undefined && { updatedAt: this.updatedAt }),
      ...(fieldRequest.email !== undefined && { email: this.email }),
      ...(fieldRequest.firstName !== undefined && { firstName: this.firstName }),
      ...(fieldRequest.lastName !== undefined && { lastName: this.lastName }),
      ...(fieldRequest.imageUrl !== undefined && { imageUrl: this.imageUrl }),
      ...(fieldRequest.chatUsers !== undefined && { chatUsers: await this.getChatUsers().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chatUsers!)))) }),
      ...(fieldRequest.firstMessage !== undefined && { firstMessage: await this.getFirstMessage().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.firstMessage!)) }),
      ...(fieldRequest.hasAnyMessage !== undefined && { hasAnyMessage: await this.getHasAnyMessage() }),
    } as Select<UserResponse, S>;
  }

  public static async presentMany<
    ENTITY extends UserEntityBase,
    S extends UserFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<Select<UserResponse, S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
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
    getter: (sources: UserEntityBase[]) => {
      return sources
        .map((one) => ({
          userId: one.id,
          content: null,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load MessageEntity models */];
    //   return MessageEntity.fromArray(models);
    // },
    setter: (sources: UserEntityBase[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.userId}`, (one) => one);
      sources.forEach((one) => (one.messages = map.get(`${one.id}`) ?? []));
    },
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

  /** computed sync fields */

  public getIsAdmin(): boolean {
    throw new Error('not implemented');
  }

  /** computed async fields */

  /** @deprecated */
  public async getFirstMessage(): Promise<MessageEntity | null> {
    throw new Error('not implemented');
  }

  public async getHasAnyMessage(): Promise<boolean> {
    throw new Error('not implemented');
  }
}
