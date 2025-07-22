// Utility for generating pastel/strong color pairs based on a string seed
export function getRandomColorPair(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    const pastel = `hsl(${hue}, 80%, 92%)`;
    const strong = `hsl(${hue}, 80%, 35%)`;
    return { pastel, strong };
}
