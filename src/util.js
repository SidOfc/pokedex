export function gradientStyle(pkmn) {
    return {
        ['--gradient-from']: `var(--type-${pkmn.types.at(0)})`,
        ['--gradient-to']: `var(--type-${pkmn.types.at(-1)})`,
    };
}

export function imageSrc(pkmn, type) {
    return pkmn.images[type];
}

export function displayNumber(pkmn) {
    return `#${pkmn.id.toString().padStart(3, '0')}`;
}
