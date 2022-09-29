import {For, Show, createEffect} from 'solid-js';
import styles from './style.module.css';
import {PokemonType} from '@components/pokemon-type';
import {EvolutionChain} from '@components/evolution-chain';
import {select, getSelected} from '@actions/pokemon';
import {state} from '@src/state';
import {
    imageSrc,
    displayNumber,
    displayHeight,
    displayWeight,
    animateStats,
} from '@src/util';

export function SelectedPokemon() {
    const index = 132;
    createEffect(() => {
        if (state.pokemon.results[index]) {
            select(state.pokemon.results[index].id);
        }
    }, [state.pokemon.results[index]]);

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
            <div class={styles.image}>
                <img src={imageSrc(props.pokemon, 'largeRegular')} />
            </div>
            <div class={styles.details}>
                <h1 class={styles.name}>{props.pokemon.name}</h1>
                <p class={styles.description}>
                    {props.pokemon.details.description}
                </p>
                <div class={styles.detailItem}>
                    <div class={styles.detailItemName}>Pokédex No.</div>
                    <div class={styles.detailItemValue}>
                        {displayNumber(props.pokemon, false)}
                    </div>
                </div>
                <div class={styles.detailItem}>
                    <div class={styles.detailItemName}>Type</div>
                    <div class={styles.detailItemTypes}>
                        <For each={props.pokemon.types}>
                            {(type) => <PokemonType type={type} />}
                        </For>
                    </div>
                </div>
                <div class={styles.detailItem}>
                    <div class={styles.detailItemName}>Height</div>
                    <div class={styles.detailItemValue}>
                        {displayHeight(props.pokemon)}
                    </div>
                </div>
                <div class={styles.detailItem}>
                    <div class={styles.detailItemName}>Weight</div>
                    <div class={styles.detailItemValue}>
                        {displayWeight(props.pokemon)}
                    </div>
                </div>
                <div class={styles.stats}>
                    <canvas ref={cvs} width={1000} height={1000} />
                </div>
            </div>
            <div class={styles.chains}>
                <EvolutionChain pokemon={props.pokemon} />
            </div>
        </div>
    );
}
