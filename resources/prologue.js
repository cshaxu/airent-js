/***********/
/* BOOLEAN */
/***********/

function isGetterGeneratable(field) /* boolean */ {
  const sourceKeySize = utils.getSourceKeySize(field);
  const targetKeySize = utils.getTargetKeySize(field);
  return sourceKeySize > 0 && sourceKeySize === targetKeySize;
}

function isLoaderGeneratable(_field) /* boolean */ {
  return false;
}

function isSetterGeneratable(field) /* boolean */ {
  const sourceKeySize = utils.getSourceKeySize(field);
  const targetKeySize = utils.getTargetKeySize(field);
  return sourceKeySize > 0 && sourceKeySize === targetKeySize;
}

function isAssociationFieldGeneratable(field) /* boolean */ {
  return (
    utils.isAssociationField(field) &&
    isGetterGeneratable(field) &&
    isLoaderGeneratable(field) &&
    isSetterGeneratable(field)
  );
}

/********/
/* CODE */
/********/

/* piece */

function getFieldGetterName(field) /* Code */ {
  if (utils.isPrimitiveField(field)) {
    return `${field.name}`;
  }
  return `get${utils.toTitleCase(field.name)}()`;
}

function getFieldLoadConfigName(field) /* Code */ {
  const className = schema.strings.entityClass;
  const fieldName = field.name;
  return `${className}.${fieldName}`;
}

function buildAssociationKey(keyFields, keyType) /* Code */ {
  if (keyFields.length === 0) {
    return `'TODO: map your ${keyType} entity to key'`;
  }
  const getters = keyFields
    .map(getFieldGetterName)
    .map((getterName) => `one.${getterName}`);
  return "`" + getters.map((getter) => `\${${getter}}`).join("*") + "`";
}

/* line */

function getFieldPresenter(field) /* Code */ {
  const presentCondition = `fieldRequest?.${field.name}`;
  const getterName = `this.${getFieldGetterName(field)}`;
  const getter = utils.isSyncField(field) ? getterName : `await ${getterName}`;
  let presenter = getter;
  if (utils.isEntityTypeField(field)) {
    if (utils.isArrayField(field)) {
      presenter += `.then((a) => Promise.all(a.map((one) => one.present(${presentCondition}))))`;
    } else if (utils.isNullableField(field)) {
      presenter += `.then((one) => one === null ? Promise.resolve(null) : one.present(${presentCondition}))`;
    } else {
      presenter += `.then((one) => one.present(${presentCondition}))`;
    }
  }
  return `${presentCondition} ? ${presenter} : undefined`;
}

function getSelfModelsLoader() /* Code */ {
  return "[/* TODO: load entity models */]";
}

function getTargetModelsLoader(_field) /* Code */ {
  return "[/* TODO: load associated models */]";
}

function getLoadConfigTargetMapper(field) /* Code */ {
  const mapBuilder = utils.isArrayField(field) ? "toArrayMap" : "toObjectMap";
  const targetFields = utils.getTargetFields(field);
  const targetKey = buildAssociationKey(targetFields, "target");
  return `${mapBuilder}(targets, (one) => ${targetKey}, (one) => one)`;
}

function getLoadConfigSourceSetter(field) /* Code */ {
  const sourceFields = utils.getSourceFields(field);
  const sourceKey = buildAssociationKey(sourceFields, "source");
  const fallback = utils.isArrayField(field)
    ? " ?? []"
    : utils.isNullableField(field)
    ? " ?? null"
    : "!";
  return `map.get(${sourceKey})${fallback}`;
}

/* block */

function getGlobalImports() /* Code[] */ {
  return [];
}

function getBaseExtraImports() /* Code[] */ {
  return [];
}

function getEntityExtraImports() /* Code[] */ {
  return [];
}

function getTypeExtraImports() /* Code[] */ {
  return [];
}

function getBaseExtraLines() /* Code[] */ {
  return [];
}

function getEntityExtraLines() /* Code[] */ {
  return [];
}

function getTypeExtraLines() /* Code[] */ {
  return [];
}

function getSelfLoaderLines() /* Code[] */ {
  return [
    `const models = ${getSelfModelsLoader()};`,
    "return (this as any).fromArray(models);",
  ];
}

function getLoadConfigGetterLines(field) /* Code[] */ {
  const sourceFields = utils.getSourceFields(field);
  const targetFields = utils.getTargetFields(field);
  // reject nullable sourceField whose targetField is required
  const filters = sourceFields
    .filter(
      (sf, i) =>
        utils.isNullableField(sf) && !utils.isNullableField(targetFields[i])
    )
    .map((sf) => `  .filter((one) => one.${getFieldGetterName(sf)} !== null)`);
  const mappedFields = sourceFields.map((sf, i) => {
    const rawTargetFieldName = targetFields[i].aliasOf ?? targetFields[i].name;
    return `    ${rawTargetFieldName}: one.${getFieldGetterName(sf)},`;
  });
  return [
    "return sources",
    ...filters,
    "  .map((one) => ({",
    ...mappedFields,
    "  }));",
  ];
}

function getLoadConfigLoaderLines(field) /* Code[] */ {
  const targetModelsLoader = getTargetModelsLoader(field);
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
  const mapper = getLoadConfigTargetMapper(field);
  const setter = getLoadConfigSourceSetter(field);
  return [
    `const map = ${mapper};`,
    `sources.forEach((one) => (one.${field.name} = ${setter}));`,
  ];
}
