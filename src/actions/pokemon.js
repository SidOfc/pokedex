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
    const {results, evolutions} = await list();
    const index = results.findIndex((pkmn) => pkmn.id === id);

    if (index === -1) {
        setState('pokemon', 'selectedIndex', null);

        return null;
    }

    if (results[index].details === undefined) {
        const response = await fetch(`/api/pokemon/${id}.json`);
        const result = await response.json();

        Object.assign(result, {chain: getChain(result.name)});

        setState('pokemon', 'results', index, 'details', result);
    }

    setState('pokemon', 'selectedIndex', index);

    return results[index];
}

export function findPokemon(attributes) {
    const entries = Object.entries(attributes);

    return state.pokemon.results.find((pkmn) =>
        entries.every(([attr, value]) => pkmn[attr] === value)
    );
}

export function getUnevolved(name) {
    const chain = getChain(name);

    return chain?.from ? getUnevolved(chain.from) : findPokemon({name});
}

export function getChain(name) {
    return state.pokemon.evolutions[name] ?? {from: null, to: []};
}

export function getSelected() {
    return state.pokemon.results[state.pokemon.selectedIndex];
}
