import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { buffer } from "node:stream/consumers";
import { parseArgs } from "node:util";
import { ApiExecutor } from "../ai/api-executor";
import {
  GeminiProvider,
  listGeminiModels,
  THINKING_LEVELS,
  type ThinkingLevel,
} from "../ai/gemini-provider";
import {
  extractDocument,
  transcriptText,
  type DocumentRun,
} from "../pipeline/extract-document";
import {
  extractWorkbook,
  type ExtractionRun,
} from "../pipeline/extract-workbook";
import { DOCUMENT_EXTENSIONS } from "../parsers/document";
import { readSpreadsheet, type WorkbookData } from "../parsers/spreadsheet";
import { readTextFile } from "../parsers/text";
import { formatSummary, summarise, suppliersToCsv } from "./report";

/**
 * Try the List agent on one list, from the terminal:
 *
 *   npm run list:extract -- path/to/list.xlsx [--model <id>] [--rpm 5] [--out out]
 *   npm run list:extract -- path/to/pasted-email.txt
 *   npm run list:extract -- path/to/scan.pdf   (or a photo: .jpg, .png, .webp, .heic)
 *   npm run list:extract -- -          (paste text, then Ctrl+D)
 *   npm run list:extract -- --list-models
 *
 * Writes `suppliers.csv` (open in Excel) and `run.json` (everything: raw
 * values, every AI answer, tokens) into a new folder under `--out`; for a PDF
 * or photo also `transcript.txt`, the text the AI read from each page.
 * The API key is read from GEMINI_API_KEY: put it in `.env.local` (or `.env`)
 * in the project folder (both gitignored) or set it in the terminal.
 */

const USAGE = `Usage: npm run list:extract -- <file> [options]

<file> is a spreadsheet (xlsx, xls, ods, csv, tsv), a PDF, a photo (jpg, png,
webp, heic), a .txt file with text pasted from an email, chat or document, or
- to paste text here (end with Ctrl+D on a new line).

Options:
  --model <id>    Gemini model id (default: GEMINI_MODEL from .env.local)
  --vision-model <id>
                  Model that reads PDF pages and photos (default:
                  GEMINI_VISION_MODEL from .env.local, else the model above)
  --thinking <level>
                  How much the list model thinks: minimal, low, medium or
                  high (default: GEMINI_THINKING from .env.local, else the model's
                  own default)
  --vision-thinking <level>
                  The same for the page/photo reader (default:
                  GEMINI_VISION_THINKING from .env.local, else the model's default)
  --rpm <n>       Most requests per minute (default 5, the free-tier limit)
  --out <dir>     Folder for results (default: .list-agent/out)
  --list-models   Show the model ids this key can use, then stop
  --help          Show this help

Needs GEMINI_API_KEY, in .env.local, .env or the environment.`;

/**
 * Load `.env.local`, then `.env`, if they exist. A value already set (in the
 * terminal, or by the first file) wins.
 */
