import { AsyncLock, BaseEntity, LoadParams, toArrayMap, toObjectMap } from '../../src';

/** generated */
import {
  MessageFieldRequest,
  MessageResponse,
  MessageModel,
  Attachment,
  SenderType,
} from './message-type.js';

/** associations */
import { ChatEntity } from '../chat.js';
import { UserEntity } from '../user.js';
import { MessageEntity } from '../message.js';

export class MessageEntityBase extends BaseEntity<
  MessageModel, MessageFieldRequest, MessageResponse
> {
  public id: string;
  public createdAt: Date;
  public chatId: string;
  public userId: string | null;
  public content: string | null;
  public attachment: Attachment | null;
  public parentMessageId: string | null;

  protected chat?: ChatEntity;
  protected user?: UserEntity | null;
  protected parentMessage?: MessageEntity | null;

  public constructor(
    model: MessageModel,
    group: MessageEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.chatId = model.chatId;
    this.userId = model.userId;
    this.content = model.content;
    this.attachment = model.attachmentJson as Attachment | null;
    this.parentMessageId = model.parentMessageId;

    this.initialize();
  }

  public static defaultFieldRequest: MessageFieldRequest = {
    id: true,
    createdAt: true,
    chatId: true,
    userId: true,
    content: true,
    attachment: true,
    parentMessageId: true,
  };

  public async present(request?: MessageFieldRequest | boolean): Promise<MessageResponse> {
    if (request === false) {
      throw new Error('unprocessable field request');
    }
    const fieldRequest = request === true || request === undefined ? MessageEntityBase.defaultFieldRequest : request;
    return {
      id: fieldRequest?.id ? this.id : undefined,
      createdAt: fieldRequest?.createdAt ? this.createdAt : undefined,
      chatId: fieldRequest?.chatId ? this.chatId : undefined,
      userId: fieldRequest?.userId ? this.userId : undefined,
      content: fieldRequest?.content ? this.content : undefined,
      attachment: fieldRequest?.attachment ? this.attachment : undefined,
      chat: fieldRequest?.chat ? await this.getChat().then((one) => one.present(fieldRequest?.chat)) : undefined,
      user: fieldRequest?.user ? await this.getUser().then((one) => one ? one.present(fieldRequest?.user) : Promise.resolve(null)) : undefined,
      parentMessageId: fieldRequest?.parentMessageId ? this.parentMessageId : undefined,
      parentMessage: fieldRequest?.parentMessage ? await this.getParentMessage().then((one) => one ? one.present(fieldRequest?.parentMessage) : Promise.resolve(null)) : undefined,
    };
  }

  /** associations */
  protected chatParams: LoadParams<MessageEntityBase, ChatEntity> = {
    name: 'MessageEntity.chat',
    filter: (one: MessageEntityBase) => one.chat === undefined,
    // TODO: build your association data loader
    // loader: async (array: MessageEntityBase[]) => {
    //   const chatIds = unique((nonNull(array.map((one) => one.chatId))));
    //   // TODO: load models with the above keys
    //   const loadedModels = ...;
    //   return ChatEntity.fromArray(loadedModels);
    // },
    setter: (array: MessageEntityBase[], loaded: ChatEntity[]) => {
      const map = toObjectMap(
        loaded,
        (one) => one.id,
        (one) => one
      );
      array.forEach((one) => (one.chat = map.get(one.chatId)!));
    },
  };

  protected async loadChat(): Promise<void> {
    await this.load(this.chatParams);
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
  protected userParams: LoadParams<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.user',
    filter: (one: MessageEntityBase) => one.user === undefined,
    // TODO: build your association data loader
    // loader: async (array: MessageEntityBase[]) => {
    //   const userIds = unique((nonNull(array.map((one) => one.userId))));
    //   // TODO: load models with the above keys
    //   const loadedModels = ...;
    //   return UserEntity.fromArray(loadedModels);
    // },
    setter: (array: MessageEntityBase[], loaded: UserEntity[]) => {
      const map = toObjectMap(
        loaded,
        (one) => one.id,
        (one) => one
      );
      array.forEach((one) => (one.user = one.userId === null ? null : map.get(one.userId) ?? null));
    },
  };

  protected async loadUser(): Promise<void> {
    await this.load(this.userParams);
  }

  public async getUser(): Promise<UserEntity | null> {
    if (this.user !== undefined) {
      return this.user;
    }
    await this.loadUser();
    return this.user!;
  }

  public setUser(user?: UserEntity | null): void {
    this.user = user;
  }
  protected parentMessageParams: LoadParams<MessageEntityBase, MessageEntity> = {
    name: 'MessageEntity.parentMessage',
    filter: (one: MessageEntityBase) => one.parentMessage === undefined,
    // TODO: build your association data loader
    // loader: async (array: MessageEntityBase[]) => {
    //   const parentMessageIds = unique((nonNull(array.map((one) => one.parentMessageId))));
    //   // TODO: load models with the above keys
    //   const loadedModels = ...;
    //   return MessageEntity.fromArray(loadedModels);
    // },
    setter: (array: MessageEntityBase[], loaded: MessageEntity[]) => {
      const map = toObjectMap(
        loaded,
        (one) => one.id,
        (one) => one
      );
      array.forEach((one) => (one.parentMessage = one.parentMessageId === null ? null : map.get(one.parentMessageId) ?? null));
    },
  };

  protected async loadParentMessage(): Promise<void> {
    await this.load(this.parentMessageParams);
  }

  public async getParentMessage(): Promise<MessageEntity | null> {
    if (this.parentMessage !== undefined) {
      return this.parentMessage;
    }
    await this.loadParentMessage();
    return this.parentMessage!;
  }

  public setParentMessage(parentMessage?: MessageEntity | null): void {
    this.parentMessage = parentMessage;
  }

  /** computed sync fields */

  public getHasContent(): boolean {
    throw new Error('not implemented');
  }
}
