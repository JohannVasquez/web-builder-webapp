const fs = require('fs');

function fix() {
  // BeforeAfter inline SVG
  let before = fs.readFileSync('src/modules/Page/presentation/sections/BeforeAfter.tsx', 'utf8');
  before = before.replace(/<img\s+src=\{`data:image\/svg\+xml;utf8/g, ' {/* eslint-disable-next-line @next/next/no-img-element -- Icono inline */}\n            <img src={`data:image/svg+xml;utf8');
  fs.writeFileSync('src/modules/Page/presentation/sections/BeforeAfter.tsx', before);

  // Navbar
  let navbar = fs.readFileSync('src/modules/GlobalSettings/presentation/Navbar.tsx', 'utf8');
  navbar = "import Image from 'next/image';\n" + navbar;
  navbar = navbar.replace(/<img\n\s*src=\{logoLight\}\n\s*alt=\{settings\.siteName\}\n\s*loading="eager"\n\s*decoding="async"\n\s*className=\{logoDark !== undefined \? 'h-8 w-auto dark:hidden' : 'h-8 w-auto'\}\n\s*\/>/g, `<div className={logoDark !== undefined ? 'relative h-8 w-32 dark:hidden' : 'relative h-8 w-32'}><Image src={logoLight} alt={settings.siteName} fill className="object-contain object-left" priority sizes="128px" /></div>`);
  navbar = navbar.replace(/<img\n\s*src=\{logoDark\}\n\s*alt=\{settings\.siteName\}\n\s*loading="eager"\n\s*decoding="async"\n\s*className="hidden h-8 w-auto dark:block"\n\s*\/>/g, `<div className="relative hidden h-8 w-32 dark:block"><Image src={logoDark} alt={settings.siteName} fill className="object-contain object-left" priority sizes="128px" /></div>`);
  fs.writeFileSync('src/modules/GlobalSettings/presentation/Navbar.tsx', navbar);

  // Footer
  let footer = fs.readFileSync('src/modules/GlobalSettings/presentation/Footer.tsx', 'utf8');
  footer = "import Image from 'next/image';\n" + footer;
  footer = footer.replace(/<img\n\s*src=\{logoLight\}\n\s*alt=\{settings\.siteName\}\n\s*loading="lazy"\n\s*decoding="async"\n\s*className=\{logoDark !== undefined \? 'h-9 w-auto dark:hidden' : 'h-9 w-auto'\}\n\s*\/>/g, `<div className={logoDark !== undefined ? 'relative h-9 w-32 dark:hidden' : 'relative h-9 w-32'}><Image src={logoLight} alt={settings.siteName} fill className="object-contain object-left" sizes="128px" /></div>`);
  footer = footer.replace(/<img\n\s*src=\{logoDark\}\n\s*alt=\{settings\.siteName\}\n\s*loading="lazy"\n\s*decoding="async"\n\s*className="hidden h-9 w-auto dark:block"\n\s*\/>/g, `<div className="relative hidden h-9 w-32 dark:block"><Image src={logoDark} alt={settings.siteName} fill className="object-contain object-left" sizes="128px" /></div>`);
  fs.writeFileSync('src/modules/GlobalSettings/presentation/Footer.tsx', footer);
}
fix();
