const utils = require("./utils.js");

function buildTypes(entity, entityMap) /* void */ {
  const allEntityNameSet = new Set(Object.keys(entityMap));
  const selectedEntityNames = entity.fields
    .map((field) => field.type)
    .map(utils.toPrimitiveTypeName)
    .filter((n) => allEntityNameSet.has(n));
  const entityTypes = Array.from(new Set(selectedEntityNames))
    .sort()
    .map((name) => ({ name, entity: true, _entity: entityMap[name] }));
  return [...entity.types, ...entityTypes].map((type) => ({
    ...type,
    _parent: entity,
  }));
}

function buildFields(entity) /* void */ {
  return entity.fields.map((field) => ({
    ...field,
    _parent: entity,
    _type: entity.types.find(
      (type) => type.name === utils.toPrimitiveTypeName(field.type)
    ),
  }));
}

function getModuleSuffix(config) /* string */ {
  return config.isModule ? ".js" : "";
}

function augmentEntity(entity, config) /** void */ {
  const { name } = entity;
  const entName = utils.toTitleCase(name);
  const prefix = utils.toKababCase(name);
  const suffix = getModuleSuffix(config);
  entity.strings = {
    loaderName: `${utils.toCamelCase(entName)}Loader`,
    baseClass: `${entName}EntityBase`,
    entityClass: `${entName}Entity`,
    fieldRequestClass: `${entName}FieldRequest`,
    responseClass: `${entName}Response`,
    basePackage: `${prefix}-base${suffix}`,
    entityPackage: `${prefix}${suffix}`,
    typePackage: `${prefix}-type${suffix}`,
  };
  entity.code = {
    beforeBase: [],
    insideBase: [],
    afterBase: [],
    beforeEntity: [],
    insideEntity: [],
    afterEntity: [],
    beforeType: [],
    afterType: [],
  };
}

function augmentType(type, config) /* Object */ {
  if (type._entity !== undefined) {
    const entName = utils.toTitleCase(type.name);
    const prefix = `${utils.toKababCase(entName)}`;
    const suffix = getModuleSuffix(config);
    type.strings = {
      entityClass: `${entName}Entity`,
      entityPackage: `${prefix}${suffix}`,
      fieldRequestClass: `${entName}FieldRequest`,
      responseClass: `${entName}Response`,
      typePackage: `${prefix}-type${suffix}`,
    };
  } else if (utils.isImportType(type)) {
    const aliasSuffix = type.aliasOf ? ` as ${type.name}` : "";
    const externalClass = `${type.aliasOf ?? type.name}${aliasSuffix}`;
    type.strings = { externalClass, externalPackage: type.import };
  } else if (utils.isDefineType(type)) {
    type.strings = { typeDefinition: type.define };
  } else if (utils.isEnumType(type)) {
    type.strings = { typeDefinition: type.enum };
  }
}

function augmentField(field) /* Object */ {
  const typeName = utils.toPrimitiveTypeName(field.type);
  if (field._type?._entity !== undefined) {
    const entName = utils.toTitleCase(typeName);
    const entityClass = `${entName}Entity`;
    const responseClass = `${entName}Response`;

    field.strings = {
      fieldClass: entityClass,
      fieldType: field.type.replace(typeName, entityClass),
      fieldRequestType: `${entName}FieldRequest | boolean`,
      fieldResponseType: field.type.replace(typeName, responseClass),
    };
  } else {
    const fieldModelName = field.aliasOf ?? field.name;
    const fieldAliasSuffix = field.cast ? ` as ${field.type}` : "";
    const fieldInitializer = utils.isPrimitiveField(field)
      ? `model.${fieldModelName}${fieldAliasSuffix}`
      : undefined;

    field.strings = {
      fieldInitializer,
      fieldClass: typeName,
      fieldType: field.type,
      fieldRequestType: "boolean",
      fieldResponseType: field.type,
    };
  }
}

function augment(data) /* void */ {
  const { entity, entityMap, config } = data;
  entity._parent = entityMap;
  entity.types = buildTypes(entity, entityMap);
  entity.fields = buildFields(entity);
  augmentEntity(entity, config);
  entity.types.forEach((type) => augmentType(type, config));
  entity.fields.forEach((field) => augmentField(field));
  entity.isAugmented = true;
}

module.exports = { augment };
