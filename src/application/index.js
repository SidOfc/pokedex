import styles from './style.module.css';
import {render} from 'solid-js/web';
import {SelectedPokemon} from '../selected-pokemon/index.js';
import {PokemonList} from '../pokemon-list/index.js';
import {Team} from '../team/index.js';

function Application(props) {
    return (
        <main className={styles.application}>
            <SelectedPokemon />
            <PokemonList />
            <Team />
        </main>
    );
}

render(() => <Application />, document.body);
