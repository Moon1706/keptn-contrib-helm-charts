import { readFileSync } from 'fs';
import { join } from 'path';
import { updateRegistry } from './registry';

const config = readFileSync(join(__dirname, '..', 'config.yaml'), 'utf8');
updateRegistry(config);
