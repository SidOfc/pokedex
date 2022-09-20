import fs from 'fs';
import path from 'path';
import shinyUrls from './shiny-urls.js';

const cacheDir = 'tmp';
const baseDir = 'dist/api';
const {existsSync} = fs;
const {mkdir, writeFile, readFile} = fs.promises;
const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
const {results} = await response.json();
const processed = [];
const queue = [];
const cacheOnly = process.argv.includes('cache-only');
let batch = 1;

await mkdir(`${cacheDir}/pokemon`, {recursive: true});
await mkdir(`${baseDir}/pokemon`, {recursive: true});

function sortBy(prop) {
    return (a, b) => a[prop] - b[prop];
}

async function loadPokemon(url, key) {
    const cacheKey = `${cacheDir}/pokemon/${key}.json`;

    if (existsSync(cacheKey)) {
        const contents = await readFile(cacheKey);
        const json = JSON.parse(contents);

        return json;
    } else {
        const response = await fetch(url);
        const json = await response.json();

        await writeFile(cacheKey, JSON.stringify(json));

        return json;
    }
}

async function loadPokemonImage(url, key) {
    const name = `${key}${path.extname(url)}`;
    const cacheKey = `${cacheDir}/pokemon/${name}`;

    if (existsSync(cacheKey)) {
        const buffer = readFile(cacheKey);

        return buffer;
    } else {
        const response = await fetch(url);
        const data = await response.arrayBuffer();
        const buffer = Buffer.from(data);

        await writeFile(cacheKey, buffer);

        return buffer;
    }
}

async function savePokemon(url) {
    const json = await loadPokemon(url, url.split('/').at(-2));
    const {id, name, order, is_default, sprites, types} = json;
    const {front_default, front_shiny, other} = sprites;
    const front_artwork = other?.['official-artwork']?.front_default;

    const images = await Promise.all(
        [
            ['thumbRegular', front_default],
            ['thumbShiny', front_shiny],
            ['largeRegular', front_artwork],
            ['largeShiny', shinyUrls[id]],
        ].map(async ([type, url]) => {
            if (url) {
                const ext = path.extname(url);
                const buffer = await loadPokemonImage(url, `${id}.${type}`);
                const apiUrl = `${baseDir}/pokemon/${id}.${type}${ext}`;

                if (!cacheOnly) {
                    await writeFile(apiUrl, buffer);
                }

                return [type, `api/pokemon/${id}.${type}${ext}`];
            }

            return [type, null];
        })
    );

    const pokemon = {
        id,
        name,
        order,
        types: types.sort(sortBy('slot')).map(({type, slot}) => type.name),
        default: is_default,
        versions: json.game_indices.map(({version}) => version.name),
        images: images.reduce((acc, [type, url]) => {
            acc[type] = url;

            return acc;
        }, {}),
    };

    if (!cacheOnly) {
        await writeFile(
            `${baseDir}/pokemon/${id}.json`,
            JSON.stringify({
                ...pokemon,
                height: json.height,
                weight: json.weight,
                baseExp: json.base_experience,
                stats: json.stats.map(({stat, effort, base_stat}) => ({
                    name: stat.name,
                    base: base_stat,
                    effort,
                })),
                abilities: json.abilities
                    .sort(sortBy('slot'))
                    .map(({ability, is_hidden}) => ({
                        name: ability.name,
                        hidden: is_hidden,
                    })),
                moves: json.moves.map(({move, version_group_details}) => ({
                    name: move.name,
                    versions: version_group_details.map((details) => ({
                        version: details.version_group.name,
                        method: details.move_learn_method.name,
                        level: details.level_learned_at,
                    })),
                })),
            })
        );
    }

    processed.push(pokemon);

    return pokemon;
}

async function processQueue() {
    const amount = queue.length;
    const mode = cacheOnly ? 'cache-only' : 'copy-dist';

    await Promise.all(queue.splice(0, amount));
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`batch#${batch.toString().padStart(3, '0')} (${mode})`);

    batch += 1;
}

for (const {url} of results) {
    queue.push(savePokemon(url));

    if (queue.length % 100 === 0) {
        await processQueue();
    }
}

if (queue.length !== 0) {
    await processQueue();
}

if (!cacheOnly) {
    await writeFile(
        `${baseDir}/pokemon.json`,
        JSON.stringify(
            processed
                .filter((pkmn) => pkmn.default && pkmn.order >= 0)
                .sort(sortBy('order'))
        )
    );
}
