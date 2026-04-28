/**
 * Handles subtle 2D UI animations and hover effects.
 */

export class LabelSystem {
    constructor() {
        this.labels = document.querySelectorAll('.label, .label-primary');
        this.stats = document.querySelectorAll('.label-stats');
    }

    update(time) {
        this.labels.forEach((label, i) => {
            const offset = Math.sin(time * 0.5 + i) * 8;
            label.style.transform = `translateY(${offset}px)`;
        });

        // Live firing rate randomizer for "X.XX" effect
        if (Math.random() > 0.95) {
            this.stats.forEach(stat => {
                const parts = stat.innerText.split('firing ');
                if (parts.length > 1) {
                    const base = parseFloat(parts[1]);
                    const newVal = (base + (Math.random() - 0.5) * 0.05).toFixed(2);
                    stat.innerText = `${parts[0]}firing ${newVal}`;
                }
            });
        }
    }
}
