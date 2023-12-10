const utils = require("./utils.js");

function getModuleSuffix(config) /* string */ {
  return config.isModule ? ".js" : "";
}

function augmentEntity(entity, entityMap, config) /** void */ {
  const { name } = entity;
  const entName = utils.toTitleCase(name);
  const prefix = utils.toKababCase(name);
  const suffix = getModuleSuffix(config);
  entity._parent = entityMap;
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
}

function buildAugmentedType(type, entity, config) /* Object */ {
  type._parent = entity;
  if (utils.isEntityType(type)) {
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
  return type;
}

function augmentTypes(entity, entityMap, config) /** void */ {
  const allEntityNameSet = new Set(Object.keys(entityMap));
  const selectedEntityNames = entity.fields
    .map((field) => field.type)
    .map(utils.toPrimitiveTypeName)
    .filter((n) => allEntityNameSet.has(n));
  const entityTypes = Array.from(new Set(selectedEntityNames))
    .sort()
    .map((name) => ({ name, entity: true, _entity: entityMap[name] }));
  entity.types = [...entity.types, ...entityTypes].map((type) =>
    buildAugmentedType(type, entity, config)
  );
}

function buildAugmentedField(field, entity) /* Object */ {
  field._parent = entity;
  const typeName = utils.toPrimitiveTypeName(field.type);
  field._type = entity.types.find((type) => type.name === typeName);

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
  return field;
}

function augmentFields(entity) /* void */ {
  entity.fields = entity.fields.map((field) =>
    buildAugmentedField(field, entity)
  );
}

function augment(data) /* void */ {
  const { entity, entityMap, config } = data;
  augmentEntity(entity, entityMap, config);
  augmentTypes(entity, entityMap, config);
  augmentFields(entity);
}

module.exports = { augment };
