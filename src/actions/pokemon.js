import {state, setState} from '@src/state';

export async function list() {
    if (state.pokemon.count === 0) {
        const response = await fetch('/api/pokemon.json');
        const results = await response.json();

        setState('pokemon', {count: results.length, results});
    }

    return state.pokemon;
}

export async function select(id) {
    const index = (await list()).results.findIndex((pkmn) => pkmn.id === id);

    if (index === -1) {
        setState('pokemon', 'selectedIndex', null);

        return null;
    }

    if (state.pokemon.results[index].details === undefined) {
        const response = await fetch(`/api/pokemon/${id}.json`);
        const result = await response.json();

        setState('pokemon', 'results', index, 'details', result);
    }

    setState('pokemon', 'selectedIndex', index);

    return state.pokemon.results[state.pokemon.selectedIndex];
}

export function getSelected() {
    return state.pokemon.results[state.pokemon.selectedIndex];
}
