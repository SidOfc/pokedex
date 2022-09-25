import {
    STAT_ORDER,
    STAT_NAMES,
    TYPE_COLORS,
    POKEDEX_COLORS,
} from '@src/constants';

export function pokedexColors(name) {
    return POKEDEX_COLORS[name] ?? {primary: '#000000', accent: '#000000'};
}

export function typeColor(type) {
    return TYPE_COLORS[type] ?? '#000000';
}

export function dig(obj, path) {
    return path.reduce((result, property) => result?.[property], obj);
}

export function gradientStyle(pkmn) {
    return {
        ['--gradient-from']: `var(--type-${pkmn.types.at(0)})`,
        ['--gradient-to']: `var(--type-${pkmn.types.at(-1)})`,
    };
}

export function imageSrc(pkmn, type) {
    return pkmn.images[type];
}

export function displayNumber(pkmn) {
    return pkmn.id.toString().padStart(3, '0');
}

export function displayHeight(pkmn) {
    return `${Math.round(pkmn.details.height * 10)} cm`;
}

export function displayWeight(pkmn) {
    return `${pkmn.details.weight / 10} kg`;
}

export function animateStats(cvs, stats, factor = 0.05) {
    let progress = factor;

    function frame() {
        drawStats(cvs, stats, progress);
        progress += factor;

        if (progress < 1.0) {
            requestAnimationFrame(frame);
        }
    }

    frame();
}

export function drawStats(cvs, stats, progress = 1) {
    const ctx = cvs.getContext('2d');
    const radius = cvs.width / 2;
    const spreadAngle = 360 / stats.length;
    const padding = radius * 0.3;
    const fontSize = Math.floor(padding / 3.7);
    const {round, ceil, sin, cos} = Math;
    const coords = [...stats]
        .sort((a, b) => STAT_ORDER.indexOf(a.name) - STAT_ORDER.indexOf(b.name))
        .map((stat, i) => {
            const angle = spreadAngle * i * (Math.PI / 180);
            const percent = (stat.base / 255) * progress;
            const paddedRadius = radius - padding;

            return {
                label: STAT_NAMES[stat.name],
                value: ceil(stat.base * progress),
                x: round(radius - sin(angle) * paddedRadius),
                y: round(radius - cos(angle) * paddedRadius),
                lx: round(radius - sin(angle) * (radius - padding / 1.5)),
                ly: round(radius - cos(angle) * (radius - padding / 1.5)),
                vx: round(radius - sin(angle) * paddedRadius * percent),
                vy: round(radius - cos(angle) * paddedRadius * percent),
            };
        });

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'lightgray';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.beginPath();

    coords.forEach(({x, y}, index) => {
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.lineTo(coords[0].x, coords[0].y);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';

    coords.forEach(({label, value, x, y, lx, ly}) => {
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.lineTo(x, y);
        ctx.stroke();

        const labelMetrics = ctx.measureText(label);
        const valueMetrics = ctx.measureText(value);
        const offsetY =
            lx === radius ? (ly < radius ? -padding / 4 : padding / 4) : 0;
        const valueY =
            ly < radius ? ly + fontSize * 1.05 : ly - fontSize * 1.05;
        const valueX =
            lx < radius
                ? lx - valueMetrics.width
                : lx === radius
                ? lx - valueMetrics.width / 2
                : lx;
        const labelX =
            lx < radius
                ? lx - labelMetrics.width
                : lx === radius
                ? lx - labelMetrics.width / 2
                : lx;

        ctx.fillStyle = 'black';
        ctx.fillText(label, labelX, offsetY + ly);

        ctx.fillStyle = 'orange';
        ctx.fillText(value, valueX, offsetY + valueY);
    });

    ctx.fillStyle = 'orange';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();

    [...coords, coords[0]].forEach(({vx, vy}, index) => {
        if (index === 0) {
            ctx.moveTo(vx, vy);
        } else {
            ctx.lineTo(vx, vy);
        }
    });

    ctx.fill();
    ctx.globalAlpha = 1;
}
