const path = require("path");

export const config = {
  schemaPath: path.join(__dirname, "test-schemas"),
  outputPath: path.join(__dirname, "dist/test-entities"),
};
