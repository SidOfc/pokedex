import {rm, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import glob from 'glob';
import gm from 'gm';

const RESOURCE_ROOT = path.resolve(path.join('tmp', 'cache'));
const DIST_ROOT = path.resolve(path.join('dist', 'api'));

export async function gfx(buffer, manipulator) {
    return new Promise((resolve, reject) => {
        manipulator(gm(buffer)).toBuffer((error, result) =>
            error ? reject(error) : resolve(result)
        );
    });
}

export function only(target, keys) {
    return keys.reduce((acc, key) => {
        if (target[key] !== undefined) acc[key] = target[key];

        return acc;
    }, {});
}

export function dist(filePath) {
    return filePath.startsWith('/') ? filePath : path.join(DIST_ROOT, filePath);
}

export function cache(filePath) {
    return filePath.startsWith('/')
        ? filePath
        : path.join(RESOURCE_ROOT, filePath);
}

export function sortBy(prop) {
    return (a, b) => a[prop] - b[prop];
}

export async function retriable(promise, amount = 2) {
    let attempt = 1;

    while (attempt <= amount) {
        try {
            return await promise();
        } catch (e) {
            if (attempt < amount) {
                attempt += 1;

                continue;
            }

            throw e;
        }
    }
}

export async function save(filePath, content) {
    const fullPath = dist(filePath);

    await mkdir(path.dirname(fullPath), {recursive: true});

    return writeFile(
        fullPath,
        filePath.endsWith('.json') ? JSON.stringify(content) : content
    );
}

export function urlToFilename(url) {
    const ext = path.extname(url);
    const extPattern = new RegExp(`${ext}$`, 'i');
    const cleanPath = url.replace(extPattern, '').replace(/\W/g, '_');

    return `${cleanPath}${ext}`;
}

export function hasLocal(...urls) {
    const paths = glob.sync(cache('*'));

    return urls
        .map((url) => cache(urlToFilename(url)))
        .every((urlPath) => paths.some((file) => file.includes(urlPath)));
}

export async function destroy(filePath) {
    return rm(dist(filePath), {force: true, recursive: true});
}

export async function bust(url) {
    const fileName = urlToFilename(url);
    const cached = (glob.sync(cache(`${fileName}*`))[0] ?? '').split('/').pop();

    return rm(cache(cached), {force: true, recursive: true});
}

export function pokeapi(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';

    return `https://pokeapi.co/api/v2/${path}${suffix}`;
}

export async function request(url, options = {}) {
    const settings = {cache: true, ...options};
    const fileName = urlToFilename(url);
    const cached =
        settings.cache &&
        (glob.sync(cache(`${fileName}*`))[0] ?? '').split('/').pop();

    if (cached) {
        const fullPath = cache(cached);
        const resourceSuffix = cached.match(/(.*)\.([0-9a-f]*)$/i)?.[2];
        const contentType = Buffer.from(resourceSuffix ?? '', 'hex').toString();
        const buffer = await readFile(fullPath);

        return new Response(new Blob([buffer], {type: contentType}), {
            status: 200,
            statusText: 'OK',
            headers: {
                ['content-type']: contentType,
                ['content-length']: buffer.length,
            },
        });
    } else {
        const response = await fetch(url);
        const [contentType] = response.headers.get('content-type').split(';');
        const resourcePrefix = cache(fileName);
        const resourceSuffix = Buffer.from(contentType).toString('hex');
        const resourcePath = `${resourcePrefix}.${resourceSuffix}`;
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await writeFile(resourcePath, buffer);

        return new Response(new Blob([buffer], {type: contentType}), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }
}

export async function batch({items, size, delay, callback, label}) {
    const results = [];
    const batches = Array(Math.ceil(items.length / size))
        .fill()
        .map((_, index) => items.slice(index * size, (index + 1) * size));

    function execute(...args) {
        return retriable(() => callback(...args));
    }

    function log(batch, text) {
        const date = new Date();
        const total = batches.length;
        const index = batches.indexOf(batch);
        const start = index * size;
        const finish = start + batch.length - 1;
        const num = `${index + 1}`.padStart(`${total}`.length, '0');
        const hh = `${date.getHours()}`.padStart(2, '0');
        const mm = `${date.getMinutes()}`.padStart(2, '0');
        const ss = `${date.getSeconds()}`.padStart(2, '0');
        const padding = `${batches.length * size}`.length;
        const time = `[${hh}:${mm}:${ss}]`;
        const rangeStart = `${start}`.padStart(padding, '0');
        const rangeFinish = `${finish}`.padStart(padding, '0');
        const range = `[${rangeStart}..${rangeFinish}]`;
        const progress = `${num} / ${total}`;
        const name = label ? `batch(${label})` : 'batch(unknown)';

        return console.log(`${time} ${name} ${progress} ${range} :: ${text}`);
    }

    for await (const batch of batches) {
        log(batch, 'start');

        results.push(...(await Promise.all(batch.map(execute))));

        if (delay > 0 && batches.indexOf(batch) < batches.length - 1) {
            log(batch, `pause ${delay}ms`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        log(batch, 'done');
    }

    return results;
}
