const fs = require('fs');

function fix() {
  let navbar = fs.readFileSync('src/modules/GlobalSettings/presentation/Navbar.tsx', 'utf8');
  navbar = navbar.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image \*\/\}/g, '{/* eslint-disable-next-line @next/next/no-img-element -- Ratio desconocido: next/image sin dimensiones rompe w-auto o exige contenedor fijo */}');
  fs.writeFileSync('src/modules/GlobalSettings/presentation/Navbar.tsx', navbar);

  let footer = fs.readFileSync('src/modules/GlobalSettings/presentation/Footer.tsx', 'utf8');
  footer = footer.replace(/\{\/\* eslint-disable-next-line @next\/next\/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image \*\/\}/g, '{/* eslint-disable-next-line @next/next/no-img-element -- Ratio desconocido: next/image sin dimensiones rompe w-auto o exige contenedor fijo */}');
  fs.writeFileSync('src/modules/GlobalSettings/presentation/Footer.tsx', footer);
}
fix();
