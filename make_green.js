const fs = require('fs');
let code;

// Footer.tsx
code = fs.readFileSync('src/modules/GlobalSettings/presentation/Footer.tsx', 'utf8');
code = code.replace(/import Image from 'next\/image';\n/g, '');
code = code.replace(/<img\n\s*src=\{logoLight\}/g, '{/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}\n      <img\n        src={logoLight}');
code = code.replace(/<img\n\s*src=\{logoDark\}/g, '{/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}\n        <img\n          src={logoDark}');
code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- Logo es de origen externo \*\/\}\n/g, '');
fs.writeFileSync('src/modules/GlobalSettings/presentation/Footer.tsx', code);

// Navbar.tsx
code = fs.readFileSync('src/modules/GlobalSettings/presentation/Navbar.tsx', 'utf8');
code = code.replace(/import Image from 'next\/image';\n/g, '');
code = code.replace(/<img\n\s*src=\{logoLight\}/g, '{/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}\n          <img\n            src={logoLight}');
code = code.replace(/<img\n\s*src=\{logoDark\}/g, '{/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}\n            <img\n              src={logoDark}');
code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- Logo es de origen externo \*\/\}\n/g, '');
fs.writeFileSync('src/modules/GlobalSettings/presentation/Navbar.tsx', code);

// BeforeAfter.tsx
code = fs.readFileSync('src/modules/Page/presentation/sections/BeforeAfter.tsx', 'utf8');
code = code.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- Icono inline \*\/\}\n/g, '');
code = code.replace(/<img\n\s*src=\{`data:image\/svg\+xml;utf8/g, '{/* eslint-disable-next-line @next/next/no-img-element -- Icono inline fuera del optimizador */}\n            <img\n              src={`data:image/svg+xml;utf8');
fs.writeFileSync('src/modules/Page/presentation/sections/BeforeAfter.tsx', code);

