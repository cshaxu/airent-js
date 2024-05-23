#!/usr/bin/env node

// IMPORTS //

const ejs = require("ejs");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const readline = require("readline");
const utils = require("../resources/utils.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// UTILITIES //

async function sequential(functions) {
  const results = [];
  for (const func of functions) {
    const result = await func();
    results.push(result);
  }
  return results;
}

async function askQuestion(question, defaultAnswer) {
  const a = await new Promise((resolve) =>
    rl.question(`${question} (${defaultAnswer}): `, resolve)
  );
  return a?.length ? a : defaultAnswer;
}

async function writeFileContent(absoluteFilePath, fileContent) {
  const folderPath = path.dirname(absoluteFilePath);
  await fs.promises.mkdir(folderPath, { recursive: true });
  await fs.promises.writeFile(absoluteFilePath, fileContent);
}

// TYPES AND CONSTANTS //

/** @typedef {Object} Type
 *  @property {string} name
 *  @property {?string} aliasOf
 *  @property {?string} enum
 *  @property {?string} define
 *  @property {?string} import
 *  @property {?boolean} deprecated
 */

/** @typedef {Object} Field
 *  @property {number} id
 *  @property {string} type
 *  @property {"primitive" | "association" | "computed" | "computedAsync"} strategy
 *  @property {string} name
 *  @property {?string} aliasOf
 *  @property {?boolean} cast
 *  @property {?boolean} deprecated
 *  @property {?string[]} [sourceKeys]
 *  @property {?string[]} [targetKeys]
 *  @property {?object[]} [targetFilters]
 *  @property {?boolean} skipGetter
 *  @property {?boolean} skipSetter
 */

/** @typedef {Object} Entity
 *  @property {string} name
 *  @property {string} model
 *  @property {?boolean} internal
 *  @property {?boolean} deprecated
 *  @property {?boolean} [skipSelfLoader]
 *  @property {Type[]} [types]
 *  @property {Field[]} [fields]
 */

/** @typedef {Object} Template
 *  @property {string} name
 *  @property {string} outputPath
 *  @property {?boolean} skippable
 */

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} libImportPath
 *  @property {string} schemaPath
 *  @property {string} entityPath
 *  @property {string} contextImportPath
 *  @property {?string[]} [augmentors]
 *  @property {?Template[]} [templates]
 */

const PROJECT_PATH = process.cwd();
const CONFIG_FILE_PATH = path.join(PROJECT_PATH, "airent.config.json");

const AIRENT_PATH = path.join(__dirname, "..");
const AIRENT_RESOURCES_PATH = path.join(AIRENT_PATH, "resources");
const DEFALUT_AUGMENTOR_NAMES = [
  path.join(AIRENT_RESOURCES_PATH, "augmentor.js"),
];
const BASE_TEMPLATE_NAME = path.join(
  AIRENT_RESOURCES_PATH,
  "base-template.ts.ejs"
);
const TYPE_TEMPLATE_NAME = path.join(
  AIRENT_RESOURCES_PATH,
  "type-template.ts.ejs"
);
const ENTITY_TEMPLATE_NAME = path.join(
  AIRENT_RESOURCES_PATH,
  "entity-template.ts.ejs"
);
const DEFAULT_TEMPLATE_NAMES = [
  BASE_TEMPLATE_NAME,
  TYPE_TEMPLATE_NAME,
  ENTITY_TEMPLATE_NAME,
];

const BASE_TEMPLATE_CONFIG = {
  name: BASE_TEMPLATE_NAME,
  skippable: false,
  outputPath: path.join(
    "{entityPath}",
    "generated",
    "{kababEntityName}-base.ts"
  ),
};
const TYPE_TEMPLATE_CONFIG = {
  name: TYPE_TEMPLATE_NAME,
  skippable: false,
  outputPath: path.join(
    "{entityPath}",
    "generated",
    "{kababEntityName}-type.ts"
  ),
};
const ENTITY_TEMPLATE_CONFIG = {
  name: ENTITY_TEMPLATE_NAME,
  skippable: true,
  outputPath: path.join("{entityPath}", "{kababEntityName}.ts"),
};
const DEFAULT_TEMPLATE_CONFIGS = [
  BASE_TEMPLATE_CONFIG,
  TYPE_TEMPLATE_CONFIG,
  ENTITY_TEMPLATE_CONFIG,
];

