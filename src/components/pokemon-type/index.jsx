import styles from './style.module.css';
import {typeColor} from '@src/util';

export function PokemonType(props) {
    return (
        <span
            style={{['background-color']: typeColor(props.type)}}
            classList={{[styles.type]: true, [styles.small]: props.small}}
        >
            {props.type}
        </span>
    );
}
