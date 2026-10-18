import { Fragment } from 'react';

// Renders **bold** segments; everything else is plain text.
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={index}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

// Bullets indented with two spaces become sub-bullets of the bullet above them.
export function nestBullets(bullets: string[]) {
  const nested: Array<{ text: string; children: string[] }> = [];
  for (const bullet of bullets) {
    const parent = nested[nested.length - 1];
    if (bullet.startsWith('  ') && parent) parent.children.push(bullet.trim());
    else nested.push({ text: bullet, children: [] });
  }
  return nested;
}
