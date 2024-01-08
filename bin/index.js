#!/usr/bin/env node

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

async function sequential(functions) {
  const results = [];
  for (const func of functions) {
    const result = await func();
    results.push(result);
  }
  return results;
}

// Function to ask a question and store the answer in the config object
function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function configure() {
  const type = await askQuestion("Project type (commonjs/module): ");
  const schemaPath = await askQuestion("Schema path: (./schemas): ");
  const entityPath = await askQuestion("Entity path: (./src/entities): ");
  const config = {
    type: type.length > 0 ? type : "commonjs",
    schemaPath: schemaPath.length > 0 ? schemaPath : "schemas",
    entityPath: entityPath.length > 0 ? entityPath : "src/entities",
  };
  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(CONFIG_FILE_PATH, content);
  console.log(`[AIRENT/INFO] Configuration located at '${CONFIG_FILE_PATH}'`);
}

/** @typedef {Object} Type
 *  @property {string} name
 *  @property {?string} [aliasOf]
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
 *  @property {?string} [aliasOf]
 *  @property {?boolean} cast
 *  @property {?boolean} deprecated
 *  @property {?string[]} [sourceFields]
 *  @property {?string[]} [targetFields]
 */

/** @typedef {Object} Entity
 *  @property {string} name
 *  @property {string} model
 *  @property {boolean} internal
 *  @property {?boolean} deprecated
 *  @property {?boolean} [skipSelfLoader]
 *  @property {Type[]} [types]
 *  @property {Field[]} [fields]
 */

/** @typedef {Object} Template
 *  @property {string} name
 *  @property {string} outputPath
 *  @property {boolean} skippable
 */

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} airentPackage
 *  @property {string} schemaPath
 *  @property {string} entityPath
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

async function loadConfig(isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Loading config ${CONFIG_FILE_PATH} ...`);
  }
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const {
    type,
    airentPackage: airentPackageRaw,
    augmentors: extAugmentorNames,
    templates: extTemplateConfigs,
  } = config;

  // configure augmentors
  const augmentors = [...DEFALUT_AUGMENTOR_NAMES, ...(extAugmentorNames ?? [])];

  // configure templates
  const templates = [
    ...DEFAULT_TEMPLATE_CONFIGS,
    ...(extTemplateConfigs ?? []),
  ];

  const loadedConfig = {
    ...config,
    isModule: type === "module",
    airentPackage: airentPackageRaw ?? "airent",
    augmentors,
    templates,
  };
  if (isVerbose) {
    console.log(loadedConfig);
  }
  return loadedConfig;
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
  return templateConfigs.map((c, i) => ({
    ...c,
    content: tepmlateContents[i],
  }));
}

function isEntityTemplate(template) {
  return (
    !template.outputPath || template.outputPath.includes("{kababEntityName}")
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
    console.log(`[AIRENT/INFO] Loading schema ${absoluteSchemaFilePath} ...`);
  }
  const schemaContent = await fs.promises.readFile(
    absoluteSchemaFilePath,
    "utf8"
  );
  const entity = yaml.load(schemaContent);
  return {
    ...entity,
    internal: entity.internal ?? false,
    deprecated: entity.deprecated ?? false,
    skipSelfLoader: entity.skipSelfLoader ?? false,
    types: entity.types ?? [],
    fields: entity.fields ?? [],
  };
}

async function loadSchemas(schemaPath, isVerbose) {
  const absoluteSchemaFilePaths = await getAbsoluteSchemaFilePaths(schemaPath);
  const functions = absoluteSchemaFilePaths
    .sort()
    .map((p) => () => loadSchema(p, isVerbose));
  return await sequential(functions);
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
  const augmentedOutputPath = (entity?.outputs ?? {})[template.name];
  const configOutputPath = (template.outputPath ?? "")
    .replaceAll("{entityPath}", entityPath)
    .replaceAll("{kababEntityName}", kababEntityName);
  return path.join(PROJECT_PATH, augmentedOutputPath ?? configOutputPath);
}

async function generateEntity(name, entityMap, templates, config, isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Generating ${name} ...`);
  }
  const { airentPackage: airentPackageRaw } = config;
  const entity = entityMap[name];
  for (const template of templates) {
    if (isEntityTemplate(template)) {
      const absoluteFilePath = buildAbsoluteOutputPath(
        entity,
        template,
        config
      );
      const airentPackage =
        airentPackageRaw === "airent"
          ? "airent"
          : path
              .relative(
                path.dirname(absoluteFilePath),
                path.join(PROJECT_PATH, airentPackageRaw)
              )
              .replaceAll("\\", "/");
      const fileContent =
        template.skippable && fs.existsSync(absoluteFilePath)
          ? ""
          : ejs.render(template.content, {
              entity,
              template,
              config,
              utils,
              airentPackage,
            });
      if (fileContent.length > 0) {
        // create the output folders if not exist
        const folderPath = path.dirname(absoluteFilePath);
        await fs.promises.mkdir(folderPath, { recursive: true });
        await fs.promises.writeFile(absoluteFilePath, fileContent);
        if (isVerbose) {
          console.log(`[AIRENT/INFO] - Generated '${absoluteFilePath}'`);
        }
      } else if (isVerbose) {
        console.log(`[AIRENT/INFO] - Skipped '${absoluteFilePath}'`);
      }
    }
  }
}

