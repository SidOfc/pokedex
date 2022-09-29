import fs from 'fs';
import path from 'path';
import evolutions from '../dist/api/evolution-chain.json' assert {type: 'json'};

const evolutionEntries = Object.entries(evolutions);
const withoutEvolution = evolutionEntries.filter(
    ([, evolve]) => evolve.to.length === 0
);
const output = evolutionEntries.reduce((result, [pokemon, evolve]) => {
    evolve.to
        .map(({methods}) => methods)
        .flat()
        .forEach((method) => {
            const key = [
                method.trigger,
                ...Object.keys(method.conditions).sort(),
            ].join(':');

            result[key] ??= [];
            result[key].push(pokemon);
        });

    return result;
}, {});

console.log('entries:', evolutionEntries.length);
console.log(
    'with evolutions:',
    evolutionEntries.length - withoutEvolution.length
);
console.log('without evolutions:', withoutEvolution.length);
Object.entries(output).forEach(([methodCombo, pokemon]) => {
    console.log(methodCombo, pokemon.length);
});
const groupedEvolutions = Object.values(output).flat();
console.log('grouped evolutions', groupedEvolutions.length);
console.log(
    evolutionEntries
        .filter(([, pokemon]) => pokemon.to.length > 0)
        .map(([name]) => name)
        .filter((name) => !groupedEvolutions.includes(name))
);
