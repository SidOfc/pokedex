import {For, Show} from 'solid-js';
import styles from './style.module.css';
import {
    findPokemon,
    previousEvolution,
    evolutionMethods,
    select,
} from '@actions/pokemon';
import {imageSrc, cssCustomProperties} from '@src/util';
import {PokemonType} from '@components/pokemon-type';
import {Badge} from '@components/badge';
import {KEY_LABELS} from '@src/constants';

export function EvolutionChain(props) {
    return (
        <div class={styles.chain} style={cssCustomProperties(props.pokemon)}>
            <Origin pokemon={props.pokemon} />
            <Target pokemon={props.pokemon} />
            <Evolutions pokemon={props.pokemon} />
        </div>
    );
}

function Origin(props) {
    const origin = () => previousEvolution(props.pokemon.name);
    const methods = () => evolutionMethods(origin(), props.pokemon.name);

    return (
        <Show when={origin()}>
            <Target pokemon={origin()} />
            <div class={styles.evolution}>
                <div class={styles.evolutionMethods}>
                    <For each={methods()}>
                        {(method) => <EvolutionMethod method={method} />}
                    </For>
                </div>
            </div>
        </Show>
    );
}

function Target(props) {
    return (
        <div
            class={styles.target}
            style={cssCustomProperties(props.pokemon)}
            onClick={() => select(props.pokemon.id)}
        >
            <div class={styles.targetImg}>
                <img src={imageSrc(props.pokemon, 'largeRegular')} />
            </div>
            <div class={styles.targetDetails}>
                <div class={styles.targetName}>{props.pokemon.name}</div>
                <div class={styles.targetTypes}>
                    <For each={props.pokemon.types}>
                        {(type) => <PokemonType small type={type} />}
                    </For>
                </div>
            </div>
        </div>
    );
}

function Evolutions(props) {
    return (
        <Show when={props.pokemon.details.chain.to.length !== 0}>
            <div class={styles.evolutions}>
                <For each={props.pokemon.details.chain.to}>
                    {(item) => (
                        <Evolution
                            pokemon={findPokemon({name: item.name})}
                            methods={item.methods}
                        />
                    )}
                </For>
            </div>
        </Show>
    );
}

function Evolution(props) {
    return (
        <Show when={props.methods.length !== 0}>
            <div class={styles.evolution}>
                <div class={styles.evolutionMethods}>
                    <For each={props.methods}>
                        {(method) => <EvolutionMethod method={method} />}
                    </For>
                </div>
                <Target pokemon={props.pokemon} />
            </div>
        </Show>
    );
}

function EvolutionMethod(props) {
    return (
        <div class={styles.evolutionMethod}>
            <div class={styles.evolutionConditions}>
                <For each={Object.entries(props.method.conditions)}>
                    {([key, value]) => (
                        <Badge label={KEY_LABELS[key]} value={value} />
                    )}
                </For>
            </div>
            <div class={styles.evolutionTrigger}>{props.method.trigger}</div>
        </div>
    );
}
