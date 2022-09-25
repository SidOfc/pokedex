import path from 'node:path';
import {
    request,
    hasLocal,
    retriable,
    pokeapi,
    batch,
    save,
    only,
    gfx,
    bust,
} from '../util.js';
import * as Pokemon from '../models/pokemon.js';

export async function build(settings = {}) {
    const resource = 'pokemon';
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
            const json = await response.json();
            const item = Pokemon.process(json);

            await Promise.all(
                Object.entries(item.images)
                    .filter(([, url]) => url)
                    .map(([type, url]) =>
                        retriable(async () => {
                            const ext = path.extname(url);
                            const fileName = `${json.id}.${type}${ext}`;
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
                save(path.join(resource, `${json.id}.json`), item)
            );

            return item;
        },
    });

    const indexKeys = ['id', 'name', 'order', 'types', 'default', 'images'];
    const mappedItems = items.map((item) => only(item, indexKeys));

    await save(`${resource}.json`, mappedItems);

    return mappedItems;
}
