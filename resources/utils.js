/**********/
/* STRING */
/**********/

function pluralize(word) /** string */ {
  if (typeof word !== "string") {
    throw new Error(
      "[AIRENT/ERROR] prologues/defualt.pluralize: input must be a string"
    );
  }

  // Define some common rules for pluralization
  const pluralRules = [
    [/(ax|test|Ax|Test)is$/, "$1es"],
    [/(alias|status|Alias|Status)$/, "$1es"],
    [/(bu|Bu)s$/, "$1ses"],
    [/(buffal|tomat|Buffal|Tomat)o$/, "$1oes"],
    [/(hive|Hive)$/, "$1s"],
    [/(matr|vert|ind|Matr|Vert|Ind)ix|ex$/, "$1ices"],
    [/(octop|vir|Octoo|Vir)us$/, "$1i"],
    [/(quiz|Quiz)$/, "$1zes"],
    [/(x|ch|ss|sh)$/, "$1es"],
    [/([mlML])ouse$/, "$1ice"],
    [/([ti])um$/, "$1a"],
    [/([^aeiouy]|qu)y$/, "$1ies"],
    [/(?:([^f])fe|([lr])f)$/, "$1$2ves"],
    [/sis$/, "ses"],
    [/s$/, "es"],
    [/$/, "s"],
  ];

  // Check if the word matches any of the rules and apply the first matching rule
  for (const [pattern, replacement] of pluralRules) {
    if (pattern.test(word)) {
      return word.replace(pattern, replacement);
    }
  }

  return word + "s"; // If no rule matched, add 's' as a default pluralization
}

// example: "ChatUser" => "chatUser"
function toCamelCase(string) /** string */ {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

// example: "ChatUser" => "chat-user"
function toKababCase(string) /** string */ {
  return string
    .replace(/_/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

// example: "ChatUser" => "chat_user"
function toSnakeCase(string) {
  return string.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
}

// example: "chatUser" => "ChatUser"
function toTitleCase(string) /** string */ {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// example: "string[] | null" => "string"
function toPrimitiveTypeName(string) /** string */ {
  return string.split("|")[0].split("[]")[0].trim();
}

function getModuleSuffix(config) /* string */ {
  return config.isModule ? ".js" : "";
}

/**********/
/* QUERY  */
/**********/

function queryField(fieldName, entity) /* Field? */ {
  return entity.fields.find((field) => field.name === fieldName);
}

// UNSAFE BEFORE AUGMENTATION
function getSourceFields(field) /* Field[] */ {
  return (field.sourceKeys ?? [])
    .map((sfName) => queryField(sfName, field._parent))
    .filter(isSyncField);
}

// UNSAFE BEFORE AUGMENTATION
function getTargetFields(field) /* Field[] */ {
  return (field.targetKeys ?? [])
    .map((tfName) => queryField(tfName, field._type._entity))
    .filter(Boolean)
    .filter(isPrimitiveField);
}

// UNSAFE BEFORE AUGMENTATION
function getTargetFilters(field) /* Field[] */ {
  return (field.targetFilters ?? [])
    .flatMap((tf) =>
      Object.keys(tf).map((tfn) => {
        const name = tfn;
        const targetField = queryField(name, field._type._entity);
        if (!targetField || !isPrimitiveField(targetField)) {
          return null;
        }
        return { ...targetField, value: tf[tfn] };
      })
    )
    .filter(Boolean);
}

/***********/
/* BOOLEAN */
/***********/

function isPresentableEntity(entity) /* boolean */ {
  return entity.internal !== true;
}

// example
// - name: Message as PrismaMessage
//   import: "@prisma/client"
function isImportType(type) /* boolean */ {
  return !!type.import?.length;
}

// example
// - name: Attachment
//   define: "{ [key: string] : string }"
function isDefineType(type) /* boolean */ {
  return !!type.define?.length;
}

// example
// - name: SenderType
//   enum: '{ USER = "USER", CHATBOT = "CHATBOT" }'
function isEnumType(type) /* boolean */ {
  return !!type.enum?.length;
}

function isCustomType(type) /* boolean */ {
  return isDefineType(type) || isEnumType(type);
}

function isArrayField(field) /* boolean */ {
  return field.type.endsWith("[]");
}

function isNullableField(field) /* boolean */ {
  return field.type.endsWith(" | null");
}

function isPrimitiveField(field) /* boolean */ {
  return field.strategy === "primitive";
}

function isAssociationField(field) /* boolean */ {
  return field.strategy === "association";
}

function isComputedSyncField(field) /* boolean */ {
  return field.strategy === "computed";
}

function isComputedAsyncField(field) /* boolean */ {
  return field.strategy === "computedAsync";
}

function isSyncField(field) /* boolean */ {
  return isPrimitiveField(field) || isComputedSyncField(field);
}

// UNSAFE BEFORE AUGMENTATION
function isEntityType(type) /* boolean */ {
  return type._entity !== undefined;
}

// UNSAFE BEFORE AUGMENTATION
function isEntityTypeField(field) /* boolean */ {
  return field._type !== undefined && isEntityType(field._type);
}

// UNSAFE BEFORE AUGMENTATION
function isPresentableField(field) /* boolean */ {
  if (field.internal) {
    return false;
  }
  return !isEntityTypeField(field) || isPresentableEntity(field._type._entity);
}

// UNSAFE BEFORE AUGMENTATION
function isPresentableEntityType(type) /* boolean */ {
  return isEntityType(type) && isPresentableEntity(type._entity);
}

// UNSAFE BEFORE AUGMENTATION
function isDefaultPresentableField(field) /* boolean */ {
  return isPresentableField(field) && isSyncField(field);
}

module.exports = {
  pluralize,
  toCamelCase,
  toKababCase,
  toSnakeCase,
  toTitleCase,
  toPrimitiveTypeName,
  getModuleSuffix,
  queryField,
  getSourceFields,
  getTargetFields,
  getTargetFilters,
  isPresentableEntity,
  isEntityType,
  isImportType,
  isDefineType,
  isEnumType,
  isCustomType,
  isArrayField,
  isNullableField,
  isPrimitiveField,
  isAssociationField,
  isComputedSyncField,
  isComputedAsyncField,
  isSyncField,
  isEntityTypeField,
  isPresentableField,
  isPresentableEntityType,
  isDefaultPresentableField,
};
