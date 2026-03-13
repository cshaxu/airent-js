# Airent TODO

## P0 - Fix immediately

- [ ] Make npm scripts cross-platform (Windows + Linux/macOS).
  - Replace `rm -rf` usage in scripts.
  - Files: `package.json` (`build`, `test` scripts).

- [ ] Harden schema validation error handling for association types.
  - Guard against missing `typeEntity` before accessing `typeEntity.fields`.
  - Return a clear `[AIRENT/ERROR]` instead of uncaught `TypeError`.
  - File: `bin/index.js` (`validateEntityMap`).

## P1 - Product trust and developer experience

- [ ] Fix README correctness issues.
  - Update config filename to `airent.config.json` (not `airent.config.js`).
  - Update usage examples to pass `context` into `fromOne` / `fromArray`.
  - Fix invalid code snippets:
    - `console.log(userEntity.await getLastMessage());`
    - `where: { id: lt: 100 }`
  - File: `README.md`.

- [ ] Document runtime requirements explicitly.
  - Add minimum supported Node.js version in README and package metadata.
  - Reason: runtime uses `structuredClone` and `crypto.randomUUID`.
  - Files: `README.md`, `package.json`, optionally `engines` field.

## P1 - Code quality and maintainability

- [ ] Remove implicit global variable assignment in augmentor.
  - Change `packages = {};` to declared local (`const`/`let`).
  - File: `resources/augmentor.js`.

## P2 - Reliability and release hygiene

- [ ] Add regression tests for invalid schema diagnostics.
  - Cover association validation and unsupported type failures.
  - Ensure human-readable errors are thrown.

- [ ] Add generator snapshot tests.
  - Lock expected generated outputs from representative schemas.
  - Catch template or augmentor regressions early.

- [ ] Add CI matrix for platform and runtime compatibility.
  - Test on Windows + Linux.
  - Test on active Node LTS versions.

## P2 - Product improvements

- [ ] Add a "5-minute quickstart" section to README.
  - Include exact command sequence, sample schema, and expected generated files.
  - Include one end-to-end present call example.

- [ ] Publish official starter examples/templates.
  - Targets: Prisma + Express and Prisma + Next.js.
  - Goal: reduce setup time and improve first-use success rate.
