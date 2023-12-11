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
 *  @property {string | null} suffix
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
const AIRENT_PATH = path.join(__dirname, "..");

const CONFIG_FILE_PATH = path.join(PROJECT_PATH, "airent.config.json");
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

async function loadConfig(isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Loading config ${CONFIG_FILE_PATH} ...`);
  }
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const {
    type,
    schemaPath,
    entityPath,
    airentPackage: airentPackageRaw,
    augmentors: extAugmentorNamesRaw,
    templates: extTemplateConfigsRaw,
  } = config;
  const airentPackageForSkippable = airentPackageRaw ?? "airent";
  const airentPackageForGenerated =
    airentPackageForSkippable === "airent"
      ? "airent"
      : path.join("..", airentPackageForSkippable).replace(/\\/g, "/");

  // configure augmentors
  const externalAugmentorNames = (extAugmentorNamesRaw ?? []).map((n) =>
    path.join(PROJECT_PATH, n)
  );
  const augmentors = [...DEFALUT_AUGMENTOR_NAMES, ...externalAugmentorNames];

  // configure templates
  const generatedOutputPath = path.join(entityPath, "generated");
  const baseTemplateConfig = {
    _type: "base",
    name: BASE_TEMPLATE_NAME,
    suffix: "base",
    skippable: false,
    outputPath: generatedOutputPath,
  };
  const typeTemplateConfig = {
    _type: "type",
    name: TYPE_TEMPLATE_NAME,
    suffix: "type",
    skippable: false,
    outputPath: generatedOutputPath,
  };
  const entityTemplateConfig = {
    _type: "entity",
    name: ENTITY_TEMPLATE_NAME,
    suffix: null,
    skippable: true,
    outputPath: entityPath,
  };
  const defualtTemplateConfigs = [
    baseTemplateConfig,
    typeTemplateConfig,
    entityTemplateConfig,
  ];
  const extTemplateConfigs = (extTemplateConfigsRaw ?? []).map((c) => ({
    ...c,
    name: path.join(PROJECT_PATH, c.name),
    outputPath:
      c.outputPath ?? (c.skippable ? entityPath : generatedOutputPath),
  }));
  const templates = [...defualtTemplateConfigs, ...extTemplateConfigs];

  const loadedConfig = {
    ...config,
    isModule: type === "module",
    schemaPath: path.join(PROJECT_PATH, schemaPath),
    entityPath: path.join(PROJECT_PATH, entityPath),
    airentPackageForSkippable,
    airentPackageForGenerated,
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
    if (isVerbose) {
      console.log(`[AIRENT/INFO] Loading template ${c.name} ...`);
    }
    return fs.promises.readFile(c.name, "utf8");
  });
  const tepmlateContents = await sequential(functions);
  return templateConfigs.map((c, i) => ({
    ...c,
    content: tepmlateContents[i],
  }));
}

async function getSchemaFilePaths(schemaPath) {
  // Read all files in the YAML directory
  const allFileNames = await fs.promises.readdir(schemaPath);

  // Filter only YAML files (with .yml or .yaml extension)
  return allFileNames
    .filter((fileName) => {
      const extname = path.extname(fileName).toLowerCase();
      return extname === ".yml" || extname === ".yaml";
    })
    .map((fileName) => path.join(schemaPath, fileName));
}

async function loadSchema(schemaFilePath, isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Loading schema ${schemaFilePath} ...`);
  }
  const schemaContent = await fs.promises.readFile(schemaFilePath, "utf8");
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
  const schemaFilePaths = await getSchemaFilePaths(schemaPath);
  const functions = schemaFilePaths
    .sort()
    .map((path) => () => loadSchema(path, isVerbose));
  return await sequential(functions);
}

function augment(augmentorName, entityMap, templates, config, isVerbose) {
  if (isVerbose) {
    console.log(`[AIRENT/INFO] Augmenting with ${augmentorName} ...`);
  }
  const augmentor = require(augmentorName);
  return augmentor.augment({ entityMap, templates, config });
}

async function generateOne(name, entityMap, templates, config, isVerbose) {
  const entity = entityMap[name];

  if (isVerbose) {
    console.log(`[AIRENT/INFO] Generating ${name} ...`);
  }

  const fileNamePrefix = utils.toKababCase(name);
  for (const template of templates) {
    const fileName =
      [fileNamePrefix, template.suffix].filter((s) => s?.length).join("-") +
      ".ts";
    const filePath = path.join(template.outputPath, fileName);
    const fileContent =
      template.skippable && fs.existsSync(filePath)
        ? ""
        : ejs.render(template.content, {
            entity,
            template,
            config,
            utils,
          });
    if (fileContent.length === 0) {
      if (isVerbose) {
        console.log(
          `[AIRENT/INFO] - Skipped ${
            template.suffix ?? "entity"
          } class '${filePath}'`
        );
      }
      continue;
    } else {
      await fs.promises.writeFile(filePath, fileContent);
      if (isVerbose) {
        console.log(
          `[AIRENT/INFO] - Generated ${
            template.suffix ?? "entity"
          } class '${filePath}'`
        );
      }
    }
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

  // create the output folders if not exist
  const folderNames = Array.from(
    new Set(templates.map((t) => t.outputPath))
  ).sort();
  const createFolderPromises = folderNames.map((path) =>
    fs.promises.mkdir(path, { recursive: true })
  );
  await Promise.all(createFolderPromises);

  // loop through each YAML file and generate code
  const functions = entityNames.map(
    (name) => () => generateOne(name, entityMap, templates, config, isVerbose)
  );
  await sequential(functions);
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
