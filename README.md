# airent-js

Airent Framework for JavaScript Backend - a lightweight data entity and presentation framework

## Why Airent?

- Airent effortlessly translates your database schema into the desired data types for your code, eliminating the need for manual configurations. For instance, if your database has a string field, Airent will automatically convert it into an enum or structure. Say goodbye to the hassle of handling type conversions!
- Dealing with data retrieval and business logic can become challenging when you load data in various ways. Remembering and managing the presence of specific fields with Plain Old Java Objects (POJO) can be cumbersome. Airent's intelligent framework detects the necessary fields and loads them automatically, sparing you from concerns about undefined fields.
- Airent empowers you to create customized data computation logic for both internal use and API presentations. These tailored fields are automatically loaded and computed according to the logic you define, all in a unified manner. You'll never have to worry about data computation again!
- Streamline data presentation on your API endpoints with Airent. Simply specify the desired fields you want to select, and let Airent handle the rest. No more worries about inadvertently exposing sensitive data!

## Getting Started

### Installation

First, install with npm:

```bash
npm install airent
```

Then, create the configuration file `airent.config.js` in the root directory of your project:

```json
{
  "type": "module", // optional, defaults to "commonjs"
  "schemaPath": "schemas",
  "outputPath": "src/entities"
}
```

## Build your data application with Airent

### Define your entity schema

Create a new YAML file in your schema directory, e.g. `schemas/User.yaml`:

```yaml
entity: User
# internal: true             # set internal to true if you do not want to
# generate API response for this entity
model:
  name: PrismaUser
  import:
    name: User
    package: "@prisma/client"
fields:
  - id: 1
    name: id
    type: string
    strategy: primitive # this field is loaded from db directly
  - id: 2
    name: createdAt
    type: Date
    strategy: primitive
  - id: 3
    name: updatedAt
    type: Date
    strategy: primitive
  - id: 4
    name: email
    type: string
    strategy: primitive
  - id: 5
    name: image
    type: string | null
    strategy: primitive
  - id: 6
    name: firstName
    type: string | null
    strategy: primitive
  - id: 7
    name: isAdmin
    type: boolean
    strategy:
      computed_sync # this field is computed from primitive fields
      # without extra data loading
    internal: true # this field will not be exposed to the API response
  - id: 8
    name: messages
    type: Message[] # you need to create message.yml for this entity
    strategy: association # this field is loaded from db by foreign keys
  - id: 9
    name: lastMessage
    type: Message | null
    strategy: computed_async # this field is computed based on "messages" field
```

#### Generate your data entity classes and types

Run the airent code generation command:

```bash
npx airent
```

and then you will find the following generated code in your `src/entities` directory:

```
src
└── entities
    ├── generated           -> generated code, don't touch
    │   ├── message-base.ts -> base class for Message entity
    │   ├── message-type.ts -> type definition for Message field request and response
    │   ├── user-base.ts    -> base class for User entity
    │   └── user-type.ts    -> type definition for User field request and response
    ├── message.ts          -> Message entity class
    └── user.ts             -> User entity class
```

#### Use your data entity classes

Load your data with ORM, and create the entity instances:

```typescript
import { PrismaClient } from "@prisma/client";
import { UserEntity } from "./entities/user";

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({ where: { id: 1 } });
const userEntity = UserEntity.fromOne(user);

console.log(userEntity.id); // 1

const users = await prisma.user.findMany({ where: { id: { lt: 100 } } });
const userEntities = UserEntity.fromArray(users);

console.log(userEntities[0].id); // 1
```

Use the entity instance to access the data:

```typescript
console.log(userEntity.email);
console.log(userEntity.isAdmin());
console.log(userEntity.await getLastMessage());
```

And present your entity in API endpoints:

```typescript
import { PrismaClient } from '@prisma/client';
import { UserEntity } from './entities/user';

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({ where: { id: 123 } });
const userEntity = UserEntity.fromOne(user);
const response = await userEntity.present({ id: true, firstMessage: true });


const users = await prisma.user.findMany({ where: { id: lt: 100 } });
const userEntities = UserEntity.fromArray(users);
const responses = await Promise.all(userEntities.map((u) => u.present()));
```

That is it. Enjoy!
