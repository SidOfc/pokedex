import path from 'node:path';
import {
    request,
    hasLocal,
    retriable,
    destroy,
    pokeapi,
    batch,
    save,
    bust,
    only,
    gfx,
} from '../util.js';
import * as Pokemon from '../models/pokemon.js';

export async function build(settings = {}) {
    const resource = 'pokemon';

    await Promise.all([destroy(resource), destroy(`${resource}.json`)]);

    const endpoint = pokeapi(resource, {limit: 2000});
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
            const pkmn = await response.json();
            const speciesResponse = await request(pkmn.species.url);
            const species = await speciesResponse.json();
            const item = Pokemon.process({pkmn, species});

            await Promise.all(
                Object.entries(item.images)
                    .filter(([, url]) => url)
                    .map(([type, url]) =>
                        retriable(async () => {
                            const ext = path.extname(url);
                            const fileName = `${pkmn.id}.${type}${ext}`;
                            const imgResponse = await request(url);
                            const arrayBuf = await imgResponse.arrayBuffer();
                            const originalBuf = Buffer.from(arrayBuf);
                            const buffer = type.startsWith('large')
                                ? await gfx(originalBuf, (instance) =>
                                      instance
                                          .fuzz(3, true)
                                          .trim()
                                          .gravity('Center')
                                          .background('None')
                                          .resize(475, 475)
                                          .extent(475, 475)
                                  ).catch(() => bust(url))
                                : originalBuf;

                            item.images[type] = `api/${resource}/${fileName}`;

                            return save(path.join(resource, fileName), buffer);
                        })
                    )
            );

            await retriable(() =>
                save(path.join(resource, `${pkmn.id}.json`), item)
            );

            return item;
        },
    });

    const indexKeys = ['id', 'name', 'order', 'types', 'default', 'images'];
    const mappedItems = items
        .map((item) => only(item, indexKeys))
        .filter((item) => item.isDefault && item.order >= 0);

    await save(`${resource}.json`, mappedItems);

    return mappedItems;
}
