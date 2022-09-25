import path from 'node:path';
import {
    request,
    hasLocal,
    retriable,
    destroy,
    pokeapi,
    batch,
    save,
} from '../util.js';
import * as EvolutionChain from '../models/evolution-chain.js';

export async function build(settings = {}) {
    const resource = 'evolution-chain';

    await Promise.all([destroy(resource), destroy(`${resource}.json`)]);

    const endpoint = pokeapi(resource, {limit: 1000});
    const response = await request(endpoint, {cache: false});
    const {results} = await response.json();
    const allowFast = hasLocal(...results.map(({url}) => url));
    const items = await batch({
        label: resource,
        items: results,
        size: settings.batchSize ?? (allowFast ? 200 : 20),
        delay: settings.batchDelay ?? (allowFast ? 0 : 5000),
        async callback({url}) {
            const response = await request(url);
            const json = await response.json();
            const item = EvolutionChain.process(json);

            await retriable(() =>
                save(path.join(resource, `${json.id}.json`), item)
            );

            return item;
        },
    });

    const combined = items.reduce((acc, item) => Object.assign(acc, item), {});

    await retriable(() => save(`${resource}.json`, combined));

    return combined;
}
