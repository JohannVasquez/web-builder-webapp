const { matchRemotePattern } = require('next/dist/shared/lib/match-remote-pattern');
const config1 = { protocol: 'http', hostname: 'localhost' };
const config2 = { protocol: 'http', hostname: 'localhost', port: '' };
const url = new URL('http://localhost:9000/image.png');
console.log('Without port:', matchRemotePattern(config1, url));
console.log('With empty port:', matchRemotePattern(config2, url));
