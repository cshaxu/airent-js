const utils = require("./utils.js");

// build templates

function getSelfLoaderLines(entity) /* Code[] */ {
  const { selfModelsLoader, selfLoaderLines } = entity.code;
  if (selfLoaderLines !== undefined) {
    return selfLoaderLines;
  }
  return [
    `const models = ${selfModelsLoader};`,
    "return (this as any).fromArray(models);",
  ];
}

function getLoadConfigGetterLines(field) /* Code[] */ {
  const { getterLines } = field.code.loadConfig;
  if (getterLines !== undefined) {
    return getterLines;
  }
  const sourceFields = utils.getSourceFields(field);
  const targetFields = utils.getTargetFields(field);
  const targetFilters = utils.getTargetFilters(field);
  // reject nullable sourceField whose targetField is required
  const filters = sourceFields
    .filter(
      (sf, i) =>
        utils.isNullableField(sf) && !utils.isNullableField(targetFields[i])
    )
    .map((sf) => `  .filter((one) => one.${sf.strings.fieldGetter} !== null)`);
  const mappedFields = sourceFields.map((sf, i) => {
    const rawTargetFieldName = targetFields[i].aliasOf ?? targetFields[i].name;
    return `    ${rawTargetFieldName}: one.${sf.strings.fieldGetter},`;
  });
  const filterFields = targetFilters.map((tf) => {
    const rawTargetFieldName = tf.aliasOf ?? tf.name;
    return `    ${rawTargetFieldName}: ${tf.value},`;
  });
  return [
    "return sources",
    ...filters,
    "  .map((one) => ({",
    ...mappedFields,
    ...filterFields,
    "  }));",
  ];
}

function getLoadConfigLoaderLines(field) /* Code[] */ {
  const { targetModelsLoader, loaderLines } = field.code.loadConfig;
  if (loaderLines !== undefined) {
    return loaderLines;
  }
  if (utils.isEntityTypeField(field)) {
    const { fieldClass } = field.strings;
    return [
      `const models = ${targetModelsLoader};`,
      `return ${fieldClass}.fromArray(models);`,
    ];
  } else {
    return [`return ${targetModelsLoader};`];
  }
}

function getLoadConfigSetterLines(field) /* Code[] */ {
  const { targetMapper, sourceSetter, setterLines } = field.code.loadConfig;
  if (setterLines !== undefined) {
    return setterLines;
  }
  return [
    `const map = ${targetMapper};`,
    `sources.forEach((one) => (one.${field.name} = ${sourceSetter}));`,
  ];
}

function augmentTemplates(templates) /* void */ {
  const entityTemplate = templates.find((t) =>
    t.name.includes("entity-template.ts.ejs")
  );
  entityTemplate.functions = {
    getLoadConfigGetterLines,
    getLoadConfigLoaderLines,
    getLoadConfigSetterLines,
  };
  const baseTemplate = templates.find((t) =>
    t.name.includes("base-template.ts.ejs")
  );
  baseTemplate.functions = {
    getSelfLoaderLines,
    ...entityTemplate.functions,
  };
}

// augment entity - add metadata

