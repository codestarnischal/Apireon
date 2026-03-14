import { SchemaDefinition } from '@/types';

const SYSTEM_PROMPT = `You are the Apireon Architect Engine. Your job is to convert a natural language API description into a structured JSON schema definition.

RULES:
1. Extract resource names (nouns, pluralized lowercase). E.g. "books", "authors", "orders".
2. For each resource, define fields with these allowed types: "string", "number", "boolean", "uuid", "email", "url", "date", "array", "object".
3. Always include sensible fields. If a user says "bookstore API with books and authors", infer typical fields.
4. Use snake_case for field names.
5. Add relationship fields as uuid type (e.g., author_id for a book referencing an author).
6. Do NOT include "id", "created_at", or "updated_at" — these are auto-managed.
7. Keep it practical — 3-8 fields per resource is ideal.

RESPOND WITH ONLY valid JSON in this exact format, nothing else:
{
  "name": "Short project name",
  "description": "One-line description",
  "schema": {
    "resource_name": {
      "field_name": "field_type",
      ...
    },
    ...
  }
}`;

export async function generateSchema(prompt: string): Promise<{
  name: string;
  description: string;
  schema: SchemaDefinition;
}> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Design an API schema for: "${prompt}"`,
        },
      ],
      system: SYSTEM_PROMPT,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Architect Engine failed: ${errorText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error('No response from Architect Engine');
  }

  // Parse the JSON from the response, handling potential markdown fences
  const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate structure
  if (!parsed.name || !parsed.schema || typeof parsed.schema !== 'object') {
    throw new Error('Invalid schema structure from Architect Engine');
  }

  return {
    name: parsed.name,
    description: parsed.description || '',
    schema: parsed.schema as SchemaDefinition,
  };
}

// Fallback: deterministic schema generator for when AI is unavailable
export function generateSchemaFallback(prompt: string): {
  name: string;
  description: string;
  schema: SchemaDefinition;
} {
  const lower = prompt.toLowerCase();
  const schema: SchemaDefinition = {};

  // Common API patterns
  const patterns: Record<string, Record<string, string>> = {
    book: { title: 'string', author_id: 'uuid', isbn: 'string', price: 'number', genre: 'string', published_date: 'date', in_stock: 'boolean' },
    author: { name: 'string', bio: 'string', email: 'email', website: 'url', born_year: 'number' },
    user: { username: 'string', email: 'email', display_name: 'string', bio: 'string', is_active: 'boolean' },
    product: { name: 'string', description: 'string', price: 'number', category: 'string', image_url: 'url', in_stock: 'boolean' },
    order: { customer_id: 'uuid', product_ids: 'array', total: 'number', status: 'string', shipping_address: 'string' },
    post: { title: 'string', content: 'string', author_id: 'uuid', tags: 'array', published: 'boolean' },
    comment: { post_id: 'uuid', author_id: 'uuid', body: 'string', likes: 'number' },
    task: { title: 'string', description: 'string', assignee_id: 'uuid', status: 'string', priority: 'string', due_date: 'date' },
    event: { title: 'string', description: 'string', location: 'string', start_date: 'date', end_date: 'date', max_attendees: 'number' },
    restaurant: { name: 'string', cuisine: 'string', address: 'string', rating: 'number', price_range: 'string', website: 'url' },
    review: { restaurant_id: 'uuid', reviewer_name: 'string', rating: 'number', comment: 'string' },
    movie: { title: 'string', director: 'string', genre: 'string', year: 'number', rating: 'number', synopsis: 'string' },
  };

  let projectName = 'My API';
  const matched: string[] = [];

  for (const [keyword, fields] of Object.entries(patterns)) {
    if (lower.includes(keyword)) {
      const plural = keyword + 's';
      schema[plural] = fields as Record<string, any>;
      matched.push(plural);
    }
  }

  // If nothing matched, create a generic items resource
  if (matched.length === 0) {
    schema['items'] = {
      name: 'string',
      description: 'string',
      value: 'number',
      tags: 'array',
      is_active: 'boolean',
    };
    matched.push('items');
  }

  projectName = matched.join(' & ') + ' API';

  return {
    name: projectName.charAt(0).toUpperCase() + projectName.slice(1),
    description: `API with ${matched.join(', ')} resources`,
    schema,
  };
}