function loadEnvFiles(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

type Input =
  | { kind: "workbook"; workbook: WorkbookData; fileName: string }
  | { kind: "document"; data: Uint8Array; fileName: string };

/** PDFs and photos are read by the AI; text files and pasted text by the text reader; anything else is a spreadsheet. */
async function readInput(file: string): Promise<Input> {
  if (file === "-") {
    if (process.stdin.isTTY) {
      console.log("Paste the text, then press Ctrl+D on a new line:");
    }
    return {
      kind: "workbook",
      workbook: readTextFile(await buffer(process.stdin)),
      fileName: "pasted-text",
    };
  }
  const data = await readFile(file);
  if (DOCUMENT_EXTENSIONS.test(file)) {
    return { kind: "document", data, fileName: basename(file) };
  }
  return {
    kind: "workbook",
    workbook: /\.(txt|text)$/i.test(file)
      ? readTextFile(data)
      : readSpreadsheet(data),
    fileName: basename(file),
  };
}

async function main(): Promise<number> {
  loadEnvFiles();
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      model: { type: "string" },
      "vision-model": { type: "string" },
      thinking: { type: "string" },
      "vision-thinking": { type: "string" },
      rpm: { type: "string", default: "5" },
      out: { type: "string", default: ".list-agent/out" },
      "list-models": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  const file = positionals[0];
  const listing = values["list-models"];
  if (
    values.help ||
    (!listing && (file === undefined || positionals.length > 1))
  ) {
    console.log(USAGE);
    return values.help ? 0 : 1;
  }
  const apiKey = process.env.GEMINI_API_KEY ?? "";
  if (apiKey.trim() === "") {
    console.error("GEMINI_API_KEY is not set. See --help.");
    return 1;
  }
  if (listing) {
    console.log((await listGeminiModels(apiKey)).join("\n"));
    return 0;
  }
  if (file === undefined) return 1;
  const rpm = Number(values.rpm);
  if (!Number.isFinite(rpm) || rpm <= 0) {
    console.error("--rpm must be a positive number");
    return 1;
  }
  const model = values.model ?? process.env.GEMINI_MODEL?.trim() ?? "";
  if (model === "") {
    console.error(
      "No model chosen. Set GEMINI_MODEL in .env or pass --model <id>. " +
        "See the ids your key can use: npm run list:extract -- --list-models",
    );
    return 1;
  }

  const thinking = thinkingLevel(
    values.thinking ?? process.env.GEMINI_THINKING,
  );
  const visionThinking = thinkingLevel(
    values["vision-thinking"] ?? process.env.GEMINI_VISION_THINKING,
  );
  if (thinking === null || visionThinking === null) {
    console.error(
      `Thinking level must be one of: ${THINKING_LEVELS.join(", ")}`,
    );
    return 1;
  }

  const input = await readInput(file);
  const { fileName } = input;
  const gemini = (id: string, level: ThinkingLevel | undefined) =>
    new GeminiProvider({
      apiKey,
      model: id,
      minIntervalMs: Math.ceil(60_000 / rpm),
      ...(level === undefined ? {} : { thinkingLevel: level }),
    });
  const visionModel =
    values["vision-model"] ??
    (process.env.GEMINI_VISION_MODEL?.trim() || undefined) ??
    model;
  const separateReader =
    input.kind === "document" &&
    (visionModel !== model || visionThinking !== thinking);
  const describe = (id: string, level: ThinkingLevel | undefined) =>
    `${id}${level === undefined ? "" : `, thinking ${level}`}`;
  console.log(
    `Reading ${fileName} with ${describe(model, thinking)}${separateReader ? ` (pages read by ${describe(visionModel, visionThinking)})` : ""} (max ${String(rpm)}/min)…`,
  );

  const started = Date.now();
  const executor = new ApiExecutor(gemini(model, thinking));
  const context = {
    client_id: randomUUID(),
    programme_id: randomUUID(),
    upload_id: randomUUID(),
    file_id: randomUUID(),
    file_name: fileName,
  };
  let run: ExtractionRun;
  let document: DocumentRun | undefined;
  if (input.kind === "document") {
    document = await extractDocument(input.data, executor, context, {
      ...(separateReader
        ? {
            transcriber: new ApiExecutor(gemini(visionModel, visionThinking)),
          }
        : {}),
    });
    run = document;
  } else {
    run = await extractWorkbook(input.workbook, executor, context);
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  const stamp = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
  const dir = join(values.out, `${fileName}-${stamp}`);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "suppliers.csv"), suppliersToCsv(run.suppliers));
  await writeFile(join(dir, "run.json"), JSON.stringify(run, null, 2));
  const files = ["suppliers.csv", "run.json"];
  if (document) {
    await writeFile(
      join(dir, "transcript.txt"),
      transcriptText(document.pages),
    );
    files.push("transcript.txt");
  }

  console.log(`\n${formatSummary(summarise(run))}\nTime: ${seconds}s`);
  if (document?.pageCount !== undefined) {
    console.log(
      `Pages read by AI: ${String(document.pages.length)} of ${String(document.pageCount)} (every supplier is flagged read_from_image: compare with the page)`,
    );
  }
  for (const f of run.failed) {
    const where =
      f.rows.length === 0
        ? f.sheet
        : `sheet "${f.sheet}" rows ${String(f.rows[0])}–${String(f.rows.at(-1))}`;
    console.log(`  Failed: ${where}: ${f.message}`);
  }
  console.log(`\nResults in ${dir}/ (${files.join(", ")})`);
  return 0;
}

/** A thinking level from a flag or .env; undefined if unset, null if invalid. */
function thinkingLevel(
  value: string | undefined,
): ThinkingLevel | undefined | null {
  const level = value?.trim();
  if (level === undefined || level === "") return undefined;
  return (THINKING_LEVELS as readonly string[]).includes(level)
    ? (level as ThinkingLevel)
    : null;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  },
);
