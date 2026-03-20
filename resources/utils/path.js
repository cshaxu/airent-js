const path = require("path");

const codeUtils = require("./code");

function buildRelativePath(sourcePath, targetPath) /* string */ {
  const rawRelativePath = path
    .relative(sourcePath, targetPath)
    .replaceAll("\\", "/");
  return rawRelativePath.startsWith(".")
    ? rawRelativePath
    : `./${rawRelativePath}`;
}

function buildRelativeFull(sourcePath, targetPath, config) /* string */ {
  if (!targetPath.startsWith(".")) {
    return targetPath;
  }
  const suffix = codeUtils.getModuleSuffix(config);
  const relativePath = buildRelativePath(sourcePath, targetPath);
  return `${relativePath}${suffix}`;
}

module.exports = { buildRelativeFull, buildRelativePath };