async function generateNonEntity(entityMap, template, config, isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Generating ${template.name} ...`);
  }
  const { airentPackage: airentPackageRaw } = config;
  const absoluteFilePath = buildAbsoluteOutputPath(null, template, config);
  const airentPackage =
    airentPackageRaw === "airent"
      ? "airent"
      : path
          .relative(
            path.dirname(absoluteFilePath),
            path.join(PROJECT_PATH, airentPackageRaw)
          )
          .replaceAll("\\", "/");
  const fileContent =
    template.skippable && fs.existsSync(absoluteFilePath)
      ? ""
      : ejs.render(template.content, {
          entityMap,
          template,
          config,
          utils,
          airentPackage,
        });
  if (fileContent.length > 0) {
    // create the output folders if not exist
    const folderPath = path.dirname(absoluteFilePath);
    await fs.promises.mkdir(folderPath, { recursive: true });
    await fs.promises.writeFile(absoluteFilePath, fileContent);
    if (isVerbose) {
      console.log(`[AIRENT/INFO] - Generated '${absoluteFilePath}'`);
    }
  } else if (isVerbose) {
    console.log(`[AIRENT/INFO] - Skipped '${absoluteFilePath}'`);
  }
}

async function generate(isVerbose) {
  // load config
  const config = await loadConfig(isVerbose);

  // load templates
  const templates = await loadTemplates(config, isVerbose);

  // load schemas
  const schemas = await loadSchemas(config.schemaPath, isVerbose);
  const entityNames = schemas.map((entity) => entity.name);
  const entityMap = schemas.reduce((map, entity) => {
    map[entity.name] = entity;
    return map;
  }, {});

  // perform augmentation
  config.augmentors.map((augmentorName) =>
    augment(augmentorName, entityMap, templates, config, isVerbose)
  );

  // loop through each YAML file and generate code
  const entityFunctions = entityNames.map(
    (name) => () =>
      generateEntity(name, entityMap, templates, config, isVerbose)
  );
  await sequential(entityFunctions);

  // generate non entity files
  const nonEntityFunctions = templates
    .filter((template) => !isEntityTemplate(template))
    .map(
      (template) => () =>
        generateNonEntity(entityMap, template, config, isVerbose)
    );
  await sequential(nonEntityFunctions);
  console.log("[AIRENT/INFO] Task completed.");
}

async function main(args) {
  const isVerbose = args.includes("--verbose") || args.includes("-v");
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    await generate(isVerbose);
  } else {
    await configure();
  }
}

main(process.argv.slice(2))
  .catch((error) => console.error(error))
  .finally(() => rl.close());
