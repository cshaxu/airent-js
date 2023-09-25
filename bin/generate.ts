#!/usr/bin/env node

const ejs = require("ejs");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

type Import = { name?: string; package: string };

type Schema = {
  entity: string;
  model: { name: string; import?: Import };
  response?: { name: string; import?: Import };
  fields: {
    [key: string]: {
      id: number;
      name: string;
      type: string;
      imports?: Import[];
      strategy:
        | "primitive"
        | "association"
        | "computed_sync"
        | "computed_async";
    };
  };
};

const BASE_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/base-template.ts.ejs"
);

const ENTITY_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/entity-template.ts.ejs"
);

async function sequential<T>(functions: (() => Promise<T>)[]): Promise<T[]> {
  const results = new Array<T>();
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
  return { baseTemplate, entityTemplate };
}

async function loadConfig() {
  const projectRoot = process.cwd();
  const configFilePath = path.join(projectRoot, "airent.config.ts");
  const { config } = require(configFilePath);
  return config;
}

async function createGeneratedDirectory(outputPath: string) {
  const outputGeneratedPath: string = path.join(outputPath, "generated");
  return await fs.promises.mkdir(outputGeneratedPath, { recursive: true });
}

async function getSchemaFilePaths(schemaPath: string) {
  // Read all files in the YAML directory
  const allFileNames = await fs.promises.readdir(schemaPath);

  // Filter only YAML files (with .yml or .yaml extension)
  return allFileNames
    .filter((fileName: string) => {
      const extname = path.extname(fileName).toLowerCase();
      return extname === ".yml" || extname === ".yaml";
    })
    .map((fileName: string) => path.join(schemaPath, fileName));
}

async function getSchemaParams(schemaFilePath: string) {
  const schemaContent = await fs.promises.readFile(schemaFilePath, "utf8");
  const schema = yaml.load(schemaContent) as Schema;

  const entityName = schema.entity;
  const model = { name: schema.model.name, _import: schema.model.import };
  const response = schema.response
    ? { name: schema.response.name, _import: schema.response.import }
    : undefined;
  const fields = schema.fields;
  return { entityName, model, response, fields };
}

function toKababCase(s: string) {
  return s
    .replace(/_/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

async function generate(
  schemaFilePath: string,
  baseTemplate: string,
  entityTemplate: string,
  outputPath: string
) {
  console.log(`[AIRENT/INFO] Generating from ${schemaFilePath} ...`);
  const params = await getSchemaParams(schemaFilePath);

  const entityFileName = `${toKababCase(params.entityName)}.ts`;
  const baseClassOutputPath = path.join(outputPath, "generated");

  // Generate base class
  const baseClassContent = ejs.render(baseTemplate, params);
  const baseClassPath = path.join(baseClassOutputPath, entityFileName);
  await fs.promises.writeFile(baseClassPath, baseClassContent);
  console.log(`  - Generated base class '${baseClassPath}'`);

  // Generate entity class
  const entityClassContent = ejs.render(entityTemplate, params);
  const entityClassPath = path.join(outputPath, entityFileName);

  if (fs.existsSync(entityClassPath)) {
    console.log(`  - Skipped entity class '${entityClassPath}'`);
    return; // Skip if already exists
  }
  await fs.promises.writeFile(entityClassPath, entityClassContent);
  console.log(`  - Generated entity class '${entityClassPath}'`);
}

async function execute() {
  // Load templates
  const { baseTemplate, entityTemplate } = await loadTemplates();

  // Load configuration
  const { schemaPath, outputPath } = await loadConfig();

  // Ensure the output directory exists
  await createGeneratedDirectory(outputPath);
  const schemaFiles = await getSchemaFilePaths(schemaPath);

  // Loop through each YAML file and generate code
  const functions = schemaFiles.map(
    (schemaFilePath: string) => () =>
      generate(schemaFilePath, baseTemplate, entityTemplate, outputPath)
  );
  await sequential(functions);
}

execute().catch((error: any) => {
  console.error(error);
});