// CONFIGURE //

async function configure(config) {
  config.type = await askQuestion(
    "Project type [commonjs or module]",
    config.type ?? "commonjs"
  );
  config.schemaPath = await askQuestion(
    "Schema path",
    config.schemaPath ?? "./schemas"
  );
  config.entityPath = await askQuestion(
    "Entity path",
    config.entityPath ?? "./src/entities"
  );
  config.contextImportPath = await askQuestion(
    "Context import path",
    config.contextImportPath ?? "./src/context"
  );
  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(CONFIG_FILE_PATH, content);
  console.log(`[AIRENT/INFO] Configuration located at '${CONFIG_FILE_PATH}'`);
}

// GENERATE //

function validateConfig(config, isVerbose) {
  const {
    type,
    augmentors: extAugmentorNames,
    templates: extTemplateConfigs,
  } = config;

  // configure augmentors
  const augmentors = [
    ...DEFALUT_AUGMENTOR_NAMES,
    ...(extAugmentorNames ?? []),
  ].filter((s) => s?.length);

  // configure templates
  const templates = [
    ...DEFAULT_TEMPLATE_CONFIGS,
    ...(extTemplateConfigs ?? []),
  ];

  // validate config
  if (config.type !== "commonjs" && config.type !== "module") {
    throw new Error(
      `[AIRENT/ERROR] config.type '${config.type}' must be one of 'commonjs' or 'module'.`
    );
  }
  if (!config.schemaPath?.length) {
    throw new Error(`[AIRENT/ERROR] config.schemaPath is missing.`);
  }
  if (!config.entityPath?.length) {
    throw new Error(`[AIRENT/ERROR] config.entityPath is missing.`);
  }
  if (!config.contextImportPath?.length) {
    throw new Error(`[AIRENT/ERROR] config.contextImportPath is missing.`);
  }
  const templateNameCountMap = templates
    .filter((t) => t.name?.length)
    .reduce((map, t) => {
      map.set(t.name, (map.get(t.name) ?? 0) + 1);
      return map;
    }, new Map());
  templates.forEach((t) => {
    if (!t.name?.length) {
      throw new Error("[AIRENT/ERROR] template.name is missing.");
    }
    const count = templateNameCountMap.get(t.name) ?? 0;
    if (count !== 1) {
      throw new Error(
        `[AIRENT/ERROR] template.name '${t.name}' is duplicated ${count} times.`
      );
    }
  });
  const isModule = type === "module";
  const validated = { ...config, isModule, augmentors, templates };
  if (isVerbose) {
    console.log(validated);
  }

  return validated;
}

async function loadTemplates(config, isVerbose) {
  const { templates: templateConfigs } = config;
  const functions = templateConfigs.map((c) => () => {
    const templateFilePath = DEFAULT_TEMPLATE_NAMES.includes(c.name)
      ? c.name
      : path.join(PROJECT_PATH, c.name);
    if (isVerbose) {
      console.log(`[AIRENT/INFO] Loading template ${templateFilePath} ...`);
    }
    return fs.promises.readFile(templateFilePath, "utf8");
  });
  const tepmlateContents = await sequential(functions);
  const templates = templateConfigs.map((c, i) => ({
    ...c,
    content: tepmlateContents[i],
  }));
  return templates;
}

function isEntityTemplate(template) {
  return (
    template.outputPath.includes("{kababEntityName}") ||
    template.outputPath.includes("{kababEntitiesName}")
  );
}

async function getAbsoluteSchemaFilePaths(schemaPath) {
  const absoluteSchemaPath = path.join(PROJECT_PATH, schemaPath);
  // Read all files in the YAML directory
  const allFileNames = await fs.promises.readdir(absoluteSchemaPath);

  // Filter only YAML files (with .yml or .yaml extension)
  return allFileNames
    .filter((fileName) => {
      const extname = path.extname(fileName).toLowerCase();
      return extname === ".yml" || extname === ".yaml";
    })
    .map((fileName) => path.join(absoluteSchemaPath, fileName));
}

