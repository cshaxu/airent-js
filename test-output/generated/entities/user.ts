// airent imports
import {
  AsyncLock,
  Awaitable,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  Select,
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
  private _originalModel: UserModel;

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
    this._originalModel = { ...model };
    this.fromModelInner(model, false);
    this.initialize(model, context);
  }

  public fromModel(model: Partial<UserModel>): void {
    this.fromModelInner(model, false);
  }

  private fromModelInner(model: Partial<UserModel>, isResetOriginalModel: boolean): void {
    if ('id' in model && model['id'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['id'] = model['id'];
      }
      this.id = model.id;
    }
    if ('createdAt' in model && model['createdAt'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['createdAt'] = model['createdAt'];
      }
      this.createdAt = structuredClone(model.createdAt);
    }
    if ('updatedAt' in model && model['updatedAt'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['updatedAt'] = model['updatedAt'];
      }
      this.updatedAt = structuredClone(model.updatedAt);
    }
    if ('email' in model && model['email'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['email'] = model['email'];
      }
      this.email = model.email;
    }
    if ('firstName' in model && model['firstName'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['firstName'] = model['firstName'];
      }
      this.firstName = model.firstName;
    }
    if ('lastName' in model && model['lastName'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['lastName'] = model['lastName'];
      }
      this.lastName = model.lastName;
    }
    if ('image' in model && model['image'] !== undefined) {
      if (isResetOriginalModel) {
        this._originalModel['image'] = model['image'];
      }
      this.imageUrl = model.image;
    }
    this.chatUsers = undefined;
    this.messages = undefined;
  }

  public toModel(): Partial<UserModel> {
    return {
      id: this.id,
      createdAt: structuredClone(this.createdAt),
      updatedAt: structuredClone(this.updatedAt),
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      image: this.imageUrl,
    };
  }

  public toDirtyModel(): Partial<UserModel> {
    const dirtyModel: Partial<UserModel> = {};
    if ('id' in this._originalModel && this._originalModel['id'] !== this.id) {
      dirtyModel['id'] = this.id;
    }
    if ('createdAt' in this._originalModel && JSON.stringify(this._originalModel['createdAt']) !== JSON.stringify(this.createdAt)) {
      dirtyModel['createdAt'] = structuredClone(this.createdAt);
    }
    if ('updatedAt' in this._originalModel && JSON.stringify(this._originalModel['updatedAt']) !== JSON.stringify(this.updatedAt)) {
      dirtyModel['updatedAt'] = structuredClone(this.updatedAt);
    }
    if ('email' in this._originalModel && this._originalModel['email'] !== this.email) {
      dirtyModel['email'] = this.email;
    }
    if ('firstName' in this._originalModel && this._originalModel['firstName'] !== this.firstName) {
      dirtyModel['firstName'] = this.firstName;
    }
    if ('lastName' in this._originalModel && this._originalModel['lastName'] !== this.lastName) {
      dirtyModel['lastName'] = this.lastName;
    }
    if ('image' in this._originalModel && this._originalModel['image'] !== this.imageUrl) {
      dirtyModel['image'] = this.imageUrl;
    }
    return dirtyModel;
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

  /** self loaders */

  public static async getOne<ENTITY extends UserEntityBase>(
    this: EntityConstructor<UserModel, Context, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
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
