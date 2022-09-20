import {For, onMount} from 'solid-js';
import styles from './style.module.css';
import {Pokemon} from '@components/pokemon';
import {state, setState} from '@src/state';

async function list() {
    if (state.pokemon.count === 0) {
        const response = await fetch('/api/pokemon.json');
        const results = await response.json();

        setState('pokemon', {count: results.length, results});
    }

    return state.pokemon;
}

export function PokemonList() {
    onMount(list);

    return (
        <aside class={styles.container}>
            <For each={state.pokemon.results}>
                {(item) => <Pokemon item={item} />}
            </For>
        </aside>
    );
}
