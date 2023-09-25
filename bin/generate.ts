#!/usr/bin/env node

import * as ejs from "ejs";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

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

async function loadBaseTemplate() {
  const baseTemplatePath = path.join(
    __dirname,
    "../templates/base-template.ts.ejs"
  );
  return await fs.promises.readFile(baseTemplatePath, "utf8");
}

async function loadEntityTemplate() {
  const entityTemplatePath = path.join(
    __dirname,
    "../templates/entity-template.ts.ejs"
  );
  return await fs.promises.readFile(entityTemplatePath, "utf8");
}

async function loadConfig() {
  const projectRoot = process.cwd();
  const configFilePath = path.join(projectRoot, "airent.config.ts");
  return await import(configFilePath);
}

async function createGeneratedDirectory(outputPath: string) {
  return await fs.promises.mkdir(path.join(outputPath, "generated"), {
    recursive: true,
  });
}

async function getSchemaFilePaths(schemaPath: string) {
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
  const baseTemplate = await loadBaseTemplate();
  const entityTemplate = await loadEntityTemplate();

  // Load configuration
  const { schemaPath, outputPath } = await loadConfig();

  // Ensure the output directory exists
  await createGeneratedDirectory(outputPath);
  const schemaFiles = await getSchemaFilePaths(schemaPath);

  // Loop through each YAML file and generate code
  const promises = schemaFiles.map((schemaFilePath) =>
    generate(schemaFilePath, baseTemplate, entityTemplate, outputPath)
  );
  await Promise.all(promises);
}

await execute();
