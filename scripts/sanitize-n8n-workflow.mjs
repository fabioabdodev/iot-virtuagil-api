import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PLACEHOLDERS = {
  secret: '__REDACTED__',
  webhook: '__REMOVED__',
};

const SENSITIVE_PARAM_NAMES = new Set([
  'apikey',
  'api_key',
  'api-key',
  'authorization',
  'token',
  'secret',
  'password',
]);

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || (!args.input && !args.manifest)) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (args.manifest) {
    const manifestRaw = await readFile(args.manifest, 'utf8');
    const manifest = JSON.parse(stripBom(manifestRaw));
    if (!Array.isArray(manifest.workflows)) {
      throw new Error('Manifesto invalido: "workflows" deve ser um array.');
    }

    for (const workflow of manifest.workflows) {
      await sanitizeFile(workflow.input, workflow.output);
    }
    return;
  }

  if (!args.input || !args.output) {
    throw new Error('Use --in e --out juntos, ou --manifest.');
  }

  await sanitizeFile(args.input, args.output);
}

async function sanitizeFile(inputPath, outputPath) {
  const raw = await readFile(inputPath, 'utf8');
  const workflow = JSON.parse(stripBom(raw));
  const sanitized = sanitizeWorkflow(workflow);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8');

  process.stdout.write(`Sanitized: ${inputPath} -> ${outputPath}\n`);
}

function sanitizeWorkflow(workflow) {
  const cloned = deepClone(workflow);

  delete cloned.pinData;
  delete cloned.id;
  delete cloned.versionId;
  delete cloned.webhookUrl;

  if (cloned.meta && typeof cloned.meta === 'object') {
    delete cloned.meta.instanceId;
  }

  if (Array.isArray(cloned.nodes)) {
    cloned.nodes = cloned.nodes.map((node) => sanitizeNode(node));
  }

  return sanitizeValue(cloned, []);
}

function sanitizeNode(node) {
  const cloned = deepClone(node);

  delete cloned.credentials;
  delete cloned.webhookId;

  return sanitizeValue(cloned, ['nodes']);
}

function sanitizeValue(value, pathParts) {
  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeValue(item, [...pathParts, String(index)]));
  }

  if (value && typeof value === 'object') {
    const output = {};

    for (const [key, current] of Object.entries(value)) {
      if (key === 'credentials' || key === 'pinData') {
        continue;
      }

      if (key === 'webhookUrl') {
        output[key] = PLACEHOLDERS.webhook;
        continue;
      }

      if (shouldRedactByKey(key, current)) {
        output[key] = redactString(current);
        continue;
      }

      output[key] = sanitizeValue(current, [...pathParts, key]);
    }

    if (
      typeof output.name === 'string' &&
      typeof output.value === 'string' &&
      SENSITIVE_PARAM_NAMES.has(output.name.trim().toLowerCase())
    ) {
      output.value = redactString(output.value);
    }

    return output;
  }

  if (typeof value === 'string') {
    return redactInlineSecrets(value);
  }

  return value;
}

function shouldRedactByKey(key, value) {
  if (typeof value !== 'string') return false;

  return /(^|_)(apikey|api_key|token|secret|password)$/i.test(key);
}

function redactString(value) {
  if (typeof value !== 'string') return value;
  if (value.trim().startsWith('={{')) return value;
  return PLACEHOLDERS.secret;
}

function redactInlineSecrets(value) {
  return value
    .replace(
      /\b[0-9A-F]{12}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\b/g,
      PLACEHOLDERS.secret,
    )
    .replace(
      /("apikey"\s*:\s*")([^"]+)(")/gi,
      `$1${PLACEHOLDERS.secret}$3`,
    );
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stripBom(value) {
  return value.replace(/^\uFEFF/, '');
}

function parseArgs(argv) {
  const args = {
    help: false,
    input: '',
    output: '',
    manifest: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    switch (current) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--in':
        args.input = argv[index + 1] ?? '';
        index += 1;
        break;
      case '--out':
        args.output = argv[index + 1] ?? '';
        index += 1;
        break;
      case '--manifest':
        args.manifest = argv[index + 1] ?? '';
        index += 1;
        break;
      default:
        throw new Error(`Parametro invalido: ${current}`);
    }
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Uso:',
      '  node scripts/sanitize-n8n-workflow.mjs --in <arquivo-origem> --out <arquivo-destino>',
      '  node scripts/sanitize-n8n-workflow.mjs --manifest <arquivo-manifesto>',
      '',
      'Manifesto esperado:',
      '  {',
      '    "workflows": [',
      '      { "input": "tmp/workflows-fix/fixed/Jade - Current Stable - FIXED.json", "output": "references/n8n/Jade - Current Stable - SANITIZED.json" }',
      '    ]',
      '  }',
      '',
    ].join('\n'),
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
