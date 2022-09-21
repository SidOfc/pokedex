import styles from './style.module.css';
import {gradientStyle, imageSrc, displayNumber} from '@src/util';
import {select} from '@actions/pokemon';

export function Pokemon(props) {
    return (
        <div
            classList={{[styles.container]: true, [styles.hidden]: !props.when}}
            title={props.pokemon.name}
            style={gradientStyle(props.pokemon)}
            onClick={() => select(props.pokemon.id)}
        >
            <div class={styles.thumbnailContainer}>
                <img
                    loading="lazy"
                    src={imageSrc(props.pokemon, 'thumbRegular')}
                />
            </div>
            <div class={styles.identifier}>{displayNumber(props.pokemon)}</div>
        </div>
    );
}
