/** string utils */

// internal
function toKababCase(string) {
  return string
    .replace(/_/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function toTitleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// internal
function toPrimitiveTypeName(string) {
  return string.split("|")[0].split("[]")[0].trim();
}

/** type utils */
function isEntityType(type) {
  return !!type.entity;
}
function isDefinableType(type) {
  return !!type.define?.length;
}
function isEnumerableType(type) {
  return !!type.enum?.length;
}
function isInternalType(type) {
  return isDefinableType(type) || isEnumerableType(type);
}
function isExternalType(type) {
  return !!type.import?.length;
}

/** field utils */

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
  const type = types.find((type) => type.name === fieldTypeName);
  return !!type && isEntityType(type);
}

function getFieldGetterName(field) {
  if (isPrimitiveField(field)) {
    return `${field.name}`;
  }
  return `get${toTitleCase(field.name)}()`;
}

// internal
function queryField(fieldName) {
  return (
    fields.find((field) => field.name === fieldName) ?? {
      name: fieldName,
      type: "any",
      strategy: "primitive",
    }
  );
}

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

function hasAssociationKeys(field) {
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
  const nullableSourceFields = getSourceFields(field);
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

// internal
function getTargetKey(field) {
  const getters = (field.targetFields ?? []).map(
    (fieldName) => `one.${fieldName}`
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

function getTargetGetter(field) {
  return hasTargetKey(field)
    ? getTargetKey(field)
    : "'TODO: map your target entity to key'";
}

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
  return isModule ? ".js" : "";
}

function getThisEntityStrings() {
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

function getOtherEntityStrings(field) {
  const entName = toTitleCase(toPrimitiveTypeName(field.type));

  const prefix = toKababCase(entName);
  const suffix = getModuleSuffix();

  const entityClass = `${entName}Entity`;
  const responseClass = `${entName}Response`;

  return {
    entName,
    entityClass,
    fieldRequestClass: `${entName}FieldRequest`,
    responseClass,
    entityPackage: `${prefix}${suffix}`,
    typePackage: `${prefix}-type${suffix}`,
    entityFieldType: field.type.replace(entName, entityClass),
    responseFieldType: field.type.replace(entName, responseClass),
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
  if (isEntityTypeField(field)) {
    const otherEntityStrings = getOtherEntityStrings(field);
    return {
      fieldGetterName: getFieldGetterName(field),
      fieldType: otherEntityStrings.entityFieldType,
      fieldRequestType: `${otherEntityStrings.fieldRequestClass} | boolean`,
      fieldResponseType: otherEntityStrings.responseFieldType,
      fieldPresenter: getFieldPresenter(field),
    };
  } else {
    return {
      fieldGetterName: getFieldGetterName(field),
      fieldType: field.type,
      fieldRequestType: "boolean",
      fieldResponseType: field.type,
      fieldPresenter: getFieldPresenter(field),
    };
  }
}
