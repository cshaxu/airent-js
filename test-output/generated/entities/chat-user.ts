// airent imports
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
} from '../../../src/index.js';

// config imports
import { Context } from '../../../test-sources/context.js';

// entity imports
import { ChatEntity } from '../../entities/chat.js';
import { UserEntity } from '../../entities/user.js';
import {
  ChatUserFieldRequest,
  ChatUserResponse,
  SelectedChatUserResponse,
  ChatUserModel,
  ChatUserRole,
} from '../types/chat-user.js';

/** @deprecated */
export class ChatUserEntityBase extends BaseEntity<
  ChatUserModel, Context, ChatUserFieldRequest, ChatUserResponse
> {
  public id!: string;
  public createdAt!: Date;
  /** @deprecated */
  public updatedAt!: Date;
  public chatId!: string;
  public userId!: string;

  protected chat?: ChatEntity;

  protected user?: UserEntity;

  public constructor(
    model: ChatUserModel,
    context: Context,
    group: ChatUserEntityBase[],
    lock: AsyncLock,
  ) {
    super(context, group, lock);
    this.fromModel(model);
    this.initialize(model, context);
  }

  public fromModel(model: Partial<ChatUserModel>): void {
    if ('id' in model && model['id'] !== undefined) {
      this.id = model.id;
    }
    if ('createdAt' in model && model['createdAt'] !== undefined) {
      this.createdAt = model.createdAt;
    }
    if ('updatedAt' in model && model['updatedAt'] !== undefined) {
      this.updatedAt = model.updatedAt;
    }
    if ('chatId' in model && model['chatId'] !== undefined) {
      this.chatId = model.chatId;
    }
    if ('userId' in model && model['userId'] !== undefined) {
      this.userId = model.userId;
    }
    this.chat = undefined;
    this.user = undefined;
  }

  public toModel(): Partial<ChatUserModel> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      chatId: this.chatId,
      userId: this.userId,
    };
  }

  /** mutators */

  public async reload(): Promise<this> {
    const model = {/* TODO: reload model for ChatUserEntity */};
    this.fromModel(model);
    return this;
  }

  public async save(): Promise<this> {
    const model = {/* TODO: save model for ChatUserEntity */};
    this.fromModel(model);
    return this;
  }

  public async delete(): Promise<this> {
    const model = {/* TODO: delete models for ChatUserEntity */};
    this.fromModel(model);
    return this;
  }

  public async present<S extends ChatUserFieldRequest>(fieldRequest: S): Promise<SelectedChatUserResponse<S>> {
    await this.beforePresent(fieldRequest);
    const response = {
      ...(fieldRequest.id !== undefined && { id: this.id }),
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.updatedAt !== undefined && { updatedAt: this.updatedAt }),
      ...(fieldRequest.chatId !== undefined && { chatId: this.chatId }),
      ...(fieldRequest.userId !== undefined && { userId: this.userId }),
      ...(fieldRequest.chat !== undefined && { chat: await this.getChat().then((one) => one.present(fieldRequest.chat!)) }),
      ...(fieldRequest.user !== undefined && { user: await this.getUser().then((one) => one.present(fieldRequest.user!)) }),
    };
    await this.afterPresent(fieldRequest, response as Select<ChatUserResponse, S>);
    return response as SelectedChatUserResponse<S>;
  }

  public static async presentMany<
    ENTITY extends ChatUserEntityBase,
    S extends ChatUserFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedChatUserResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** self loaders */

  public static async getOne<ENTITY extends ChatUserEntityBase>(
    this: EntityConstructor<ChatUserModel, Context, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
      .then((array: ENTITY[]) => array.length > 0 ? array[0] : null);
  }

  public static async getMany<ENTITY extends ChatUserEntityBase>(
    this: EntityConstructor<ChatUserModel, Context, ENTITY>,
    keys: LoadKey[],
    context: Context
  ): Promise<ENTITY[]> {
    const models = [/* TODO: load models for ChatUserEntity */];
    return (this as any).fromArray(models, context);
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
    //   const models = [/* TODO: load ChatEntity models */];
    //   return ChatEntity.fromArray(models, this.context);
    // },
    setter: (sources: ChatUserEntityBase[], targets: ChatEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }));
      sources.forEach((one) => (one.chat = map.get(JSON.stringify({ id: one.chatId }))!));
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
    //   const models = [/* TODO: load UserEntity models */];
    //   return UserEntity.fromArray(models, this.context);
    // },
    setter: (sources: ChatUserEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }));
      sources.forEach((one) => (one.user = map.get(JSON.stringify({ id: one.userId }))!));
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
