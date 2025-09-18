// airent imports
import {
  AsyncLock,
  Awaitable,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
  batch,
  clone,
  sequential,
  toArrayMap,
  toObjectMap,
} from '../../../src/index.js';

// config imports
import { Context } from '../../../test-sources/context.js';

// entity imports
import { UserModel } from '../../../test-sources/models.js';
import { MessageEntity } from '../../entities/message.js';
import { ChatUserEntity } from '../../entities/chat-user.js';
import {
  UserFieldRequest,
  UserResponse,
  SelectedUserResponse,
} from '../types/user.js';

export class UserEntityBase extends BaseEntity<
  UserModel, Context, UserFieldRequest, UserResponse
> {
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public email!: string;
  public firstName!: string | null;
  public lastName!: string | null;
  public imageUrl!: string | null;

  /** @deprecated */
  protected chatUsers?: ChatUserEntity[];

  protected messages?: MessageEntity[];

  public constructor(
    model: UserModel,
    context: Context,
    group: UserEntityBase[],
    lock: AsyncLock,
  ) {
    super(context, group, lock);
    this._aliasMapFromModel['id'] = 'id';
    this._aliasMapToModel['id'] = 'id';
    this._aliasMapFromModel['createdAt'] = 'createdAt';
    this._aliasMapToModel['createdAt'] = 'createdAt';
    this._aliasMapFromModel['updatedAt'] = 'updatedAt';
    this._aliasMapToModel['updatedAt'] = 'updatedAt';
    this._aliasMapFromModel['email'] = 'email';
    this._aliasMapToModel['email'] = 'email';
    this._aliasMapFromModel['firstName'] = 'firstName';
    this._aliasMapToModel['firstName'] = 'firstName';
    this._aliasMapFromModel['lastName'] = 'lastName';
    this._aliasMapToModel['lastName'] = 'lastName';
    this._aliasMapFromModel['image'] = 'imageUrl';
    this._aliasMapToModel['imageUrl'] = 'image';
    this.fromModelInner(model, true);
    this.initialize(model, context);
  }

  /** mutators */

  public async reload(): Promise<this> {
    const model = {/* TODO: reload model for UserEntity */};
    this._originalModel = { ...model };
    this.fromModelInner(model, true);
    return this;
  }

  public async save(): Promise<this> {
    const model = {/* TODO: save model for UserEntity */};
    this._originalModel = { ...model };
    this.fromModelInner(model, true);
    return this;
  }

  public async delete(): Promise<this> {
    const model = {/* TODO: delete models for UserEntity */};
    this._originalModel = { ...model };
    this.fromModelInner(model, true);
    return this;
  }

  public async present<S extends UserFieldRequest>(fieldRequest: S): Promise<SelectedUserResponse<S>> {
    await this.beforePresent(fieldRequest);
    const response = {
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
    };
    await this.afterPresent(fieldRequest, response as Select<UserResponse, S>);
    return response as SelectedUserResponse<S>;
  }

  public static async presentMany<
    ENTITY extends UserEntityBase,
    S extends UserFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedUserResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** self creator */

  public static async createOne<ENTITY extends UserEntityBase>(
    this: EntityConstructor<UserModel, Context, ENTITY>,
    model: Partial<UserModel>,
    context: Context
  ): Promise<ENTITY | null> {
    const createdModel = {/* TODO: create model for UserEntity */};
    return (this as any).fromOne(createdModel, context);
  }

  /** self loaders */

  public static async getOne<ENTITY extends UserEntityBase>(
    this: EntityConstructor<UserModel, Context, ENTITY>,
    key: LoadKey,
    context: Context
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key], context)
      .then((array: ENTITY[]) => array.length > 0 ? array[0] : null);
  }

  public static async getMany<ENTITY extends UserEntityBase>(
    this: EntityConstructor<UserModel, Context, ENTITY>,
    keys: LoadKey[],
    context: Context
  ): Promise<ENTITY[]> {
    const models = [/* TODO: load models for UserEntity */];
    return (this as any).fromArray(models, context);
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
    //   return ChatUserEntity.fromArray(models, this.context);
    // },
    setter: (sources: UserEntityBase[], targets: ChatUserEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ userId: one.userId }));
      sources.forEach((one) => (one.chatUsers = map.get(JSON.stringify({ userId: one.id })) ?? []));
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
    //   return MessageEntity.fromArray(models, this.context);
    // },
    setter: (sources: UserEntityBase[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ userId: one.userId }));
      sources.forEach((one) => (one.messages = map.get(JSON.stringify({ userId: one.id })) ?? []));
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
