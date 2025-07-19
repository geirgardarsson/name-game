// components/ScoreColor.ts
export default function getScoreColor(score: number): string {
    if (score === 100) return "text-emerald-900";
    if (score >= 80) return "text-emerald-700";
    if (score >= 70) return "text-emerald-600";
    if (score >= 60) return "text-emerald-500";
    if (score >= 50) return "text-emerald-400";
    if (score >= 40) return "text-yellow-600";
    if (score >= 30) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
}
