<script lang="ts">
	import { getWaitLevelColor } from '../colors.js';
	import { WAIT_LEVEL_LABELS } from '../wait-level.js';

	export let level: number | null | undefined = undefined;
	export let label: string | null | undefined = undefined;

	$: color = getWaitLevelColor(level);
	$: displayLabel = label ?? (level !== null && level !== undefined ? WAIT_LEVEL_LABELS[level] : null) ?? '情報なし';
</script>

<span class="badge" style="background-color: {color};">
	{displayLabel}
</span>

<style>
	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 9999px;
		color: #fff;
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}
</style>
