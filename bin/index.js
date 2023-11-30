#!/usr/bin/env node

const ejs = require("ejs");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and store the answer in the config object
function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function configure() {
  const type = await askQuestion("Project type (commonjs/module): ");
  const schemaPath = await askQuestion("Schema path: (./schemas): ");
  const outputPath = await askQuestion("Output path: (./src/entities): ");
  const config = {
    type: type.length > 0 ? type : "commonjs",
    schemaPath: schemaPath.length > 0 ? schemaPath : "schemas",
    outputPath: outputPath.length > 0 ? outputPath : "src/entities",
  };
  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(CONFIG_FILE_PATH, content);
  console.log(`[AIRENT/INFO] Configuration located at '${CONFIG_FILE_PATH}'`);
}

/** @typedef {Object} Type
 *  @property {string} name
 *  @property {?string} import
 *  @property {?string} define
 *  @property {?boolean} entity
 *  @property {?boolean} deprecated
 */

/** @typedef {Object} Field
 *  @property {number} id
 *  @property {string} type
 *  @property {"primitive" | "association" | "computed_sync" | "computed_async"} strategy
 *  @property {string} name
 *  @property {?string} [aliasOf]
 *  @property {?boolean} cast
 *  @property {?boolean} deprecated
 *  @property {?string[]} [sourceFields]
 *  @property {?string[]} [targetFields]
 */

/** @typedef {Object} Schema
 *  @property {string} entity
 *  @property {string} model
 *  @property {boolean} internal
 *  @property {?boolean} deprecated
 *  @property {?boolean} [skipSelfLoader]
 *  @property {Type[]} [types]
 *  @property {Field[]} [fields]
 */

/** @typedef {Object} Template
 *  @property {string} name
 *  @property {string | null} suffix
 *  @property {boolean} skippable
 */

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} airentPackage
 *  @property {string} schemaPath
 *  @property {string} outputPath
 *  @property {?string[]} [prologues]
 *  @property {?Template[]} [templates]
 */

const PROJECT_PATH = process.cwd();
const AIRENT_PATH = path.join(__dirname, "..");

const CONFIG_FILE_PATH = path.join(PROJECT_PATH, "airent.config.json");

function toTitleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function toKababCase(s) {
  return s
    .replace(/_/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

async function sequential(functions) {
  const results = [];
  for (const func of functions) {
    const result = await func();
    results.push(result);
  }
  return results;
}

async function loadConfig() {
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const {
    type,
    schemaPath,
    outputPath,
    airentPackage: airentPackageRaw,
    prologues,
    templates,
  } = config;
  const airentPackageForSkippable = airentPackageRaw ?? "airent";
  const airentPackageForGenerated =
    airentPackageForSkippable === "airent"
      ? "airent"
      : path.join("..", airentPackageForSkippable).replace(/\\/g, "/");
  return {
    ...config,
    isModule: type === "module",
    schemaPath: path.join(PROJECT_PATH, schemaPath),
    outputPath: path.join(PROJECT_PATH, outputPath),
    airentPackageForSkippable,
    airentPackageForGenerated,
    prologues: prologues ?? [],
    templates: templates ?? [],
  };
}

async function loadTemplates(prologuesConfig, templatesConfig) {
  const extProloguePaths = prologuesConfig.map((p) =>
    path.join(PROJECT_PATH, p)
  );
  const prologuePaths = [
    path.join(AIRENT_PATH, "templates", "utils.js"),
    ...extProloguePaths,
  ];
  const prologuePromises = prologuePaths.map((p) =>
    fs.promises.readFile(p, "utf8")
  );
  const prologues = await Promise.all(prologuePromises);
  const prologue = "<% " + prologues.join("\n") + "-%>\n";

  const baseTemplateConfig = {
    name: path.join(AIRENT_PATH, "templates", "base-template.ts.ejs"),
    suffix: "base",
    skippable: false,
  };
  const typeTemplateConfig = {
    name: path.join(AIRENT_PATH, "templates", "type-template.ts.ejs"),
    suffix: "type",
    skippable: false,
  };
  const entityTemplateConfig = {
    name: path.join(AIRENT_PATH, "templates", "entity-template.ts.ejs"),
    suffix: null,
    skippable: true,
  };
  const extTemplateConfigs = templatesConfig.map((c) => ({
    ...c,
    name: path.join(PROJECT_PATH, c.name),
  }));
  const templateConfigs = [
    baseTemplateConfig,
    typeTemplateConfig,
    entityTemplateConfig,
    ...extTemplateConfigs,
  ];
  const templateContentPromises = templateConfigs
    .map((c) => c.name)
    .map((p) => fs.promises.readFile(p, "utf8"));
  const tepmlateContents = (await Promise.all(templateContentPromises)).map(
    (c) => prologue + c
  );
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

async function loadSchema(schemaFilePath) {
  console.log(`[AIRENT/INFO] Loading ${schemaFilePath} ...`);
  const schemaContent = await fs.promises.readFile(schemaFilePath, "utf8");
  const schema = yaml.load(schemaContent);
  return {
    ...schema,
    entity: undefined,
    model: undefined,
    entityName: toTitleCase(schema.entity),
    modelName: toTitleCase(schema.model),
    internal: schema.internal ?? false,
    deprecated: schema.deprecated ?? false,
    skipSelfLoader: schema.skipSelfLoader ?? false,
    types: schema.types ?? [],
    fields: schema.fields ?? [],
  };
}

async function loadSchemas(schemaFilePaths) {
  const functions = schemaFilePaths.map((path) => () => loadSchema(path));
  return await sequential(functions);
}

async function createGeneratedDirectory(outputPath) {
  const outputGeneratedPath = path.join(outputPath, "generated");
  return await fs.promises.mkdir(outputGeneratedPath, { recursive: true });
}

async function generateOne(entityName, schemaMap, templates, config) {
  const schema = schemaMap[entityName];
  const { outputPath } = config;

  console.log(`[AIRENT/INFO] Generating ${entityName} ...`);

  const generatedOutputPath = path.join(outputPath, "generated");
  const fileNamePrefix = toKababCase(entityName);
  for (const template of templates) {
    const fileName =
      [fileNamePrefix, template.suffix].filter((s) => s?.length).join("-") +
      ".ts";
    const dirName = template.skippable ? outputPath : generatedOutputPath;
    const filePath = path.join(dirName, fileName);
    const fileContent =
      template.skippable && fs.existsSync(filePath)
        ? ""
        : ejs.render(template.content, { schema, schemaMap, config });
    if (fileContent.length === 0) {
      console.log(
        `  - Skipped ${template.suffix ?? "entity"} class '${filePath}'`
      );
      continue;
    } else {
      await fs.promises.writeFile(filePath, fileContent);
      console.log(
        `  - Generated ${template.suffix ?? "entity"} class '${filePath}'`
      );
    }
  }
}

async function generate() {
  // load config
  const config = await loadConfig();
  console.log(config);
  const {
    schemaPath,
    outputPath,
    prologues: prologuesConfig,
    templates: templatesConfig,
  } = config;

  // load templates
  const templates = await loadTemplates(prologuesConfig, templatesConfig);

  // load schemas
  const schemaFilePaths = await getSchemaFilePaths(schemaPath);
  const schemas = await loadSchemas(schemaFilePaths);
  const entityNames = schemas.map((schema) => schema.entityName);
  const schemaMap = schemas.reduce((map, schema) => {
    map[schema.entityName] = schema;
    return map;
  }, {});

  // Ensure the output directory exists
  await createGeneratedDirectory(outputPath);

  // Loop through each YAML file and generate code
  const functions = entityNames.map(
    (entityName) => () => generateOne(entityName, schemaMap, templates, config)
  );
  await sequential(functions);
}

async function main() {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    await generate();
  } else {
    await configure();
  }
}

main()
  .catch((error) => console.error(error))
  .finally(() => rl.close());
