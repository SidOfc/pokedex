import styles from './style.module.css';
import {SelectedPokemon} from '@components/selected-pokemon';
import {PokemonList} from '@components/pokemon-list';
import {Team} from '@components/team';

export function Application() {
    return (
        <main class={styles.application}>
            <SelectedPokemon />
            <PokemonList />
            <Team />
        </main>
    );
}
