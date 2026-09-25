const fs = require('fs');

const paths = [
  'src/modules/Page/presentation/sections/Gallery.tsx',
  'src/modules/Page/presentation/sections/GoogleReviews.tsx',
  'src/modules/Page/presentation/sections/Team.tsx',
  'src/modules/Page/presentation/sections/Features.tsx',
  'src/modules/Page/presentation/sections/Columns.tsx',
  'src/modules/Page/presentation/sections/LogoCloud.tsx',
  'src/modules/Page/presentation/sections/TextBlock.tsx',
  'src/modules/Page/presentation/sections/BeforeAfter.tsx',
  'src/modules/Page/presentation/sections/SplitHighlights.tsx',
  'src/modules/Blog/presentation/BlogContent.tsx',
  'src/modules/GlobalSettings/presentation/Navbar.tsx',
  'src/modules/GlobalSettings/presentation/Footer.tsx'
];

for (const p of paths) {
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');

  if (!code.includes("import Image from 'next/image'")) {
    code = code.replace(/import \{ ([^}]+) \} from 'react';/, "import { $1 } from 'react';\nimport Image from 'next/image';");
    if (!code.includes("import Image")) {
      code = "import Image from 'next/image';\n" + code;
    }
  }

  // Gallery
  if (p.includes('Gallery.tsx')) {
    code = code.replace(/<img[^>]+src={src}[^>]+>/, `<Image src={src} alt={alt} priority={eager} fill className={className} sizes="(max-width: 768px) 100vw, 33vw" />`);
    // Gallery button
    code = code.replace(/className={cn\(\n\s*'ui-card mb-4 block w-full overflow-hidden p-0',\n\s*variant === 'grid' && 'mb-0 aspect-square',\n\s*\)}/g,
                        "className={cn('ui-card mb-4 block w-full overflow-hidden p-0 relative', variant === 'grid' ? 'mb-0 aspect-square' : 'aspect-[4/3]')}");
  }

  // GoogleReviews
  if (p.includes('GoogleReviews.tsx')) {
    code = code.replace(/<img[^>]+src={review\.authorPhotoUrl}[^>]+\/>/, `<Image src={review.authorPhotoUrl} alt="" fill className="object-cover" sizes="48px" />`);
    code = code.replace(/className="size-12 shrink-0 rounded-full object-cover"/, 'className="relative size-12 shrink-0 overflow-hidden rounded-full"');
  }

  // Team
  if (p.includes('Team.tsx')) {
    code = code.replace(/<img[^>]+src={member\.photoUrl}[^>]+\/>/, `<Image src={member.photoUrl} alt={member.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />`);
    code = code.replace(/className={cn\(size, 'shrink-0 rounded-full object-cover'\)}/, "className={cn(size, 'relative shrink-0 overflow-hidden rounded-full')}");
  }

  // Features
  if (p.includes('Features.tsx')) {
    code = code.replace(/<img\n\s*src={item\.imageUrl}\n\s*alt=""\n\s*className="size-16 shrink-0 rounded-lg object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative size-16 shrink-0 overflow-hidden rounded-lg"><Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" /></div>`);
    code = code.replace(/<img\n\s*src={item\.imageUrl}\n\s*alt=""\n\s*className="h-32 w-full rounded-2xl object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative h-32 w-full overflow-hidden rounded-2xl"><Image src={item.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div>`);
    code = code.replace(/<img\n\s*src={item\.imageUrl}\n\s*alt=""\n\s*className="h-32 w-full rounded-lg object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative h-32 w-full overflow-hidden rounded-lg"><Image src={item.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div>`);
  }

  // Columns
  if (p.includes('Columns.tsx')) {
    code = code.replace(/<img\n\s*src={column\.imageUrl}\n\s*alt={column\.imageAlt \?\? ''}\n\s*className="aspect-4\/3 w-full rounded-xl object-cover shadow-sm"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-4/3 w-full overflow-hidden rounded-xl shadow-sm"><Image src={column.imageUrl} alt={column.imageAlt ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /></div>`);
  }

  // LogoCloud
  if (p.includes('LogoCloud.tsx')) {
    code = code.replace(/<img\n\s*src={logo\.url}\n\s*alt={logo\.alt}\n\s*width=\{96\}\n\s*height=\{36\}\n\s*className="h-9 w-24 shrink-0 object-contain opacity-70 grayscale transition-opacity hover:opacity-100 hover:grayscale-0"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<Image src={logo.url} alt={logo.alt} width={96} height={36} className="h-9 w-24 shrink-0 object-contain opacity-70 grayscale transition-opacity hover:opacity-100 hover:grayscale-0" />`);
  }

  // TextBlock
  if (p.includes('TextBlock.tsx')) {
    code = code.replace(/<img\n\s*src={imageUrl}\n\s*alt={imageAlt \?\? ''}\n\s*className="w-full rounded-xl shadow-sm"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-sm"><Image src={imageUrl} alt={imageAlt ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>`);
  }

  // BeforeAfter
  if (p.includes('BeforeAfter.tsx')) {
    code = code.replace(/<img\n\s*src={beforeUrl}\n\s*alt={beforeLabel}\n\s*className="aspect-4\/3 w-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-4/3 w-full overflow-hidden"><Image src={beforeUrl} alt={beforeLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>`);
    code = code.replace(/<img\n\s*src={afterUrl}\n\s*alt={afterLabel}\n\s*className="aspect-4\/3 w-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-4/3 w-full overflow-hidden"><Image src={afterUrl} alt={afterLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>`);
    
    code = code.replace(/<img\n\s*src={afterUrl}\n\s*alt={afterLabel}\n\s*className="absolute inset-0 size-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<Image src={afterUrl} alt={afterLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 100vw" />`);
    code = code.replace(/<img\n\s*src={beforeUrl}\n\s*alt={beforeLabel}\n\s*className="absolute inset-0 size-full object-cover"\n\s*style=\{\{ clipPath: `inset\\(0 \$\{100 - value\}% 0 0\\)` \}\}\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<Image src={beforeUrl} alt={beforeLabel} fill className="object-cover" style={{ clipPath: \`inset(0 \${100 - value}% 0 0)\` }} sizes="(max-width: 768px) 100vw, 100vw" />`);
  }

  // SplitHighlights
  if (p.includes('SplitHighlights.tsx')) {
    code = code.replace(/<img\n\s*src={imageUrl}\n\s*alt={imageAlt \?\? ''}\n\s*className=\{cn\(\n\s*'aspect-4\/3 w-full rounded-2xl object-cover shadow-sm',\n\s*imagePosition === 'right' && 'md:order-2',\n\s*\)\}\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className={cn('relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-sm', imagePosition === 'right' && 'md:order-2')}><Image src={imageUrl} alt={imageAlt ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>`);
  }

  // BlogContent
  if (p.includes('BlogContent.tsx')) {
    code = code.replace(/<img\n\s*src=\{image\.data\.key\}\n\s*alt=\{image\.data\.alt\}\n\s*className="w-full rounded-lg"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative aspect-video w-full overflow-hidden rounded-lg"><Image src={image.data.key} alt={image.data.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 100vw" priority={index === 0} /></div>`);
  }

  // Navbar
  if (p.includes('Navbar.tsx')) {
    code = code.replace(/<img\n\s*src={logoUrl}\n\s*alt="Inicio"\n\s*className="h-8 w-auto object-contain"\n\s*\{\.\.\.imageLoading\(true\)\}\n\s*\/>/g, `<div className="relative h-8 w-32"><Image src={logoUrl} alt="Inicio" fill className="object-contain object-left" priority sizes="128px" /></div>`);
    code = code.replace(/<img\n\s*src={logoUrl}\n\s*alt="Inicio"\n\s*className="h-8 w-auto object-contain"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative h-8 w-32"><Image src={logoUrl} alt="Inicio" fill className="object-contain object-left" sizes="128px" /></div>`);
  }

  // Footer
  if (p.includes('Footer.tsx')) {
    code = code.replace(/<img\n\s*src={logoUrl}\n\s*alt="Inicio"\n\s*className="h-8 w-auto object-contain"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative h-8 w-32"><Image src={logoUrl} alt="Inicio" fill className="object-contain object-left" sizes="128px" /></div>`);
    code = code.replace(/<img\n\s*src={member\.photoUrl}\n\s*alt={member\.name}\n\s*className="size-10 shrink-0 rounded-full object-cover"\n\s*\{\.\.\.imageLoading\(\)\}\n\s*\/>/g, `<div className="relative size-10 shrink-0 overflow-hidden rounded-full"><Image src={member.photoUrl} alt={member.name} fill className="object-cover" sizes="40px" /></div>`);
  }
  
  // Clean up eslint comments
  code = code.replace(/\/\/\s*eslint-disable-next-line\s+@next\/next\/no-img-element[^\n]*\n/g, '');
  code = code.replace(/\{\/\*\s*eslint-disable-next-line\s+@next\/next\/no-img-element[^\n]*\*\/\}\n/g, '');

  fs.writeFileSync(p, code);
}
