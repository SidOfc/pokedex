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
} from '../util.js';
import * as Item from '../models/item.js';

export async function build(settings = {}) {
    const resource = 'item';

    await Promise.all([destroy(resource), destroy(`${resource}.json`)]);

    const endpoint = pokeapi(resource, {limit: 2000});
    const response = await request(endpoint, {cache: false});
    const {results} = await response.json();
    const allowFast = hasLocal(...results.map(({url}) => url));
    const items = await batch({
        label: resource,
        items: results,
        size: settings.batchSize ?? (allowFast ? 200 : 20),
        delay: settings.batchDelay ?? (allowFast ? 0 : 3000),
        async callback({url}) {
            const response = await request(url);
            const rawItem = await response.json();
            const item = Item.process(rawItem);

            if (item.image) {
                await retriable(async () => {
                    const ext = path.extname(item.image);
                    const fileName = `${item.id}${ext}`;
                    const imgResponse = await request(item.image);
                    const arrayBuf = await imgResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuf);

                    item.image = `api/${resource}/${fileName}`;

                    return save(path.join(resource, fileName), buffer);
                });
            }

            return item;
        },
    });

    await save(
        `${resource}.json`,
        items.map(({id, name, image}) => ({id, name, image}))
    );

    return items;
}
