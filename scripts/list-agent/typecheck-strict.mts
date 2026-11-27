import ts from "typescript";

/**
 * Strict type check for the List agent and list-upload code
 * (tsconfig.strict.json: no unchecked index access, exact optional
 * properties). Files outside those folders are compiled too, because our code
 * imports them, but only errors in our folders fail the check.
 * Run: npm run typecheck:strict
 */

const CONFIG = "tsconfig.strict.json";

const host: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (f) => f,
  getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
  getNewLine: () => ts.sys.newLine,
};

const read = ts.readConfigFile(CONFIG, (path) => ts.sys.readFile(path));
if (read.error) {
  console.error(ts.formatDiagnostics([read.error], host));
  process.exit(1);
}
const config = ts.parseJsonConfigFileContent(read.config, ts.sys, process.cwd(), undefined, CONFIG);
const ours = new Set(config.fileNames.map((f) => ts.sys.resolvePath(f)));
const program = ts.createProgram(config.fileNames, config.options);

const errors = ts
  .getPreEmitDiagnostics(program)
  .filter((d) => d.file === undefined || ours.has(ts.sys.resolvePath(d.file.fileName)));

if (errors.length > 0) {
  console.error(ts.formatDiagnosticsWithColorAndContext(errors, host));
  process.exit(1);
}
console.log(`Strict type check passed (${ours.size} files).`);
