/**
 * Mapping from numeric wait level to human-readable Japanese label.
 */
export const WAIT_LEVEL_LABELS: Record<number, string> = {
	0: '並びなし',
	1: '1〜5人',
	2: '6〜10人',
	3: '11人以上',
	4: '麺切れ/臨時休業'
};

/**
 * Get label for a wait level. Returns null if level is invalid.
 */
export function getWaitLevelLabel(level: number | null | undefined): string | null {
	if (level === null || level === undefined) return null;
	return WAIT_LEVEL_LABELS[level] ?? null;
}
