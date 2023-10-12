import { AsyncLock, BaseEntity, LoadParams, toArrayMap, toObjectMap, nonNull, unique } from '../../src';

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

  /** associations */

  /** @deprecated */
  protected chatUsersParams: LoadParams<ChatEntityBase, ChatUserEntity> = {
    name: 'ChatEntity.chatUsers',
    filter: (one: ChatEntityBase) => one.chatUsers === undefined,
    // TODO: build your association data loader
    // loader: async (array: ChatEntityBase[]) => {
    //   const ids = unique((nonNull(array.map((one) => one.id))));
    //   const loadedModels = [/* TODO: load associated models with the above keys */];
    //   return ChatUserEntity.fromArray(loadedModels);
    // },
    setter: (array: ChatEntityBase[], loaded: ChatUserEntity[]) => {
      const map = toArrayMap(loaded, (one) => one.chatId, (one) => one);
      array.forEach((one) => (one.chatUsers = map.get(one.id) ?? []));
    },
  };

  /** @deprecated */
  protected async loadChatUsers(): Promise<void> {
    await this.load(this.chatUsersParams);
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

  protected messagesParams: LoadParams<ChatEntityBase, MessageEntity> = {
    name: 'ChatEntity.messages',
    filter: (one: ChatEntityBase) => one.messages === undefined,
    // TODO: build your association data loader
    // loader: async (array: ChatEntityBase[]) => {
    //   const ids = unique((nonNull(array.map((one) => one.id))));
    //   const loadedModels = [/* TODO: load associated models with the above keys */];
    //   return MessageEntity.fromArray(loadedModels);
    // },
    setter: (array: ChatEntityBase[], loaded: MessageEntity[]) => {
      const map = toArrayMap(loaded, (one) => one.chatId, (one) => one);
      array.forEach((one) => (one.messages = map.get(one.id) ?? []));
    },
  };

  protected async loadMessages(): Promise<void> {
    await this.load(this.messagesParams);
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
