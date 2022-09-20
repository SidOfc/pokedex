import styles from './style.module.css';
import {SelectedPokemon} from '@components/selected-pokemon';
import {PokemonList} from '@components/pokemon-list';
import {Team} from '@components/team';

export function Application(props) {
    return (
        <main className={styles.application}>
            <SelectedPokemon />
            <PokemonList />
            <Team />
        </main>
    );
}
