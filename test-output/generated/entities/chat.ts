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
import { MessageEntity } from '../../entities/message.js';
import { ChatUserEntity } from '../../entities/chat-user.js';
import {
  ChatFieldRequest,
  ChatResponse,
  SelectedChatResponse,
  ChatModel,
} from '../types/chat.js';

export class ChatEntityBase extends BaseEntity<
  ChatModel, Context, ChatFieldRequest, ChatResponse
> {
  public id!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  /** @deprecated */
  protected chatUsers?: ChatUserEntity[];

  protected messages?: MessageEntity[];

  public constructor(
    model: ChatModel,
    context: Context,
    group: ChatEntityBase[],
    lock: AsyncLock,
  ) {
    super(context, group, lock);
    this.fromModel(model);
    this.initialize(model, context);
  }

  public fromModel(model: Partial<ChatModel>): void {
    if ('id' in model && model['id'] !== undefined) {
      this.id = model.id;
    }
    if ('createdAt' in model && model['createdAt'] !== undefined) {
      this.createdAt = model.createdAt;
    }
    if ('updatedAt' in model && model['updatedAt'] !== undefined) {
      this.updatedAt = model.updatedAt;
    }
    if ('deletedAt' in model && model['deletedAt'] !== undefined) {
      this.deletedAt = model.deletedAt;
    }
    this.chatUsers = undefined;
    this.messages = undefined;
  }

  public toModel(): Partial<ChatModel> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  /** mutators */

  public async reload(): Promise<this> {
    const model = {/* TODO: reload model for ChatEntity */};
    this.fromModel(model);
    return this;
  }

  public async save(): Promise<this> {
    const model = {/* TODO: save model for ChatEntity */};
    this.fromModel(model);
    return this;
  }

  public async delete(): Promise<this> {
    const model = {/* TODO: delete models for ChatEntity */};
    this.fromModel(model);
    return this;
  }

  public async present<S extends ChatFieldRequest>(fieldRequest: S): Promise<SelectedChatResponse<S>> {
    await this.beforePresent(fieldRequest);
    const response = {
      ...(fieldRequest.id !== undefined && { id: this.id }),
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.updatedAt !== undefined && { updatedAt: this.updatedAt }),
      ...(fieldRequest.deletedAt !== undefined && { deletedAt: this.deletedAt }),
      ...(fieldRequest.chatUsers !== undefined && { chatUsers: await this.getChatUsers().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chatUsers!)))) }),
      ...(fieldRequest.messages !== undefined && { messages: await this.getMessages().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.messages!)))) }),
    };
    await this.afterPresent(fieldRequest, response as Select<ChatResponse, S>);
    return response as SelectedChatResponse<S>;
  }

  public static async presentMany<
    ENTITY extends ChatEntityBase,
    S extends ChatFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedChatResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** self loaders */

  public static async getOne<ENTITY extends ChatEntityBase>(
    this: EntityConstructor<ChatModel, Context, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
      .then((array: ENTITY[]) => array.length > 0 ? array[0] : null);
  }

  public static async getMany<ENTITY extends ChatEntityBase>(
    this: EntityConstructor<ChatModel, Context, ENTITY>,
    keys: LoadKey[],
    context: Context
  ): Promise<ENTITY[]> {
    const models = [/* TODO: load models for ChatEntity */];
    return (this as any).fromArray(models, context);
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
    //   const models = [/* TODO: load ChatUserEntity models */];
    //   return ChatUserEntity.fromArray(models, this.context);
    // },
    setter: (sources: ChatEntityBase[], targets: ChatUserEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ chatId: one.chatId }));
      sources.forEach((one) => (one.chatUsers = map.get(JSON.stringify({ chatId: one.id })) ?? []));
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
    //   const models = [/* TODO: load MessageEntity models */];
    //   return MessageEntity.fromArray(models, this.context);
    // },
    setter: (sources: ChatEntityBase[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => JSON.stringify({ chatId: one.chatId }));
      sources.forEach((one) => (one.messages = map.get(JSON.stringify({ chatId: one.id })) ?? []));
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
}
