import {For, Show, createEffect} from 'solid-js';
import styles from './style.module.css';
import {PokemonType} from '@components/pokemon-type';
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
    const index = 156;
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
                <EvolutionLink pokemon={props.pokemon} />
            </div>
        </div>
    );
}

function EvolutionLink(props) {
    const chain = () => state.pokemon.evolutions[props.pokemon.name];
    const findByName = (name) =>
        state.pokemon.results.find((pkmn) => pkmn.name === name);

    return (
        <div class={styles.link}>
            <Show when={props.methods}>
                <div class={styles.linkFrom}>
                    <For each={props.methods}>
                        {(method) => <EvolutionMethod method={method} />}
                    </For>
                </div>
            </Show>
            <img
                class={styles.linkImg}
                src={imageSrc(props.pokemon, 'thumbRegular')}
            />
            <div class={styles.linkTo}>
                <For each={chain()?.to ?? []}>
                    {(item) => (
                        <EvolutionLink
                            pokemon={findByName(item.name)}
                            methods={item.methods}
                        />
                    )}
                </For>
            </div>
        </div>
    );
}

const KEY_LABELS = {
    gender: 'gender',
    heldItem: 'hold',
    item: 'use',
    move: 'move',
    moveType: 'move type',
    location: 'location',
    minAffection: 'affection',
    minBeauty: 'beauty',
    minHappiness: 'happiness',
    minLevel: 'level',
    needsOverworldRain: 'rain',
    partySpecies: 'party',
    partyType: 'party type',
    timeOfDay: 'time',
    tradeSpecies: 'trade',
    turnUpsideDown: 'upside down',
    relativePhysicalStats: 'rel. physical stats',
};

function EvolutionMethod(props) {
    return (
        <div class={styles.method}>
            <div class={styles.methodConditions}>
                <For each={Object.entries(props.method.conditions)}>
                    {([key, value], idx) => (
                        <>
                            {idx() > 0 && (
                                <span class={styles.methodPlus}>+</span>
                            )}
                            <Badge label={KEY_LABELS[key]} value={value} />
                        </>
                    )}
                </For>
            </div>
            <div class={styles.methodName}>{props.method.trigger}</div>
        </div>
    );
}

function Badge(props) {
    return (
        <span class={styles.badge}>
            <span class={styles.badgeKey}>{props.label}</span>
            <span class={styles.badgeValue}>{props.value}</span>
        </span>
    );
}
