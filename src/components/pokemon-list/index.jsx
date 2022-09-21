import {For, onMount, createSignal} from 'solid-js';
import styles from './style.module.css';
import {Pokemon} from '@components/pokemon';
import {list} from '@actions/pokemon';
import {state} from '@src/state';

export function PokemonList() {
    const [query, setQuery] = createSignal('');

    onMount(list);

    return (
        <aside class={styles.container}>
            <input
                class={styles.search}
                type="text"
                placeholder="Search..."
                onInput={(e) => setQuery(e.target.value.trim().toLowerCase())}
            />
            <div class={styles.items}>
                <For each={state.pokemon.results}>
                    {(pokemon) => (
                        <Pokemon
                            when={pokemon.name.includes(query())}
                            pokemon={pokemon}
                        />
                    )}
                </For>
            </div>
        </aside>
    );
}
