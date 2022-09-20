import styles from './style.module.css';

export function Pokemon(props) {
    return (
        <div class={styles.container} title={props.item.name}>
            <div class={styles.thumbnailContainer}>
                <img loading="lazy" src={props.item.images.thumbRegular} />
            </div>
            <div class={styles.identifier}>
                {props.item.id.toString().padStart(3, '0')}
            </div>
        </div>
    );
}
