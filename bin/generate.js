#!/usr/bin/env node

const ejs = require("ejs");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

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
  const airentConfigFilePath = path.join(PROJECT_PATH, "airent.config.json");
  const airentConfigContent = await fs.promises.readFile(
    airentConfigFilePath,
    "utf8"
  );
  const config = JSON.parse(airentConfigContent);
  const { type, schemaPath, outputPath, airentPackage, prologues, templates } =
    config;
  return {
    ...config,
    isModule: type === "module",
    schemaPath: path.join(PROJECT_PATH, schemaPath),
    outputPath: path.join(PROJECT_PATH, outputPath),
    airentPackage: airentPackage ?? "airent",
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

async function createGeneratedDirectory(outputPath) {
  const outputGeneratedPath = path.join(outputPath, "generated");
  return await fs.promises.mkdir(outputGeneratedPath, { recursive: true });
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

async function getSchemaParams(schemaFilePath) {
  const schemaContent = await fs.promises.readFile(schemaFilePath, "utf8");
  const schema = yaml.load(schemaContent);
  return {
    ...schema,
    entityName: toTitleCase(schema.entity),
    modelName: toTitleCase(schema.model),
    deprecated: schema.deprecated ?? false,
    internal: schema.internal ?? false,
    types: schema.types ?? [],
    fields: schema.fields ?? [],
  };
}

async function generate(schemaFilePath, templates, config) {
  console.log(`[AIRENT/INFO] Generating from ${schemaFilePath} ...`);
  const schema = await getSchemaParams(schemaFilePath);
  const params = { schema, config };

  const { entityName } = schema;
  const { outputPath } = config;

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
        : ejs.render(template.content, params);
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

async function execute() {
  // Load configuration
  const config = await loadConfig();
  console.log(config);
  const {
    schemaPath,
    outputPath,
    prologues: prologuesConfig,
    templates: templatesConfig,
  } = config;

  // Load templates
  const templates = await loadTemplates(prologuesConfig, templatesConfig);

  // Ensure the output directory exists
  await createGeneratedDirectory(outputPath);
  const schemaFiles = await getSchemaFilePaths(schemaPath);

  // Loop through each YAML file and generate code
  const functions = schemaFiles.map(
    (schemaFilePath) => async () => generate(schemaFilePath, templates, config)
  );
  await sequential(functions);
}

execute().catch((error) => {
  console.error(error);
});
