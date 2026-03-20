const fs = require("fs");
const readline = require("readline");

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    async askQuestion(question, defaultAnswer) {
      const answer = await new Promise((resolve) =>
        rl.question(`${question} (${defaultAnswer}): `, resolve)
      );
      return answer?.length ? answer : defaultAnswer;
    },
    close() {
      rl.close();
    },
  };
}

async function getShouldEnable(askQuestion, name) {
  const shouldEnable = await askQuestion(`Enable "${name}"`, "yes");
  return shouldEnable === "yes";
}

async function loadJsonConfig(absoluteFilePath) {
  const configContent = await fs.promises.readFile(absoluteFilePath, "utf8");
  return JSON.parse(configContent);
}

function normalizeConfigCollections(config, keys = ["augmentors", "templates"]) {
  return keys.reduce((acc, key) => {
    acc[key] = acc[key] ?? [];
    return acc;
  }, { ...config });
}

async function writeJsonConfig(absoluteFilePath, config) {
  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(absoluteFilePath, content);
}

function addTemplate(config, draftTemplate) {
  const { templates } = config;
  const template = templates.find((one) => one.name === draftTemplate.name);
  if (template === undefined) {
    templates.push(draftTemplate);
  }
}

module.exports = {
  addTemplate,
  createPrompt,
  getShouldEnable,
  loadJsonConfig,
  normalizeConfigCollections,
  writeJsonConfig,
};
