import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { ValidationResult } from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const schemaPath = path.resolve(process.cwd(), 'schema/coordcard.v0.1.schema.json');
const schemaJson = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validateFn = ajv.compile(schemaJson);

export function validateCard(card: unknown): ValidationResult {
  const ok = validateFn(card);
  if (ok) return { ok: true };
  const errors = (validateFn.errors ?? []).map((e) => ({
    path: e.instancePath || e.schemaPath || '',
    message: e.message || 'invalid'
  }));
  return { ok: false, errors };
}