async function loadSchema(absoluteSchemaFilePath, isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Loading entity ${absoluteSchemaFilePath} ...`);
  }
  const schemaContent = await fs.promises.readFile(
    absoluteSchemaFilePath,
    "utf8"
  );
  const entityRaw = yaml.load(schemaContent);
  const types = entityRaw.types ?? [];
  const fields = entityRaw.fields ?? [];
  const entity = {
    ...entityRaw,
    internal: entityRaw.internal ?? false,
    deprecated: entityRaw.deprecated ?? false,
    skipSelfLoader: entityRaw.skipSelfLoader ?? false,
    types,
    fields,
  };

  validoateSchema(entity);

  return entity;
}

function validoateSchema(entity) {
  if (!entity.name?.length) {
    throw new Error("[AIRENT/ERROR] entity.name is missing.");
  }
  if (!entity.model?.length) {
    throw new Error(
      `[AIRENT/ERROR] entity.model on '${entity.name}' is missing.`
    );
  }

  const typeNameCountMap = entity.types
    .filter((t) => t.name?.length)
    .reduce((map, t) => {
      map.set(t.name, (map.get(t.name) ?? 0) + 1);
      return map;
    }, new Map());
  entity.types.forEach((t) => {
    if (!t.name?.length) {
      throw new Error(
        `[AIRENT/ERROR] type.name on '${entity.name}' is missing.`
      );
    }
    const count = typeNameCountMap.get(t.name) ?? 0;
    if (count !== 1) {
      throw new Error(
        `[AIRENT/ERROR] type.name '${entity.name}.${t.name}' is duplicated ${count} times.`
      );
    }
    const point = (t.enum ? 1 : 0) + (t.define ? 1 : 0) + (t.import ? 1 : 0);
    if (point !== 1) {
      throw new Error(
        `[AIRENT/ERROR] type '${entity.name}.${t.name}' must have exactly one of 'enum', 'define' or 'import'.`
      );
    }
  });

  const fieldNameCountMap = entity.fields
    .filter((f) => f.name?.length)
    .reduce((map, f) => {
      map.set(f.name, (map.get(f.name) ?? 0) + 1);
      return map;
    }, new Map());
  entity.fields.forEach((f) => {
    if (!f.name?.length) {
      throw new Error(
        `[AIRENT/ERROR] field.name on '${entity.name}.' is missing.`
      );
    }
    const count = fieldNameCountMap.get(f.name) ?? 0;
    if (count !== 1) {
      throw new Error(
        `[AIRENT/ERROR] field.name '${entity.name}.${f.name}' is duplicated ${count} times.`
      );
    }
    if (!f.type?.length) {
      throw new Error(
        `[AIRENT/ERROR] field.type on '${entity.name}.${f.name}' is missing.`
      );
    }
    if (
      !["primitive", "computed", "computedAsync", "association"].includes(
        f.strategy ?? ""
      )
    ) {
      throw new Error(
        `[AIRENT/ERROR] field.strategy '${f.strategy}' on '${entity.name}.${f.name}' is must be one of 'primitive', 'computed', 'computedAsync' or 'association'.`
      );
    }
    if (
      f.strategy === "association" &&
      (!f.sourceKeys?.length ||
        !f.targetKeys?.length ||
        f.sourceKeys.length !== f.targetKeys.length)
    ) {
      throw new Error(
        `[AIRENT/ERROR] field.sourceKeys and field.targetKeys on '${entity.name}.${f.name}' must be present and match for association fields.`
      );
    }
  });
}

async function loadEntityMap(schemaPath, isVerbose) {
  const absoluteSchemaFilePaths = await getAbsoluteSchemaFilePaths(schemaPath);
  const functions = absoluteSchemaFilePaths
    .sort()
    .map((p) => () => loadSchema(p, isVerbose));
  const schemas = await sequential(functions);
  const entityNameCountMap = schemas.reduce((map, e) => {
    map.set(e.name, (map.get(e.name) ?? 0) + 1);
    return map;
  }, new Map());
  schemas.forEach((e) => {
    const count = entityNameCountMap.get(e.name) ?? 0;
    if (count !== 1) {
      throw new Error(
        `[AIRENT/ERROR] entity.name '${e.name}' is duplicated ${count} times.`
      );
    }
  });
  const entityMap = schemas.reduce((map, entity) => {
    map[entity.name] = entity;
    return map;
  }, {});
  validateEntityMap(entityMap);
  return entityMap;
}

function validateEntityMap(entityMap) {
  Object.values(entityMap).forEach((entity) => {
    entity.fields.forEach((f) => {
      const primitiveType = utils.toPrimitiveTypeName(f.type);
      switch (primitiveType) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "Date":
          break;
        default:
          const type = entity.types.find((t) => t.name === primitiveType);
          const typeEntity = entityMap[primitiveType];
          if (!type && !typeEntity) {
            throw new Error(
              `[AIRENT/ERROR] field.type '${f.type}' on '${entity.name}.${f.name}' is not supported or pre-defined.`
            );
          }
          break;
      }
      if (f.strategy === "association") {
        const typeEntity = entityMap[primitiveType];
        f.sourceKeys.forEach((sk, index) => {
          const tk = f.targetKeys[index];
          const sf = entity.fields.find((f) => f.name === sk);
          const tf = typeEntity.fields.find((f) => f.name === tk);
          if (!sf) {
            throw new Error(
              `[AIRENT/ERROR] field.sourceKey '${sk}' on '${entity.name}.${f.name}' is not found.`
            );
          }
          if (!tf) {
            throw new Error(
              `[AIRENT/ERROR] field.targetKey '${tk}' on '${entity.name}.${f.name}' is not found.`
            );
          }
          const spf = utils.toPrimitiveTypeName(sf.type);
          const tpf = utils.toPrimitiveTypeName(tf.type);
          if (spf !== tpf) {
            throw new Error(
              `[AIRENT/ERROR] field.sourceKey '${sk}' and field.targetKey '${tk}' on '${entity.name}.${f.name}' must have the same type.`
            );
          }
        });
      }
    });
  });
}

function augment(augmentorName, entityMap, templates, config, isVerbose) {
  const isDefaultAugmentor = DEFALUT_AUGMENTOR_NAMES.includes(augmentorName);
  const absoluteAugmentorFilePath = isDefaultAugmentor
    ? augmentorName
    : path.join(PROJECT_PATH, augmentorName);
  if (isVerbose) {
    console.log(
      `[AIRENT/INFO] Augmenting with ${absoluteAugmentorFilePath} ...`
    );
  }
  const augmentor = require(absoluteAugmentorFilePath);
  return augmentor.augment({ entityMap, templates, config, utils }, isVerbose);
}

function buildAbsoluteOutputPath(entity, template, config) {
  const { entityPath } = config;
  const kababEntityName = utils.toKababCase(entity?.name ?? "");
  const kababEntitiesName = utils.pluralize(kababEntityName);
  const { outputPath: outputPathRaw } = template;
  let outputPath = "";
  let variableStart = -1;
  for (let i = 0; i < outputPathRaw.length; i++) {
    switch (outputPathRaw[i]) {
      case "{":
        if (variableStart > -1) {
          const previous = outputPathRaw.substring(variableStart, i);
          outputPath += previous;
        }
        variableStart = i;
        break;
      case "}":
        if (variableStart === -1) {
          outputPath += outputPathRaw[i];
        } else {
          const variableName = outputPathRaw.substring(variableStart + 1, i);
          switch (variableName) {
            case "entityPath":
              outputPath += entityPath;
              break;
            case "kababEntityName":
              outputPath += kababEntityName;
              break;
            case "kababEntitiesName":
              outputPath += kababEntitiesName;
              break;
            default:
              const variablePathParts = variableName.split(".");
              let variableValue = config;
              do {
                variableValue = variableValue[variablePathParts.shift()];
              } while (variablePathParts.length > 0 && variableValue);
              if (typeof variableValue === "string") {
                outputPath += variableValue;
              } else {
                outputPath += `{${variableName}}`;
              }
          }
          variableStart = -1;
        }
        break;
      default:
        if (variableStart === -1) {
          outputPath += outputPathRaw[i];
        } else if (i === outputPathRaw.length - 1) {
          const previous = outputPathRaw.substring(variableStart, i + 1);
          outputPath += previous;
        }
        break;
    }
  }
  return path.join(PROJECT_PATH, outputPath);
}

async function generateEntity(
  name,
  entityMap,
  entityTemplates,
  config,
  isVerbose
) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Generating ${name} ...`);
  }
  const entity = entityMap[name];
  for (const template of entityTemplates) {
    const absoluteFilePath = buildAbsoluteOutputPath(entity, template, config);
    const data = { entity, template, config, utils };
    try {
      const fileContent =
        template.skippable && fs.existsSync(absoluteFilePath)
          ? ""
          : ejs.render(template.content, data);
      if (fileContent.length > 0) {
        await writeFileContent(absoluteFilePath, fileContent);
        if (isVerbose) {
          console.log(`[AIRENT/INFO] - Generated '${absoluteFilePath}'`);
        }
      } else if (isVerbose) {
        console.log(`[AIRENT/INFO] - Skipped '${absoluteFilePath}'`);
      }
    } catch (error) {
      console.error(
        `[AIRENT/ERROR] - Failed '${absoluteFilePath}' on '${template.name}'`
      );
      throw error;
    }
  }
}

