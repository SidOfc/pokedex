import styles from './style.module.css';
import {SelectedPokemon} from '@components/selected-pokemon';
import {PokemonList} from '@components/pokemon-list';
import {Team} from '@components/team';
import {getSelected} from '@actions/pokemon';
import {gradientStyle} from '@src/util';

export function Application() {
    return (
        <main
            class={styles.application}
            style={getSelected() ? gradientStyle(getSelected()) : null}
        >
            <SelectedPokemon />
            <PokemonList />
            <Team />
        </main>
    );
}
