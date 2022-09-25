import {state, setState} from '@src/state';

export async function list() {
    if (state.pokemon.count === 0) {
        const [results, evolutions] = await Promise.all(
            [
                fetch('/api/pokemon.json'),
                fetch('/api/evolution-chain.json'),
            ].map((request) => request.then((response) => response.json()))
        );

        setState('pokemon', {count: results.length, results, evolutions});
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
        const chain = state.pokemon.evolutions[result.name] ?? null;
        console.log({chain});
        Object.assign(result, {chain});

        setState('pokemon', 'results', index, 'details', result);
    }

    setState('pokemon', 'selectedIndex', index);

    return state.pokemon.results[state.pokemon.selectedIndex];
}

export function getSelected() {
    return state.pokemon.results[state.pokemon.selectedIndex];
}
