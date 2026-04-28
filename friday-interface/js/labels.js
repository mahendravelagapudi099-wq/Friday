import { seededRandom } from './utils.js';

export class LabelSystem {
    constructor() {
        this.labels = document.querySelectorAll('.label, .label-primary');
        this.stats = document.querySelectorAll('.label-stats');
    }

    update(time, cameraDist = 45) {
        // Calculate scale based on distance - more generous scale for readability
        const labelScale = Math.max(0.8, Math.min(1.5, 2.8 - (cameraDist / 35)));

        this.labels.forEach((label, i) => {
            const offset = Math.sin(time * 0.5 + i) * 8;
            // Combine scale and translateY
            label.style.transform = `translateY(${offset}px) scale(${labelScale})`;
        });

        // Live firing rate randomizer for "X.XX" effect - now deterministic
        if (seededRandom() > 0.95) {
            this.stats.forEach(stat => {
                const parts = stat.innerText.split('firing ');
                if (parts.length > 1) {
                    const base = parseFloat(parts[1]);
                    const newVal = (base + (seededRandom() - 0.5) * 0.05).toFixed(2);
                    stat.innerText = `${parts[0]}firing ${newVal}`;
                }
            });
        }
    }
}
