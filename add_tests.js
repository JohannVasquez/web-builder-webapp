const fs = require('fs');

function inject(file, newTest) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes(newTest.split('\n')[0])) return; // Avoid duplicates
  code = code.replace(/(}\);\n\n)(describe\(|export)/, `$1  ${newTest}\n\n$2`);
  if (code === fs.readFileSync(file, 'utf8')) {
     code = code.replace(/}\);\n$/, `  ${newTest}\n});\n`);
  }
  fs.writeFileSync(file, code);
}

// 1. BeforeAfter
inject('src/modules/Page/presentation/sections/BeforeAfter.spec.tsx', 
`it('las imágenes decorativas y de contenido cargan de forma diferida con sus textos alternativos correspondientes', () => {
    const html = renderToStaticMarkup(<BeforeAfter sectionProps={props} />);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Antes de la obra"');
    expect(html).toContain('alt="Después de la obra"');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 2. Features
inject('src/modules/Page/presentation/sections/newBlocksB.spec.tsx',
`it('las imágenes de las características cargan diferidas y conservan su alt (si no tienen explícito quedan decorativas)', () => {
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
  });`);

// 3. Team
inject('src/modules/Page/presentation/sections/newBlocksB.spec.tsx',
`it('las imágenes del equipo cargan diferidas y conservan el nombre como alt', () => {
    const html = renderToStaticMarkup(
      <Team 
        sectionProps={{
          title: 'Title',
          members: [{ name: 'Juan', role: 'Dev', photoUrl: 'https://img.com/juan.jpg' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Juan"');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 4. Columns
inject('src/modules/Page/presentation/sections/Columns.spec.tsx',
`it('las imágenes de las columnas cargan diferidas y conservan su alt text', () => {
    const html = renderToStaticMarkup(
      <Columns 
        sectionProps={{
          title: 'Title',
          columns: [{ title: 'Col 1', imageUrl: 'https://img.com/a.jpg', imageAlt: 'Una columna' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Una columna"');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 5. Gallery
inject('src/modules/Page/presentation/sections/Gallery.spec.tsx',
`it('las imágenes de la galería cargan diferidas y respetan el alt', () => {
    const html = renderToStaticMarkup(
      <Gallery 
        sectionProps={{
          title: 'Title',
          images: [{ url: 'https://img.com/a.jpg', alt: 'Arte' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Arte"');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 6. GoogleReviews
inject('src/modules/Page/presentation/sections/GoogleReviews.spec.tsx',
`it('los avatares de reseñas cargan diferidos y son decorativos (alt="")', () => {
    const html = renderToStaticMarkup(
      <GoogleReviews 
        sectionProps={{
          title: 'Title',
          reviews: [{ author: 'Pepe', rating: 5, avatarUrl: 'https://img.com/pepe.jpg' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 7. LogoCloud
inject('src/modules/Page/presentation/sections/LogoCloud.spec.tsx',
`it('los logos de la nube cargan diferidos y conservan su alt text', () => {
    const html = renderToStaticMarkup(
      <LogoCloud 
        sectionProps={{
          title: 'Title',
          logos: [{ url: 'https://img.com/logo.jpg', alt: 'Un logo' }]
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Un logo"');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 8. TextBlock
inject('src/modules/Page/presentation/sections/TextBlock.spec.tsx',
`it('la imagen adjunta al texto carga diferida y decorativa (alt="")', () => {
    const html = renderToStaticMarkup(
      <TextBlock 
        sectionProps={{
          title: 'Title',
          imageUrl: 'https://img.com/txt.jpg'
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });`);

// 9. SplitHighlights
inject('src/modules/Page/presentation/sections/SplitHighlights.spec.tsx',
`it('la imagen destacada carga diferida y es decorativa (alt="")', () => {
    const html = renderToStaticMarkup(
      <SplitHighlights 
        sectionProps={{
          title: 'Title',
          imageUrl: 'https://img.com/split.jpg'
        }} 
      />
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt=""');
    expect(html).not.toContain('<link rel="preload"');
  });`);

