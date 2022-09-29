import styles from './style.module.css';

export function Badge(props) {
    return (
        <span class={styles.container}>
            <span class={styles.label}>{props.label}</span>
            <span class={styles.value}>{props.value}</span>
        </span>
    );
}
