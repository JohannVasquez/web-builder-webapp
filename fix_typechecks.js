const fs = require('fs');

const files = [
  'src/modules/Blog/presentation/BlogContent.tsx',
  'src/modules/GlobalSettings/presentation/Footer.tsx',
  'src/modules/GlobalSettings/presentation/Navbar.tsx',
  'src/modules/Page/presentation/sections/Columns.tsx',
  'src/modules/Page/presentation/sections/Features.tsx',
  'src/modules/Page/presentation/sections/GoogleReviews.tsx',
  'src/modules/Page/presentation/sections/Hero.tsx',
  'src/modules/Page/presentation/sections/LogoCloud.tsx',
  'src/modules/Page/presentation/sections/SplitHighlights.tsx',
  'src/modules/Page/presentation/sections/Team.tsx',
  'src/modules/Page/presentation/sections/TextBlock.tsx'
];

for (const p of files) {
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');

  // Remove unused imageLoading
  code = code.replace(/import \{ imageLoading \} from '@\/shared\/lib\/imageLoading';\n/g, '');

  // Columns.tsx type issue
  if (p.includes('Columns.tsx')) {
    code = code.replace(/src=\{column\.imageUrl\}/g, 'src={column.imageUrl!}');
  }

  // Footer and Navbar unused Image import
  if (p.includes('Footer.tsx') || p.includes('Navbar.tsx')) {
    if (!code.includes('<Image')) {
      code = code.replace(/import Image from 'next\/image';\n/g, '');
    }
  }

  fs.writeFileSync(p, code);
}
