import {For, onMount, onCleanup} from 'solid-js';
import {state, setState} from '../state.js';
import styles from './style.module.css';
import {Pokemon} from '../pokemon/index.js';

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
        <aside className={styles.container}>
            <For each={state.pokemon.results}>
                {(item) => <Pokemon item={item} />}
            </For>
        </aside>
    );
}
