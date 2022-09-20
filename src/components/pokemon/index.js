import styles from './style.module.css';

export function Pokemon({item}) {
    return (
        <div className={styles.container} title={item.name}>
            <div className={styles.thumbnailContainer}>
                <img loading="lazy" src={item.images.thumbRegular} />
            </div>
            <div className={styles.identifier}>
                {item.id.toString().padStart(3, '0')}
            </div>
        </div>
    );
}
