import styles from './style.module.css';

export function PokemonType(props) {
    return (
        <span
            style={{['--color']: `var(--type-${props.type})`}}
            class={styles.type}
        >
            {props.type}
        </span>
    );
}
