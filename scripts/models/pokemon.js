import {sortBy} from '../util.js';
import shinyUrls from '../shiny-urls.js';

export function process(data) {
    const {pkmn, species} = data;
    const {front_default, front_shiny, other} = pkmn.sprites;
    const front_artwork = other?.['official-artwork']?.front_default;

    return {
        id: pkmn.id,
        name: pkmn.name,
        order: pkmn.order,
        color: species.color?.name ?? null,
        height: pkmn.height,
        weight: pkmn.weight,
        habitat: species.habitat?.name ?? null,
        baseExp: pkmn.base_experience,
        happiness: species.base_happiness,
        genderRate: species.gender_rate,
        captureRate: species.capture_rate,
        hatchCounter: species.hatch_counter,
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical,
        isDefault: pkmn.is_default,
        isBaby: species.is_baby,
        types: pkmn.types.sort(sortBy('slot')).map(({type}) => type.name),
        generation: species.generation?.name ?? null,
        description:
            species.flavor_text_entries
                .filter((entry) => entry.language.name === 'en')
                .at(-1)?.flavor_text ?? null,
        images: {
            thumbRegular: front_default ?? null,
            thumbShiny: front_shiny ?? null,
            largeRegular: front_artwork ?? null,
            largeShiny: shinyUrls[pkmn.id] ?? null,
        },
        stats: pkmn.stats.map(({stat, effort, base_stat}) => ({
            name: stat.name,
            base: base_stat,
            effort,
        })),
        abilities: pkmn.abilities
            .sort(sortBy('slot'))
            .map(({ability, is_hidden}) => ({
                name: ability.name,
                hidden: is_hidden,
            })),
        moves: pkmn.moves.map(({move, version_group_details}) => ({
            name: move.name,
            versions: version_group_details.map((details) => ({
                version: details.version_group.name,
                method: details.move_learn_method.name,
                level: details.level_learned_at,
            })),
        })),
    };
}
