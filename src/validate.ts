import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { ValidationResult } from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

function loadSchema(version: string) {
  const filename = version === '0.2'
    ? 'schema/coordcard.v0.2.schema.json'
    : 'schema/coordcard.v0.1.schema.json';
  const schemaPath = path.resolve(process.cwd(), filename);
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

export function validateCard(card: any): ValidationResult {
  const version = typeof card?.version === 'string' ? card.version : '0.1';
  const schemaJson = loadSchema(version);
  const validateFn = ajv.compile(schemaJson);
  const ok = validateFn(card);
  if (ok) return { ok: true };
  const errors = (validateFn.errors ?? []).map((e) => ({
    path: e.instancePath || e.schemaPath || '',
    message: e.message || 'invalid'
  }));
  return { ok: false, errors };
}
