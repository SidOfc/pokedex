import {sortBy} from '../util.js';
import shinyUrls from '../shiny-urls.js';

export function process(data) {
    const {front_default, front_shiny, other} = data.sprites;
    const front_artwork = other?.['official-artwork']?.front_default;

    return {
        id: data.id,
        name: data.name,
        order: data.order,
        height: data.height,
        weight: data.weight,
        baseExp: data.base_experience,
        default: data.is_default,
        versions: data.game_indices.map(({version}) => version.name),
        types: data.types.sort(sortBy('slot')).map(({type}) => type.name),
        images: {
            thumbRegular: front_default ?? null,
            thumbShiny: front_shiny ?? null,
            largeRegular: front_artwork ?? null,
            largeShiny: shinyUrls[data.id] ?? null,
        },
        stats: data.stats.map(({stat, effort, base_stat}) => ({
            name: stat.name,
            base: base_stat,
            effort,
        })),
        abilities: data.abilities
            .sort(sortBy('slot'))
            .map(({ability, is_hidden}) => ({
                name: ability.name,
                hidden: is_hidden,
            })),
        moves: data.moves.map(({move, version_group_details}) => ({
            name: move.name,
            versions: version_group_details.map((details) => ({
                version: details.version_group.name,
                method: details.move_learn_method.name,
                level: details.level_learned_at,
            })),
        })),
    };
}
