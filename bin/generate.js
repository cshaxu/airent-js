#!/usr/bin/env node

const ejs = require("ejs");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

// Custom defined types in comments
/** @typedef {Object} Import
 *  @property {?string} name
 *  @property {string} package
 */

/** @typedef {Object} Field
 *  @property {number} id
 *  @property {string} name
 *  @property {string} type
 *  @property {Import[]} [imports]
 *  @property {"primitive" | "association" | "computed_sync" | "computed_async"} strategy
 */

/** @typedef {Object} Model
 *  @property {string} name
 *  @property {Import} import
 */

/** @typedef {Object} Schema
 *  @property {string} entity
 *  @property {boolean} internal
 *  @property {Model} model
 *  @property {Field[]} [fields]
 */

const BASE_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/base-template.ts.ejs"
);

const ENTITY_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/entity-template.ts.ejs"
);

const RESPONSE_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/type-template.ts.ejs"
);

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
  const baseTemplate = await fs.promises.readFile(BASE_TEMPLATE_PATH, "utf8");
  const entityTemplate = await fs.promises.readFile(
    ENTITY_TEMPLATE_PATH,
    "utf8"
  );
  const responseTemplate = await fs.promises.readFile(
    RESPONSE_TEMPLATE_PATH,
    "utf8"
  );
  return { baseTemplate, entityTemplate, responseTemplate };
}

async function loadConfig() {
  const airentConfigFilePath = path.join(PROJECT_PATH, "airent.config.json");
  const airentConfigContent = await fs.promises.readFile(
    airentConfigFilePath,
    "utf8"
  );
  const { type, schemaPath, outputPath } = JSON.parse(airentConfigContent);
  return {
    isModule: type === "module",
    relativeSchemaPath: schemaPath,
    relativeOutputPath: outputPath,
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
  const internal = schema.internal;
  const model = { name: schema.model.name, _import: schema.model.import };
  const fields = schema.fields;
  return { entityName, internal, model, fields };
}

async function generate(
  schemaFilePath,
  baseTemplate,
  entityTemplate,
  responseTemplate,
  isModule,
  outputPath
) {
  console.log(`[AIRENT/INFO] Generating from ${schemaFilePath} ...`);
  const schemaParams = await getSchemaParams(schemaFilePath);
  const params = { ...schemaParams, isModule };

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
  const { isModule, relativeSchemaPath, relativeOutputPath } =
    await loadConfig();
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
        outputPath
      )
  );
  await sequential(functions);
}

execute().catch((error) => {
  console.error(error);
});
