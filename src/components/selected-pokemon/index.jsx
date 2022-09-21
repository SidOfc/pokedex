import {Show, createEffect} from 'solid-js';
import styles from './style.module.css';
import {animateStats} from './util';
import {state} from '@src/state';
import {imageSrc, displayNumber} from '@src/util';
import {select, getSelected} from '@actions/pokemon';

export function SelectedPokemon() {
    createEffect(() => {
        if (state.pokemon.results[0]) {
            select(state.pokemon.results[0].id);
        }
    }, [state.pokemon.results[0]]);

    return (
        <section class={styles.container}>
            <Show when={getSelected()}>
                <SelectedPokemonScreen pokemon={getSelected()} />
            </Show>
        </section>
    );
}

function SelectedPokemonScreen(props) {
    let cvs;

    createEffect(() => animateStats(cvs, props.pokemon.details.stats));
    createEffect(() => console.log(props.pokemon));

    return (
        <div class={styles.screen}>
            <h1 class={styles.name}>
                {displayNumber(props.pokemon)} - {props.pokemon.name}
            </h1>
            <div class={styles.image}>
                <img src={imageSrc(props.pokemon, 'largeRegular')} />
            </div>
            <div class={styles.stats}>
                <canvas ref={cvs} width={1000} height={1000} />
            </div>
        </div>
    );
}
