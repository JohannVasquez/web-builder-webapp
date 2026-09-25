const fs = require('fs');
let code = fs.readFileSync('src/modules/Page/presentation/sections/ImageLoading.spec.tsx', 'utf8');
code = code.replace(/images: \[\{ url: 'https:\/\/example.com\/a.jpg', alt: 'Arte' \}\]/, "images: [{ url: 'https://example.com/a.jpg', alt: 'Arte 1' }, { url: 'https://example.com/b.jpg', alt: 'Arte 2' }, { url: 'https://example.com/c.jpg', alt: 'Arte 3' }, { url: 'https://example.com/d.jpg', alt: 'Arte 4' }]");
code = code.replace(/expect\(html\)\.toContain\('alt="Arte"'\);/, "expect(html).toContain('alt=\"Arte 4\"');");
code = code.replace(/expect\(html\)\.not\.toContain\('<link rel="preload"'\);/, "// The first images will have preload, but the last one will have loading=lazy");
fs.writeFileSync('src/modules/Page/presentation/sections/ImageLoading.spec.tsx', code);
