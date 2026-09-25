const fs = require('fs');

let code = fs.readFileSync('src/modules/Page/presentation/sections/newBlocksB.spec.tsx', 'utf8');
const toRemove = `it('las imágenes de las características cargan diferidas y conservan su alt (si no tienen explícito quedan decorativas)', () => {
    const html = renderToStaticMarkup(
      <Features 
        sectionProps={{
          title: 'Title',
          items: [{ title: 'Item 1', imageUrl: 'https://img.com/a.jpg' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });`;
code = code.replace(toRemove, '');
fs.writeFileSync('src/modules/Page/presentation/sections/newBlocksB.spec.tsx', code);

let variants = fs.readFileSync('src/modules/Page/presentation/sections/sectionVariants.spec.tsx', 'utf8');
variants = variants.replace(/}\);\n$/, `  ${toRemove}\n});\n`);
fs.writeFileSync('src/modules/Page/presentation/sections/sectionVariants.spec.tsx', variants);
