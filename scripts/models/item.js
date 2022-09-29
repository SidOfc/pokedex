export function process(data) {
    return {
        id: data.id,
        name: data.name,
        cost: data.cost,
        category: data.category?.name ?? null,
        image: data.sprites?.default ?? null,
        attributes: data.attributes.map(({name}) => name),
        effect: data.effect_entries.find(({language}) => language.name === 'en')
            ?.short_effect,
    };
}
