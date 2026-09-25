const fs = require('fs');
let code = fs.readFileSync('src/modules/Page/presentation/sections/BeforeAfter.tsx', 'utf8');

// Add import
if (!code.includes("import Image from 'next/image'")) {
  code = code.replace(/import \{ ([^}]+) \} from 'react';/, "import { $1 } from 'react';\nimport Image from 'next/image';");
}

code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image \*\/\}\n\s*<img\n\s*src=\{beforeUrl\}\n\s*alt=\{beforeLabel\}\n\s*className="aspect-4\/3 w-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-4/3 w-full overflow-hidden"><Image src={beforeUrl} alt={beforeLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>`);

code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image \*\/\}\n\s*<img\n\s*src=\{afterUrl\}\n\s*alt=\{afterLabel\}\n\s*className="aspect-4\/3 w-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-4/3 w-full overflow-hidden"><Image src={afterUrl} alt={afterLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>`);

code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image \*\/\}\n\s*<img\n\s*src=\{afterUrl\}\n\s*alt=\{afterLabel\}\n\s*className="absolute inset-0 size-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<Image src={afterUrl} alt={afterLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 100vw" />`);

code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image \*\/\}\n\s*<img\n\s*src=\{beforeUrl\}\n\s*alt=\{beforeLabel\}\n\s*className="absolute inset-0 size-full object-cover"\n\s*style=\{\{ clipPath: \`inset\\(0 \\\$\{100 - value\\}% 0 0\\)\` \}\}\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<Image src={beforeUrl} alt={beforeLabel} fill className="object-cover" style={{ clipPath: \`inset(0 \${100 - value}% 0 0)\` }} sizes="(max-width: 768px) 100vw, 100vw" />`);

fs.writeFileSync('src/modules/Page/presentation/sections/BeforeAfter.tsx', code);
