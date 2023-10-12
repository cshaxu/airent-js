/** string utils */

// internal
// example: "ChatUser" => "chat-user"
function toKababCase(string) {
  return string
    .replace(/_/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

// internal
// example: "string[] | null" => "string"
function toPrimitiveTypeName(string) {
  return string.split("|")[0].split("[]")[0].trim();
}

// example: "chatUser" => "ChatUser"
function toTitleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/** global import utils */
function getGlobalImports() {
  return [];
}

/** type utils */

// internal
function queryType(typeName) {
  return (
    schema.types.find((type) => type.name === typeName) ?? {
      name: typeName,
      import: "TODO: import your type",
    }
  );
}

// example
// - name: User
//   entity: true
function isEntityType(type) {
  return !!type.entity;
}

// example
// - name: Message as PrismaMessage
//   import: "@prisma/client"
function isExternalType(type) {
  return !!type.import?.length;
}

// example
// - name: Attachment
//   define: "{ [key: string] : string }"
function isDefinableType(type) {
  return !!type.define?.length;
}

// example
// - name: SenderType
//   enum: '{ USER = "USER", CHATBOT = "CHATBOT" }'
function isEnumerableType(type) {
  return !!type.enum?.length;
}

function isInternalType(type) {
  return isDefinableType(type) || isEnumerableType(type);
}

/** field utils */

// internal
function queryField(fieldName) {
  return (
    schema.fields.find((field) => field.name === fieldName) ?? {
      name: fieldName,
      type: "any",
      strategy: "primitive",
    }
  );
}

function isPrimitiveField(field) {
  return field.strategy === "primitive";
}

function isAssociationField(field) {
  return field.strategy === "association";
}

function isComputedSyncField(field) {
  return field.strategy === "computed_sync";
}

function isComputedAsyncField(field) {
  return field.strategy === "computed_async";
}

function isExternalField(field) {
  return !field.internal;
}

function isSyncField(field) {
  return isPrimitiveField(field) || isComputedSyncField(field);
}

function isDefaultPresentableField(field) {
  return isExternalField(field) && isSyncField(field);
}

function isArrayField(field) {
  return field.type.endsWith("[]");
}

// internal
function isNullableField(field) {
  return field.type.endsWith(" | null");
}

// internal
function isEntityTypeField(field) {
  const fieldTypeName = toPrimitiveTypeName(field.type);
  const type = queryType(fieldTypeName);
  return isEntityType(type);
}

function getFieldGetterName(field) {
  if (isPrimitiveField(field)) {
    return `${field.name}`;
  }
  return `get${toTitleCase(field.name)}()`;
}

/** field association utils */

function getSourceFields(field) {
  return (field.sourceFields ?? [])
    .map(queryField)
    .filter(Boolean)
    .filter(isSyncField);
}

function hasSourceKey(field) {
  return getSourceFields(field).length;
}

// internal
function hasTargetKey(field) {
  return field.targetFields?.length;
}

function isLoaderGeneratable(field) {
  return hasSourceKey(field) && hasTargetKey(field) && false;
}

function getTargetLoadedModels(field) {
  if (hasSourceKey(field)) {
    return "[/* TODO: load associated models with the above keys */]";
  } else {
    return "[/* TODO: load associated models here */]";
  }
}

function isSetterGeneratable(field) {
  return hasSourceKey(field) && hasTargetKey(field);
}

function getFieldParamsName(field) {
  const className = getThisEntityStrings().entityClass;
  const fieldName = field.name;
  return `${className}.${fieldName}`;
}

// internal
function getNullableCondition(field) {
  if (!isNullableField(field)) {
    return "";
  }
  const nullableSourceFields = getSourceFields(field).filter((sf) =>
    isNullableField(sf)
  );
  if (nullableSourceFields.length === 0) {
    return "";
  }
  const condition = nullableSourceFields
    .map(getFieldGetterName)
    .map((s) => `one.${s} === null`)
    .join(" || ");
  return `${condition} ? null : `;
}

// internal
function getSourceKey(field) {
  const getters = getSourceFields(field).map(
    (sf) =>
      `one.${getFieldGetterName(sf)}${
        isNullableField(sf) && !isPrimitiveField(sf) ? "!" : ""
      }`
  );
  if (getters.length === 1) {
    return getters[0];
  }
  return "`" + getters.map((getter) => `\${${getter}}`).join("*") + "`";
}

function getSourceSetter(field) {
  const nullableCondition = getNullableCondition(field);
  const sourceKey = hasSourceKey(field)
    ? getSourceKey(field)
    : "'TODO: map your source entity to key'";
  const fallbackValue = isArrayField(field)
    ? " ?? []"
    : isNullableField(field)
    ? " ?? null"
    : "!";
  return `${nullableCondition}map.get(${sourceKey})${fallbackValue}`;
}

function getTargetMap(field) {
  const mapBuilder = isArrayField(field) ? "toArrayMap" : "toObjectMap";
  const targetGetters = (field.targetFields ?? []).map(
    (fieldName) => `one.${fieldName}`
  );
  const targetKey = !hasTargetKey(field)
    ? "'TODO: map your target entity to key'"
    : targetGetters.length === 1
    ? targetGetters[0]
    : "`" + targetGetters.map((getter) => `\${${getter}}`).join("*") + "`";
  return `${mapBuilder}(loaded, (one) => ${targetKey}, (one) => one)`;
}

/** field presentation utils */

// internal
function getFieldPresenter(field) {
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

/** object utils */

// internal
function getModuleSuffix() {
  return config.isModule ? ".js" : "";
}

function getThisEntityStrings() {
  const { entityName } = schema;
  const prefix = toKababCase(entityName);
  const suffix = getModuleSuffix();
  return {
    entName: entityName,
    baseClass: `${entityName}EntityBase`,
    entityClass: `${entityName}Entity`,
    fieldRequestClass: `${entityName}FieldRequest`,
    responseClass: `${entityName}Response`,
    basePackage: `${prefix}-base${suffix}`,
    entityPackage: `${prefix}${suffix}`,
    typePackage: `${prefix}-type${suffix}`,
  };
}

function getTypeStrings(type) {
  if (isEntityType(type)) {
    const prefix = `${toKababCase(type.name)}`;
    const suffix = getModuleSuffix();
    return {
      entityClass: `${type.name}Entity`,
      entityPackage: `${prefix}${suffix}`,
      fieldRequestClass: `${type.name}FieldRequest`,
      responseClass: `${type.name}Response`,
      typePackage: `${prefix}-type${suffix}`,
    };
  } else if (isExternalType(type)) {
    return { externalClass: type.name, externalPackage: type.import };
  } else if (isDefinableType(type)) {
    return { typeName: type.name, typeDefinition: type.define };
  } else if (isEnumerableType(type)) {
    return { typeName: type.name, typeDefinition: type.enum };
  } else {
    throw new Error(`invalid type ${type.name}`);
  }
}

function getFieldStrings(field) {
  const fieldStrings = {
    fieldGetterName: getFieldGetterName(field),
    fieldPresenter: getFieldPresenter(field),
  };
  if (isEntityTypeField(field)) {
    const entName = toTitleCase(toPrimitiveTypeName(field.type));
    const entityClass = `${entName}Entity`;
    const responseClass = `${entName}Response`;

    return {
      ...fieldStrings,
      fieldClass: entityClass,
      fieldType: field.type.replace(entName, entityClass),
      fieldRequestType: `${entName}FieldRequest | boolean`,
      fieldResponseType: field.type.replace(entName, responseClass),
    };
  } else {
    const fieldModelName = field.aliasOf ?? field.name;
    const fieldAliasSuffix = field.cast ? ` as ${field.type}` : "";
    const fieldInitializer = isPrimitiveField(field)
      ? `model.${fieldModelName}${fieldAliasSuffix}`
      : undefined;
    return {
      ...fieldStrings,
      fieldInitializer,
      fieldClass: toPrimitiveTypeName(field.type),
      fieldType: field.type,
      fieldRequestType: "boolean",
      fieldResponseType: field.type,
    };
  }
}