function buildTypes(entity) /* void */ {
  const { _parent: entityMap } = entity;
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

function addMetadata(entity, entityMap) /* void */ {
  entity._parent = entityMap;
  entity.types = buildTypes(entity);
  entity.fields = buildFields(entity);
}

// augment entity - add strings

function buildEntityStrings(entity, config) /* Object */ {
  const { name } = entity;
  const entName = utils.toTitleCase(name);
  const prefix = utils.toKababCase(name);
  const suffix = utils.getModuleSuffix(config);
  return {
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

function buildTypeStrings(type, config) /* Object */ {
  if (type._entity !== undefined) {
    const entName = utils.toTitleCase(type.name);
    const prefix = `${utils.toKababCase(entName)}`;
    const suffix = utils.getModuleSuffix(config);
    return {
      entityClass: `${entName}Entity`,
      entityPackage: `${prefix}${suffix}`,
      fieldRequestClass: `${entName}FieldRequest`,
      responseClass: `${entName}Response`,
      typePackage: `${prefix}-type${suffix}`,
    };
  } else if (utils.isImportType(type)) {
    const aliasSuffix = type.aliasOf ? ` as ${type.name}` : "";
    const externalClass = `${type.aliasOf ?? type.name}${aliasSuffix}`;
    return { externalClass, externalPackage: type.import };
  } else if (utils.isDefineType(type)) {
    return { typeDefinition: type.define };
  } else if (utils.isEnumType(type)) {
    return { typeDefinition: type.enum };
  }
}

function buildFieldStrings(field) /* Object */ {
  const typeName = utils.toPrimitiveTypeName(field.type);
  const isEntityTypeField = field._type?._entity !== undefined;
  const fieldGetter = utils.isPrimitiveField(field)
    ? field.name
    : `get${utils.toTitleCase(field.name)}()`;

  if (isEntityTypeField) {
    const entName = utils.toTitleCase(typeName);
    const entityClass = `${entName}Entity`;
    const responseClass = `${entName}Response`;

    return {
      fieldClass: entityClass,
      fieldType: field.type.replace(typeName, entityClass),
      fieldRequestType: `${entName}FieldRequest`,
      fieldResponseType: field.type.replace(typeName, responseClass),
      fieldGetter,
    };
  } else {
    const fieldModelName = field.aliasOf ?? field.name;
    const fieldAliasSuffix = field.cast ? ` as ${field.type}` : "";
    const fieldInitializer = utils.isPrimitiveField(field)
      ? `model.${fieldModelName}${fieldAliasSuffix}`
      : undefined;

    return {
      fieldInitializer,
      fieldClass: typeName,
      fieldType: field.type,
      fieldRequestType: "boolean",
      fieldResponseType: field.type,
      fieldGetter,
    };
  }
}

function addStrings(entity, config) /* void */ {
  entity.strings = buildEntityStrings(entity, config);
  entity.types.forEach((t) => (t.strings = buildTypeStrings(t, config)));
  entity.fields.forEach((f) => (f.strings = buildFieldStrings(f)));
}

// augment entity - add code

function buildEntityCode(entity) /* Object */ {
  return {
    beforeBase: [],
    insideBase: [],
    afterBase: [],
    beforeEntity: [],
    insideEntity: [],
    afterEntity: [],
    beforeType: [],
    afterType: [],
    selfModelsLoader: `[/* TODO: load models for ${entity.strings.entityClass} */]`,
    selfLoaderLines: undefined,
  };
}

function buildFieldPresenter(field) /* Code */ {
  const { name, strings } = field;
  const { fieldGetter } = strings;
  const childFieldRequest = `fieldRequest.${name}!`;
  let presenter = utils.isSyncField(field)
    ? `this.${fieldGetter}`
    : `await this.${fieldGetter}`;
  if (utils.isEntityTypeField(field)) {
    if (utils.isArrayField(field)) {
      presenter += `.then((a) => Promise.all(a.map((one) => one.present(${childFieldRequest}))))`;
    } else if (utils.isNullableField(field)) {
      presenter += `.then((one) => one === null ? Promise.resolve(null) : one.present(${childFieldRequest}))`;
    } else {
      presenter += `.then((one) => one.present(${childFieldRequest}))`;
    }
  }
  return presenter;
}

function buildFieldAssociationKeyString(keyFields, keyType) /* Code */ {
  if (keyFields.length === 0) {
    return `'TODO: map your ${keyType} entity to key'`;
  }
  const jointKey = keyFields
    .map((kf) => `\${one.${kf.strings.fieldGetter}}`)
    .join("*");
  return "`" + jointKey + "`";
}

function buildFieldLoadConfigTargetMapper(field) /* Code */ {
  const mapBuilder = utils.isArrayField(field) ? "toArrayMap" : "toObjectMap";
  const targetFields = utils.getTargetFields(field);
  const targetKeyString = buildFieldAssociationKeyString(
    targetFields,
    "target"
  );
  return `${mapBuilder}(targets, (one) => ${targetKeyString}, (one) => one)`;
}

function buildFieldLoadConfigSourceSetter(field) /* Code */ {
  const sourceFields = utils.getSourceFields(field);
  const targetFields = utils.getTargetFields(field);
  const nullConditions = sourceFields
    .filter(
      (sf, i) =>
        utils.isNullableField(sf) && !utils.isNullableField(targetFields[i])
    )
    .map((sf) => `one.${sf.strings.fieldGetter} === null`)
    .join(" || ");
  const nullSetter =
    nullConditions.length === 0
      ? ""
      : `(${nullConditions}) ? ${utils.isArrayField(field) ? "[]" : "null"} : `;
  const sourceKeyString = buildFieldAssociationKeyString(
    sourceFields,
    "source"
  );
  const fallback = utils.isArrayField(field)
    ? " ?? []"
    : utils.isNullableField(field)
    ? " ?? null"
    : "!";
  return `${nullSetter}map.get(${sourceKeyString})${fallback}`;
}

function buildFieldLoadConfig(field) /* Object */ {
  const loadConfig = {};
  loadConfig.isGetterGeneratable = field.skipGetter !== true;
  loadConfig.isLoaderGeneratable = false;
  loadConfig.isSetterGeneratable = field.skipSetter !== true;
  loadConfig.name = `${field._parent.strings.entityClass}.${field.name}`;
  // for loadConfig.getter
  loadConfig.getterLines = undefined;
  // for loadConfig.loader
  loadConfig.targetModelsLoader = `[/* TODO: load ${
    field._type?._entity?.strings.entityClass ?? "associated"
  } models */]`;
  loadConfig.loaderLines = undefined;
  // for loadConfg.setter
  loadConfig.targetMapper = buildFieldLoadConfigTargetMapper(field);
  loadConfig.sourceSetter = buildFieldLoadConfigSourceSetter(field);
  loadConfig.setterLines = undefined;
  return loadConfig;
}

function buildFieldCode(field) /* Object */ {
  const code = {};

  // bulid code - field presenter
  code.presenter = buildFieldPresenter(field);

  // build code - field association
  if (utils.isAssociationField(field)) {
    code.loadConfig = buildFieldLoadConfig(field);
  }
  return code;
}

function addCode(entity) /* void */ {
  entity.code = buildEntityCode(entity);
  entity.fields.forEach((f) => (f.code = buildFieldCode(f)));
}

function augmentEntities(entityMap, config) /* void */ {
  const entityNames = Object.keys(entityMap).sort();
  const entities = entityNames.map((n) => entityMap[n]);

  // build entities
  entities.forEach((e) => addMetadata(e, entityMap));

  // augment entities - add strings
  entities.forEach((e) => addStrings(e, config));

  // augment entities - add code
  entities.forEach((e) => addCode(e, config));
}

function augment(data) /* void */ {
  const { config, templates, entityMap } = data;

  augmentTemplates(templates);

  augmentEntities(entityMap, config);
}

module.exports = { augment };
