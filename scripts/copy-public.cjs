const fs = require('node:fs');
const path = require('node:path');
fs.cpSync(path.join(__dirname, '../src/public'), path.join(__dirname, '../dist/public'), { recursive: true });
