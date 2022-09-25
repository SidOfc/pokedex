import path from 'node:path';
import glob from 'glob';

const args = process.argv.slice(2);
const source = new URL(path.join('.', 'generators'), import.meta.url).pathname;
const paths =
    args.length === 0
        ? glob.sync(path.join(source, '*'))
        : args.map((name) => path.join(source, `${name}.js`));

const generators = paths.map(async (path) => await import(path));

for await (const generator of generators) {
    await generator.build();
}
