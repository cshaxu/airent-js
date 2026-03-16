const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

async function main() {
  const projectPath = path.join(__dirname, "..");
  const repoPath = path.join(projectPath, "..");

  await fs.promises.rm(path.join(projectPath, ".airent"), {
    recursive: true,
    force: true,
  });
  await fs.promises.rm(path.join(projectPath, "node_modules", "@airent"), {
    recursive: true,
    force: true,
  });
  await fs.promises.rm(path.join(projectPath, "src", "entities"), {
    recursive: true,
    force: true,
  });
  await fs.promises.rm(path.join(projectPath, "README"), {
    recursive: true,
    force: true,
  });

  const result = childProcess.spawnSync(
    process.execPath,
    [path.join(repoPath, "bin", "index.js")],
    {
      cwd: projectPath,
      stdio: "inherit",
    }
  );
  if (result.status !== 0) {
    throw new Error(
      `[AIRENT/ERROR] Test project generation failed with code ${result.status}.`
    );
  }

  const expectedFilePaths = [
    path.join(projectPath, "package.json"),
    path.join(projectPath, "tsconfig.json"),
    path.join(projectPath, "airent.config.json"),
    path.join(projectPath, ".airent", "index.ts"),
    path.join(projectPath, ".airent", "entities", "index.ts"),
    path.join(projectPath, ".airent", "types", "index.ts"),
    path.join(projectPath, ".airent", "entities", "user.ts"),
    path.join(projectPath, ".airent", "types", "user.ts"),
    path.join(projectPath, "node_modules", "@airent", "generated", "package.json"),
    path.join(projectPath, "node_modules", "@airent", "generated", "index.js"),
    path.join(projectPath, "node_modules", "@airent", "generated", "entities.js"),
    path.join(projectPath, "node_modules", "@airent", "generated", "types.js"),
    path.join(projectPath, "src", "entities", "user.ts"),
    path.join(projectPath, "README"),
  ];
  for (const filePath of expectedFilePaths) {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `[AIRENT/ERROR] Expected generated file not found: ${filePath}`
      );
    }
  }
  if (fs.existsSync(path.join(projectPath, "generated"))) {
    throw new Error(
      "[AIRENT/ERROR] Legacy generated output directory generated should not be produced."
    );
  }

  const userEntityContent = await fs.promises.readFile(
    path.join(projectPath, "src", "entities", "user.ts"),
    "utf8"
  );
  if (!userEntityContent.includes("@airent/generated/entities")) {
    throw new Error(
      "[AIRENT/ERROR] Derived entity did not import base entity from @airent/generated/entities."
    );
  }
  if (!userEntityContent.includes("@airent/generated/types")) {
    throw new Error(
      "[AIRENT/ERROR] Derived entity did not import types from @airent/generated/types."
    );
  }

  const generatedPackageContent = await fs.promises.readFile(
    path.join(projectPath, "node_modules", "@airent", "generated", "package.json"),
    "utf8"
  );
  if (!generatedPackageContent.includes('"./entities"')) {
    throw new Error(
      "[AIRENT/ERROR] Local generated package did not export the entities subpath."
    );
  }
  if (!generatedPackageContent.includes('"./types"')) {
    throw new Error(
      "[AIRENT/ERROR] Local generated package did not export the types subpath."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
