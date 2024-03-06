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
  MessageFieldRequest,
  MessageResponse,
  SelectedMessageResponse,
  MessageModel,
  Attachment,
  SenderType,
} from './message-type.js';

/** associations */
import { ChatEntity } from '../chat.js';
import { MessageEntity } from '../message.js';
import { UserEntity } from '../user.js';

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

  protected mentor?: UserEntity | null;

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

    this.initialize(model);
  }

  protected async beforePresent<S extends MessageFieldRequest>(fieldRequest: S): Promise<void> {
  }

  protected async afterPresent<S extends MessageFieldRequest>(fieldRequest: S, response: SelectedMessageResponse<S>): Promise<void> {
  }

  public async present<S extends MessageFieldRequest>(fieldRequest: S): Promise<SelectedMessageResponse<S>> {
    this.beforePresent(fieldRequest);
    const response = {
      ...(fieldRequest.id !== undefined && { id: this.id }),
      ...(fieldRequest.createdAt !== undefined && { createdAt: this.createdAt }),
      ...(fieldRequest.chatId !== undefined && { chatId: this.chatId }),
      ...(fieldRequest.derivedChatId !== undefined && { derivedChatId: this.getDerivedChatId() }),
      ...(fieldRequest.userId !== undefined && { userId: this.userId }),
      ...(fieldRequest.content !== undefined && { content: this.content }),
      ...(fieldRequest.attachment !== undefined && { attachment: this.attachment }),
      ...(fieldRequest.chat !== undefined && { chat: await this.getChat().then((one) => one.present(fieldRequest.chat!)) }),
      ...(fieldRequest.user !== undefined && { user: await this.getUser().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.user!)) }),
      ...(fieldRequest.parentMessageId !== undefined && { parentMessageId: this.parentMessageId }),
      ...(fieldRequest.parentMessage !== undefined && { parentMessage: await this.getParentMessage().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.parentMessage!)) }),
      ...(fieldRequest.mentorId !== undefined && { mentorId: this.getMentorId() }),
      ...(fieldRequest.mentor !== undefined && { mentor: await this.getMentor().then((one) => one === null ? Promise.resolve(null) : one.present(fieldRequest.mentor!)) }),
    } as SelectedMessageResponse<S>;
    this.afterPresent(fieldRequest, response);
    return response;
  }

  public static async presentMany<
    ENTITY extends MessageEntityBase,
    S extends MessageFieldRequest
  >(entities: ENTITY[], fieldRequest: S): Promise<SelectedMessageResponse<S>[]> {
    return await sequential(entities.map((one) => () => one.present(fieldRequest)));
  }

  /** associations */

  protected chatLoadConfig: LoadConfig<MessageEntityBase, ChatEntity> = {
    name: 'MessageEntity.chat',
    filter: (one: MessageEntityBase) => one.chat === undefined,
    // TODO: build your association key getter
    // getter: (sources: MessageEntityBase[]) => {
    //   return sources
    //     .map((one) => ({
    //       id: one.getDerivedChatId(),
    //     }));
    // },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load ChatEntity models */];
    //   return ChatEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: ChatEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }), (one) => one);
      sources.forEach((one) => (one.chat = map.get(JSON.stringify({ id: one.getDerivedChatId() }))!));
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

  protected userLoadConfig: LoadConfig<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.user',
    filter: (one: MessageEntityBase) => one.user === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.userId !== null)
        .map((one) => ({
          id: one.userId,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load UserEntity models */];
    //   return UserEntity.fromArray(models);
    // },
    // TODO: build your association value setter
    // setter: (sources: MessageEntityBase[], targets: UserEntity[]) => {
    //   const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }), (one) => one);
    //   sources.forEach((one) => (one.user = (one.userId === null) ? null : map.get(JSON.stringify({ id: one.userId })) ?? null));
    // },
  };

  public async getUser(): Promise<UserEntity | null> {
    if (this.user !== undefined) {
      return this.user;
    }
    await this.load(this.userLoadConfig);
    return this.user ?? null;
  }

  public setUser(user?: UserEntity | null): void {
    this.user = user;
  }

  protected parentMessageLoadConfig: LoadConfig<MessageEntityBase, MessageEntity> = {
    name: 'MessageEntity.parentMessage',
    filter: (one: MessageEntityBase) => one.parentMessage === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.parentMessageId !== null)
        .map((one) => ({
          id: one.parentMessageId,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load MessageEntity models */];
    //   return MessageEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: MessageEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }), (one) => one);
      sources.forEach((one) => (one.parentMessage = (one.parentMessageId === null) ? null : map.get(JSON.stringify({ id: one.parentMessageId })) ?? null));
    },
  };

  public async getParentMessage(): Promise<MessageEntity | null> {
    if (this.parentMessage !== undefined) {
      return this.parentMessage;
    }
    await this.load(this.parentMessageLoadConfig);
    return this.parentMessage ?? null;
  }

  public setParentMessage(parentMessage?: MessageEntity | null): void {
    this.parentMessage = parentMessage;
  }

  protected mentorLoadConfig: LoadConfig<MessageEntityBase, UserEntity> = {
    name: 'MessageEntity.mentor',
    filter: (one: MessageEntityBase) => one.mentor === undefined,
    getter: (sources: MessageEntityBase[]) => {
      return sources
        .filter((one) => one.getMentorId() !== null)
        .map((one) => ({
          id: one.getMentorId(),
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load UserEntity models */];
    //   return UserEntity.fromArray(models);
    // },
    setter: (sources: MessageEntityBase[], targets: UserEntity[]) => {
      const map = toObjectMap(targets, (one) => JSON.stringify({ id: one.id }), (one) => one);
      sources.forEach((one) => (one.mentor = (one.getMentorId() === null) ? null : map.get(JSON.stringify({ id: one.getMentorId() })) ?? null));
    },
  };

  public async getMentor(): Promise<UserEntity | null> {
    if (this.mentor !== undefined) {
      return this.mentor;
    }
    await this.load(this.mentorLoadConfig);
    return this.mentor ?? null;
  }

  public setMentor(mentor?: UserEntity | null): void {
    this.mentor = mentor;
  }

  /** computed sync fields */

  public getDerivedChatId(): string {
    throw new Error('not implemented');
  }

  public getHasContent(): boolean {
    throw new Error('not implemented');
  }

  public getMentorId(): string | null {
    throw new Error('not implemented');
  }
}
