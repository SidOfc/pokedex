export function process({chain}) {
    return transformChain(chain);
}

function transformChain(item, acc = {}, parent = null) {
    item.evolves_to.forEach((next) => transformChain(next, acc, item));

    acc[item.species.name] = {
        from: parent?.species?.name ?? null,
        to: item.evolves_to.map((next) => ({
            name: next.species.name,
            methods: next.evolution_details
                .map(transformDetails)
                .filter(filterDetails),
        })),
    };

    return acc;
}

function filterDetails(method, _, methods) {
    return Object.keys(method.conditions).length > 0 || methods.length < 2;
}

function transformDetails(details) {
    return {
        trigger: details.trigger.name,
        conditions: Object.fromEntries(
            Object.entries({
                gender: details.gender,
                heldItem: details.held_item?.name ?? null,
                item: details.item?.name ?? null,
                move: details.move?.name ?? null,
                moveType: details.move_type?.name ?? null,
                location: details.location?.name ? details.location.name : null,
                minAffection: details.min_affection,
                minBeauty: details.min_beauty,
                minHappiness: details.min_happiness,
                minLevel: details.min_level,
                needsOverworldRain: details.needs_overworld_rain ?? false,
                partySpecies: details.party_species?.name ?? null,
                partyType: details.party_type?.name ?? null,
                relativePhysicalStats: details.relative_physical_stats,
                timeOfDay: details.time_of_day || null,
                tradeSpecies: details.trade_species?.name ?? null,
                turnUpsideDown: details.turn_upside_down,
            }).filter((entry) => entry[1])
        ),
    };
}
