import { FieldType, ResourceSchema } from '@/types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_REGEX = /^https?:\/\/.+/;

function validateField(value: unknown, expectedType: FieldType, fieldName: string): string | null {
  if (value === null || value === undefined) {
    return `Field "${fieldName}" is required`;
  }

  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') return `Field "${fieldName}" must be a string`;
      if (value.length === 0) return `Field "${fieldName}" cannot be empty`;
      if (value.length > 10000) return `Field "${fieldName}" exceeds max length of 10000`;
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) return `Field "${fieldName}" must be a number`;
      break;

    case 'boolean':
      if (typeof value !== 'boolean') return `Field "${fieldName}" must be a boolean`;
      break;

    case 'uuid':
      if (typeof value !== 'string' || !UUID_REGEX.test(value))
        return `Field "${fieldName}" must be a valid UUID`;
      break;

    case 'email':
      if (typeof value !== 'string' || !EMAIL_REGEX.test(value))
        return `Field "${fieldName}" must be a valid email`;
      break;

    case 'url':
      if (typeof value !== 'string' || !URL_REGEX.test(value))
        return `Field "${fieldName}" must be a valid URL`;
      break;

    case 'date':
      if (typeof value !== 'string' || isNaN(Date.parse(value)))
        return `Field "${fieldName}" must be a valid ISO date string`;
      break;

    case 'array':
      if (!Array.isArray(value)) return `Field "${fieldName}" must be an array`;
      break;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value))
        return `Field "${fieldName}" must be an object`;
      break;

    default:
      return `Unknown field type "${expectedType}" for "${fieldName}"`;
  }

  return null;
}

export function validatePayload(
  payload: Record<string, unknown>,
  schema: ResourceSchema
): ValidationResult {
  const errors: string[] = [];
  const schemaKeys = Object.keys(schema);
  const payloadKeys = Object.keys(payload);

  // Check for unknown fields
  for (const key of payloadKeys) {
    if (!schemaKeys.includes(key)) {
      errors.push(`Unknown field "${key}". Allowed fields: ${schemaKeys.join(', ')}`);
    }
  }

  // Validate each schema field
  for (const [fieldName, fieldType] of Object.entries(schema)) {
    const error = validateField(payload[fieldName], fieldType, fieldName);
    if (error) errors.push(error);
  }

  return { valid: errors.length === 0, errors };
}

export function getFieldTypeExample(type: FieldType): unknown {
  switch (type) {
    case 'string': return 'example text';
    case 'number': return 42;
    case 'boolean': return true;
    case 'uuid': return '550e8400-e29b-41d4-a716-446655440000';
    case 'email': return 'user@example.com';
    case 'url': return 'https://example.com';
    case 'date': return new Date().toISOString();
    case 'array': return ['item1', 'item2'];
    case 'object': return { key: 'value' };
    default: return null;
  }
}

export function generateExamplePayload(schema: ResourceSchema): Record<string, unknown> {
  const example: Record<string, unknown> = {};
  for (const [field, type] of Object.entries(schema)) {
    example[field] = getFieldTypeExample(type);
  }
  return example;
}
