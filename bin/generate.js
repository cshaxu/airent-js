#!/usr/bin/env node

const ejs = require("ejs");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

// Custom defined types in comments
/** @typedef {Object} Type
 *  @property {string} name
 *  @property {?string} import
 *  @property {?string} define
 *  @property {?boolean} entity
 *  @property {?boolean} deprecated
 */

/** @typedef {Object} Field
 *  @property {number} id
 *  @property {string} name
 *  @property {?string} [aliasOf]
 *  @property {string} type
 *  @property {?boolean} cast
 *  @property {?boolean} deprecated
 *  @property {"primitive" | "association" | "computed_sync" | "computed_async"} strategy
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

const TEMPLATE_PATH = path.join(__dirname, "../templates");
const TEMPLATE_UTILS_PATH = path.join(TEMPLATE_PATH, "utils.js");
const BASE_TEMPLATE_PATH = path.join(TEMPLATE_PATH, "base-template.ts.ejs");
const ENTITY_TEMPLATE_PATH = path.join(TEMPLATE_PATH, "entity-template.ts.ejs");
const RESPONSE_TEMPLATE_PATH = path.join(TEMPLATE_PATH, "type-template.ts.ejs");

const PROJECT_PATH = process.cwd();

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

async function loadTemplates() {
  const templateUtils =
    "<% " + (await fs.promises.readFile(TEMPLATE_UTILS_PATH, "utf8")) + "-%>\n";
  const baseTemplate =
    templateUtils + (await fs.promises.readFile(BASE_TEMPLATE_PATH, "utf8"));
  const entityTemplate =
    templateUtils + (await fs.promises.readFile(ENTITY_TEMPLATE_PATH, "utf8"));
  const responseTemplate =
    templateUtils +
    (await fs.promises.readFile(RESPONSE_TEMPLATE_PATH, "utf8"));
  return { baseTemplate, entityTemplate, responseTemplate };
}

async function loadConfig() {
  const airentConfigFilePath = path.join(PROJECT_PATH, "airent.config.json");
  const airentConfigContent = await fs.promises.readFile(
    airentConfigFilePath,
    "utf8"
  );
  const { type, schemaPath, outputPath, airentPackage } =
    JSON.parse(airentConfigContent);
  return {
    isModule: type === "module",
    relativeSchemaPath: schemaPath,
    relativeOutputPath: outputPath,
    airentPackage: airentPackage ?? "airent",
  };
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

  const entityName = toTitleCase(schema.entity);
  const modelName = toTitleCase(schema.model);
  const deprecated = schema.deprecated;
  const internal = schema.internal;
  const types = schema.types;
  const fields = schema.fields;
  return { entityName, modelName, deprecated, internal, types, fields };
}

async function generate(
  schemaFilePath,
  baseTemplate,
  entityTemplate,
  responseTemplate,
  isModule,
  airentPackage,
  outputPath
) {
  console.log(`[AIRENT/INFO] Generating from ${schemaFilePath} ...`);
  const schemaParams = await getSchemaParams(schemaFilePath);
  const params = { ...schemaParams, isModule, airentPackage };

  const generatedOutputPath = path.join(outputPath, "generated");

  // Generate base class
  const baseFileName = `${toKababCase(params.entityName)}-base.ts`;
  const baseFilePath = path.join(generatedOutputPath, baseFileName);

  const baseContent = ejs.render(baseTemplate, params);
  await fs.promises.writeFile(baseFilePath, baseContent);
  console.log(`  - Generated base class '${baseFilePath}'`);

  // Generate entity class
  const entityFileName = `${toKababCase(params.entityName)}.ts`;
  const entityFilePath = path.join(outputPath, entityFileName);

  if (fs.existsSync(entityFilePath)) {
    console.log(`  - Skipped entity class '${entityFilePath}'`);
  } else {
    const entityContent = ejs.render(entityTemplate, params);
    await fs.promises.writeFile(entityFilePath, entityContent);
    console.log(`  - Generated entity class '${entityFilePath}'`);
  }

  // Generate entity class
  const responseFileName = `${toKababCase(params.entityName)}-type.ts`;
  const responseFilePath = path.join(generatedOutputPath, responseFileName);

  if (params.internal) {
    console.log(`  - Skipped response class '${responseFilePath}'`);
  } else {
    const responseContent = ejs.render(responseTemplate, params);
    await fs.promises.writeFile(responseFilePath, responseContent);
    console.log(`  - Generated response class '${responseFilePath}'`);
  }
}

async function execute() {
  // Load templates
  const { baseTemplate, entityTemplate, responseTemplate } =
    await loadTemplates();

  // Load configuration
  const config = await loadConfig();
  console.log(config);
  const { isModule, relativeSchemaPath, relativeOutputPath, airentPackage } =
    config;
  const schemaPath = path.join(PROJECT_PATH, relativeSchemaPath);
  const outputPath = path.join(PROJECT_PATH, relativeOutputPath);

  // Ensure the output directory exists
  await createGeneratedDirectory(outputPath);
  const schemaFiles = await getSchemaFilePaths(schemaPath);

  // Loop through each YAML file and generate code
  const functions = schemaFiles.map(
    (schemaFilePath) => async () =>
      generate(
        schemaFilePath,
        baseTemplate,
        entityTemplate,
        responseTemplate,
        isModule,
        airentPackage,
        outputPath
      )
  );
  await sequential(functions);
}

execute().catch((error) => {
  console.error(error);
});
