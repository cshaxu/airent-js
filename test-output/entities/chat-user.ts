// airent imports
import {
  AsyncLock,
  Awaitable,
  LoadConfig,
  LoadKey,
  Select,
  batch,
  clone,
  sequential,
  toArrayMap,
  toObjectMap,
} from '../../src/index.js';

// config imports
import { Context } from '../../test-sources/context.js';

// entity imports
import { ChatEntity } from './chat.js';
import { UserEntity } from './user.js';
import {
  ChatUserFieldRequest,
  ChatUserResponse,
  SelectedChatUserResponse,
  ChatUserModel,
  ChatUserRole,
} from '../generated/types/chat-user.js';
import { ChatUserEntityBase } from '../generated/entities/chat-user.js';

/** @deprecated */
export class ChatUserEntity extends ChatUserEntityBase {
  protected initialize(model: ChatUserModel, context: Context) {
    super.initialize(model, context);

    /** associations */

    this.chatLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load ChatEntity models */];
      return ChatEntity.fromArray(models, this.context);
    };

    this.userLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load UserEntity models */];
      return UserEntity.fromArray(models, this.context);
    };
  }
}
