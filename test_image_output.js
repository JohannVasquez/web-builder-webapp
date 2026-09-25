require('ts-node').register({
  compilerOptions: { jsx: 'react-jsx', module: 'commonjs' }
});
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Image = require('next/image').default;

const html = renderToStaticMarkup(React.createElement(Image, { src: '/test.jpg', alt: '', fill: true }));
console.log(html);
