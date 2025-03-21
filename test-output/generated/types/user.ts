// airent imports
import { Select } from '../../../src/index.js';

// entity imports
import { UserModel } from '../../../test-sources/models.js';
import { MessageFieldRequest, MessageResponse } from './message.js';
import { ChatUserFieldRequest, ChatUserResponse } from './chat-user.js';

export type UserFieldRequest = {
  id?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  email?: boolean;
  firstName?: boolean;
  lastName?: boolean;
  imageUrl?: boolean;
  /** @deprecated */
  chatUsers?: ChatUserFieldRequest;
  /** @deprecated */
  firstMessage?: MessageFieldRequest;
  hasAnyMessage?: boolean;
};

export type UserResponse = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  /** @deprecated */
  chatUsers?: ChatUserResponse[];
  /** @deprecated */
  firstMessage?: MessageResponse | null;
  hasAnyMessage?: boolean;
};

export type SelectedUserResponse<S extends UserFieldRequest> = Select<UserResponse, S>;