async function generateNonEntity(entityMap, template, config, isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Generating ${template.name} ...`);
  }
  const absoluteFilePath = buildAbsoluteOutputPath(null, template, config);
  const data = { entityMap, template, config, utils };
  try {
    const fileContent =
      template.skippable && fs.existsSync(absoluteFilePath)
        ? ""
        : ejs.render(template.content, data);
    if (fileContent.length > 0) {
      await writeFileContent(absoluteFilePath, fileContent);
      if (isVerbose) {
        console.log(`[AIRENT/INFO] - Generated '${absoluteFilePath}'`);
      }
    } else if (isVerbose) {
      console.log(`[AIRENT/INFO] - Skipped '${absoluteFilePath}'`);
    }
  } catch (error) {
    console.error(
      `[AIRENT/ERROR] - Failed '${absoluteFilePath}' on '${template.name}'`
    );
    throw error;
  }
}

async function generate(config, isVerbose) {
  config = validateConfig(config, isVerbose);

  // load templates
  const templates = await loadTemplates(config, isVerbose);

  // load schemas
  const entityMap = await loadEntityMap(config.schemaPath, isVerbose);

  // perform augmentation
  config.augmentors.map((augmentorName) =>
    augment(augmentorName, entityMap, templates, config, isVerbose)
  );

  // loop through each YAML file and generate code
  const entityTemplates = templates.filter(isEntityTemplate);
  const entityFunctions = Object.keys(entityMap).map(
    (name) => () =>
      generateEntity(name, entityMap, entityTemplates, config, isVerbose)
  );
  await sequential(entityFunctions);

  // generate non entity files
  const nonEntityTemplates = templates.filter(
    (template) => !isEntityTemplate(template)
  );
  const nonEntityFunctions = nonEntityTemplates.map(
    (template) => () =>
      generateNonEntity(entityMap, template, config, isVerbose)
  );
  await sequential(nonEntityFunctions);
  console.log("[AIRENT/INFO] Task completed.");
}

async function loadConfig(isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Loading config ${CONFIG_FILE_PATH} ...`);
  }
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  return JSON.parse(configContent);
}

async function main(args) {
  const isVerbose = args.includes("--verbose") || args.includes("-v");
  const isConfigured = fs.existsSync(CONFIG_FILE_PATH);
  const config = isConfigured ? await loadConfig(isVerbose) : {};

  if (args.includes("configure") || !isConfigured) {
    await configure(config);
  } else {
    await generate(config, isVerbose);
  }
}

main(process.argv.slice(2))
  .catch((error) => console.error(error))
  .finally(() => rl.close());
