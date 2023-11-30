/**********/
/* STRING */
/**********/

function pluralize(word) /** string */ {
  if (typeof word !== "string") {
    throw new Error("[AIRENT/ERROR] utils/pluralize: input must be a string");
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

function getModuleSuffix() /* string */ {
  return config.isModule ? ".js" : "";
}

/**********/
/* QUERY  */
/**********/

function queryType(typeName) /* Type */ {
  return (
    schema.types.find((type) => type.name === typeName) ?? {
      name: typeName,
      import: "TODO: import your type",
    }
  );
}

function queryOtherEntityField(entityName, fieldName) /* Field */ {
  const entitySchema = schemaMap[entityName];
  return (
    entitySchema.fields.find((field) => field.name === fieldName) ?? {
      name: fieldName,
      type: "any",
      strategy: "primitive",
    }
  );
}

function queryField(fieldName) /* Field */ {
  return queryOtherEntityField(schema.entityName, fieldName);
}

function getSourceFields(field) /* Field[] */ {
  return (field.sourceFields ?? [])
    .map(queryField)
    .filter(Boolean)
    .filter(isSyncField);
}

function getTargetFields(field) /* Field[] */ {
  const otherEntityName = toTitleCase(toPrimitiveTypeName(field.type));
  return (field.targetFields ?? [])
    .map((tfName) => queryOtherEntityField(otherEntityName, tfName))
    .filter(Boolean)
    .filter(isPrimitiveField);
}

/**********/
/* NUMBER */
/**********/

function getSourceKeySize(field) /* number */ {
  return getSourceFields(field).length;
}

function getTargetKeySize(field) /* number */ {
  return getTargetFields(field).length;
}

/***********/
/* BOOLEAN */
/***********/

// example
// - name: User
//   entity: true
function isEntityType(type) /* boolean */ {
  return !!type.entity;
}

// example
// - name: Message as PrismaMessage
//   import: "@prisma/client"
function isExternalType(type) /* boolean */ {
  return !!type.import?.length;
}

// example
// - name: Attachment
//   define: "{ [key: string] : string }"
function isDefinableType(type) /* boolean */ {
  return !!type.define?.length;
}

// example
// - name: SenderType
//   enum: '{ USER = "USER", CHATBOT = "CHATBOT" }'
function isEnumerableType(type) /* boolean */ {
  return !!type.enum?.length;
}

function isInternalType(type) /* boolean */ {
  return isDefinableType(type) || isEnumerableType(type);
}

function isPrimitiveField(field) /* boolean */ {
  return field.strategy === "primitive";
}

function isAssociationField(field) /* boolean */ {
  return field.strategy === "association";
}

function isComputedSyncField(field) /* boolean */ {
  return field.strategy === "computed_sync";
}

function isComputedAsyncField(field) /* boolean */ {
  return field.strategy === "computed_async";
}

function isExternalField(field) /* boolean */ {
  return !field.internal;
}

function isSyncField(field) /* boolean */ {
  return isPrimitiveField(field) || isComputedSyncField(field);
}

function isDefaultPresentableField(field) /* boolean */ {
  return isExternalField(field) && isSyncField(field);
}

function isArrayField(field) /* boolean */ {
  return field.type.endsWith("[]");
}

function isNullableField(field) /* boolean */ {
  return field.type.endsWith(" | null");
}

function isEntityTypeField(field) /* boolean */ {
  const fieldTypeName = toPrimitiveTypeName(field.type);
  const type = queryType(fieldTypeName);
  return isEntityType(type);
}

function hasSourceKey(field) /* boolean */ {
  return getSourceKeySize(field) > 0;
}

function hasTargetKey(field) /* boolean */ {
  return getTargetKeySize(field) > 0;
}

function isGetterGeneratable(field) /* boolean */ {
  return getSourceKeySize(field) === getTargetKeySize(field);
}

function isLoaderGeneratable(_field) /* boolean */ {
  return false;
}

function isSetterGeneratable(field) /* boolean */ {
  return getSourceKeySize(field) === getTargetKeySize(field);
}

/**********/
/* OBJECT */
/**********/

function getThisEntityStrings() /* Object */ {
  const { entityName } = schema;
  const prefix = toKababCase(entityName);
  const suffix = getModuleSuffix();
  return {
    entName: entityName,
    loaderName: `${toCamelCase(entityName)}Loader`,
    baseClass: `${entityName}EntityBase`,
    entityClass: `${entityName}Entity`,
    fieldRequestClass: `${entityName}FieldRequest`,
    responseClass: `${entityName}Response`,
    basePackage: `${prefix}-base${suffix}`,
    entityPackage: `${prefix}${suffix}`,
    typePackage: `${prefix}-type${suffix}`,
  };
}

function getTypeStrings(type) /* Object */ {
  if (isEntityType(type)) {
    const entName = toTitleCase(type.name);
    const prefix = `${toKababCase(entName)}`;
    const suffix = getModuleSuffix();
    return {
      entityClass: `${entName}Entity`,
      entityPackage: `${prefix}${suffix}`,
      fieldRequestClass: `${entName}FieldRequest`,
      responseClass: `${entName}Response`,
      typePackage: `${prefix}-type${suffix}`,
    };
  } else if (isExternalType(type)) {
    return { externalClass: type.name, externalPackage: type.import };
  } else if (isDefinableType(type)) {
    return { typeName: type.name, typeDefinition: type.define };
  } else if (isEnumerableType(type)) {
    return { typeName: type.name, typeDefinition: type.enum };
  } else {
    throw new Error(
      `[AIRENT/ERROR] utils/getTypeStrings: invalid type ${type.name}`
    );
  }
}

function getFieldStrings(field) /* Object */ {
  const primitiveTypeName = toPrimitiveTypeName(field.type);
  if (isEntityTypeField(field)) {
    const entName = toTitleCase(primitiveTypeName);
    const entityClass = `${entName}Entity`;
    const responseClass = `${entName}Response`;

    return {
      fieldClass: entityClass,
      fieldType: field.type.replace(primitiveTypeName, entityClass),
      fieldRequestType: `${entName}FieldRequest | boolean`,
      fieldResponseType: field.type.replace(primitiveTypeName, responseClass),
    };
  } else {
    const fieldModelName = field.aliasOf ?? field.name;
    const fieldAliasSuffix = field.cast ? ` as ${field.type}` : "";
    const fieldInitializer = isPrimitiveField(field)
      ? `model.${fieldModelName}${fieldAliasSuffix}`
      : undefined;
    return {
      fieldInitializer,
      fieldClass: primitiveTypeName,
      fieldType: field.type,
      fieldRequestType: "boolean",
      fieldResponseType: field.type,
    };
  }
}

/********/
/* CODE */
/********/

/* piece */

function getFieldGetterName(field) /* Code */ {
  if (isPrimitiveField(field)) {
    return `${field.name}`;
  }
  return `get${toTitleCase(field.name)}()`;
}

function getFieldLoadConfigName(field) /* Code */ {
  const className = getThisEntityStrings().entityClass;
  const fieldName = field.name;
  return `${className}.${fieldName}`;
}

function getSelfLoadedModels() /* Code */ {
  return "[/* TODO: load models with load keys */]";
}

function getTargetLoadedModels(field) /* Code */ {
  if (getSourceKeySize(field) > 0) {
    return "[/* TODO: load associated models with load keys */]";
  } else {
    return "[/* TODO: load associated models here */]";
  }
}

/* line */

// field presenter //

function getFieldPresenter(field) /* Code */ {
  const presentCondition = `fieldRequest?.${field.name}`;
  const getterName = `this.${getFieldGetterName(field)}`;
  const getter = isSyncField(field) ? getterName : `await ${getterName}`;
  let presenter = getter;
  if (isEntityTypeField(field)) {
    if (isArrayField(field)) {
      presenter += `.then((a) => Promise.all(a.map((one) => one.present(${presentCondition}))))`;
    } else if (isNullableField(field)) {
      presenter += `.then((one) => one === null ? Promise.resolve(null) : one.present(${presentCondition}))`;
    } else {
      presenter += `.then((one) => one.present(${presentCondition}))`;
    }
  }
  return `${presentCondition} ? ${presenter} : undefined`;
}

// association loader //

// internal
function buildAssociationKey(keyFields, type) /* Code */ {
  if (keyFields.length === 0) {
    return `'TODO: map your ${type} entity to key'`;
  }
  const getters = keyFields
    .map(getFieldGetterName)
    .map((getterName) => `one.${getterName}`);
  return "`" + getters.map((getter) => `\${${getter}}`).join("*") + "`";
}

function getLoadConfigTargetMapper(field) /* Code */ {
  const mapBuilder = isArrayField(field) ? "toArrayMap" : "toObjectMap";
  const targetFields = getTargetFields(field);
  const targetKey = buildAssociationKey(targetFields, "target");
  return `${mapBuilder}(targets, (one) => ${targetKey}, (one) => one)`;
}

function getLoadConfigSourceSetter(field) /* Code */ {
  const sourceFields = getSourceFields(field);
  const sourceKey = buildAssociationKey(sourceFields, "source");
  const fallback = isArrayField(field)
    ? " ?? []"
    : isNullableField(field)
    ? " ?? null"
    : "!";
  return `map.get(${sourceKey})${fallback}`;
}

/* block */

// global //

function getGlobalImports() /* Code[] */ {
  return [];
}

function getLoadConfigGetterLines(field, end) /* Code[] */ {
  const sourceFields = getSourceFields(field);
  const targetFields = getTargetFields(field);
  // reject nullable sourceField whose targetField is required
  const filters = sourceFields
    .filter((sf, i) => isNullableField(sf) && !isNullableField(targetFields[i]))
    .map((sf) => `.filter((one) => one.${getFieldGetterName(sf)} !== null)`);
  const mappedFields = sourceFields.map((sf, i) => {
    const rawTargetFieldName = targetFields[i].aliasOf ?? targetFields[i].name;
    return `  ${rawTargetFieldName}: one.${getFieldGetterName(sf)},`;
  });
  return [...filters, `.map((one) => ({`, ...mappedFields, `}))${end}`];
}
