// Wait level color definitions for 二郎マップ

export const WAIT_LEVEL_COLORS: Record<number | 'null', string> = {
	0: '#22c55e', // 緑（並びなし）
	1: '#84cc16', // 黄緑（1〜5人）
	2: '#eab308', // 黄（6〜10人）
	3: '#f97316', // 橙（11人以上）
	4: '#ef4444', // 赤（麺切れ/臨時休業）
	null: '#64748b' // スレート（情報なし）
};

export function getWaitLevelColor(level: number | null | undefined): string {
	if (level === null || level === undefined) return WAIT_LEVEL_COLORS['null'];
	return WAIT_LEVEL_COLORS[level] ?? WAIT_LEVEL_COLORS['null'];
}
