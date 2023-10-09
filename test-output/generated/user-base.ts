import { AsyncLock, BaseEntity, LoadParams, toArrayMap, toObjectMap } from '../../src';

/** generated */
import {
  UserFieldRequest,
  UserResponse,
  UserModel,
} from './user-type.js';

/** associations */
import { ChatUserEntity } from '../chat-user.js';
import { MessageEntity } from '../message.js';

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
    const fieldRequest = request === true || request === undefined ? UserEntityBase.defaultFieldRequest : request;
    return {
      id: fieldRequest?.id ? this.id : undefined,
      createdAt: fieldRequest?.createdAt ? this.createdAt : undefined,
      updatedAt: fieldRequest?.updatedAt ? this.updatedAt : undefined,
      email: fieldRequest?.email ? this.email : undefined,
      firstName: fieldRequest?.firstName ? this.firstName : undefined,
      lastName: fieldRequest?.lastName ? this.lastName : undefined,
      imageUrl: fieldRequest?.imageUrl ? this.imageUrl : undefined,
      chatUsers: fieldRequest?.chatUsers ? await this.getChatUsers().then((a) => Promise.all(a.map((one) => one.present(fieldRequest?.chatUsers)))) : undefined,
      firstMessage: fieldRequest?.firstMessage ? await this.getFirstMessage().then((one) => one === null ? Promise.resolve(null)) : one.present(fieldRequest?.firstMessage) : undefined,
    };
  }

  /** associations */
  /** @deprecated */
  protected chatUsersParams: LoadParams<UserEntityBase, ChatUserEntity> = {
    name: 'UserEntity.chatUsers',
    filter: (one: UserEntityBase) => one.chatUsers === undefined,
    // TODO: build your association data loader
    // loader: async (array: UserEntityBase[]) => {
    //   const ids = unique((nonNull(array.map((one) => one.id))));
    //   // TODO: load models with the above keys
    //   const loadedModels = ...;
    //   return ChatUserEntity.fromArray(loadedModels);
    // },
    setter: (array: UserEntityBase[], loaded: ChatUserEntity[]) => {
      const map = toArrayMap(
        loaded,
        (one) => one.userId,
        (one) => one
      );
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
  protected messagesParams: LoadParams<UserEntityBase, MessageEntity> = {
    name: 'UserEntity.messages',
    filter: (one: UserEntityBase) => one.messages === undefined,
    // TODO: build your association data loader
    // loader: async (array: UserEntityBase[]) => {
    //   const ids = unique((nonNull(array.map((one) => one.id))));
    //   // TODO: load models with the above keys
    //   const loadedModels = ...;
    //   return MessageEntity.fromArray(loadedModels);
    // },
    setter: (array: UserEntityBase[], loaded: MessageEntity[]) => {
      const map = toArrayMap(
        loaded,
        (one) => one.userId,
        (one) => one
      );
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
