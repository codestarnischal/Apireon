import { ResourceSchema } from '@/types';
import { generateExamplePayload } from '@/lib/validators/schema-validator';

export type SnippetLanguage = 'curl' | 'javascript' | 'python';

export function generateGetSnippet(
  baseUrl: string,
  resource: string,
  lang: SnippetLanguage
): string {
  const url = `${baseUrl}/${resource}`;

  switch (lang) {
    case 'curl':
      return `curl -X GET "${url}" \\
  -H "Content-Type: application/json"`;

    case 'javascript':
      return `const response = await fetch("${url}");
const data = await response.json();
console.log(data);`;

    case 'python':
      return `import requests

response = requests.get("${url}")
data = response.json()
print(data)`;
  }
}

export function generatePostSnippet(
  baseUrl: string,
  resource: string,
  schema: ResourceSchema,
  lang: SnippetLanguage
): string {
  const url = `${baseUrl}/${resource}`;
  const example = generateExamplePayload(schema);
  const jsonBody = JSON.stringify(example, null, 2);

  switch (lang) {
    case 'curl':
      return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonBody}'`;

    case 'javascript':
      return `const response = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${jsonBody})
});
const data = await response.json();
console.log(data);`;

    case 'python':
      return `import requests

payload = ${jsonBody.replace(/: true/g, ': True').replace(/: false/g, ': False').replace(/: null/g, ': None')}

response = requests.post("${url}", json=payload)
data = response.json()
print(data)`;
  }
}

export function generateDeleteSnippet(
  baseUrl: string,
  resource: string,
  lang: SnippetLanguage
): string {
  const url = `${baseUrl}/${resource}?id=RECORD_ID`;

  switch (lang) {
    case 'curl':
      return `curl -X DELETE "${url}" \\
  -H "Content-Type: application/json"`;

    case 'javascript':
      return `const response = await fetch("${url}", {
  method: "DELETE"
});
const data = await response.json();
console.log(data);`;

    case 'python':
      return `import requests

response = requests.delete("${url}")
data = response.json()
print(data)`;
  }
}
