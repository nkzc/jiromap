<script lang="ts">
	import { postReport } from '../api.js';
	import { WAIT_LEVEL_LABELS } from '../wait-level.js';
	import { getWaitLevelColor } from '../colors.js';

	export let shopId: number;
	export let shopName: string;
	export let onClose: () => void = () => {};
	export let onSuccess: () => void = () => {};

	const WAIT_LEVELS = [0, 1, 2, 3, 4] as const;

	let selectedLevel: number | null = null;
	let comment = '';
	let submitting = false;
	let error = '';
	let success = false;

	async function handleSubmit() {
		if (selectedLevel === null) {
			error = '並び状況を選択してください';
			return;
		}
		submitting = true;
		error = '';
		try {
			const result = await postReport(shopId, selectedLevel, comment || undefined);
			if (result.ok) {
				success = true;
				onSuccess();
				setTimeout(() => {
					onClose();
				}, 1500);
			} else if (result.status === 429) {
				const data = result.data as { error?: string; next_allowed_at?: string; retry_after?: number };
				if (data.error === 'DUPLICATE_REPORT' && data.next_allowed_at) {
					const nextTime = new Date(data.next_allowed_at).toLocaleTimeString('ja-JP', {
						hour: '2-digit',
						minute: '2-digit'
					});
					error = `${nextTime}以降に再投稿できます`;
				} else if (data.retry_after) {
					error = `${data.retry_after}秒後に再投稿できます`;
				} else {
					error = '投稿制限に達しました。しばらく後に再試行してください';
				}
			} else {
				error = '投稿に失敗しました。もう一度お試しください';
			}
		} catch {
			error = 'ネットワークエラーが発生しました';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="report-form">
	<div class="form-header">
		<h2 class="form-title">{shopName}</h2>
		<button class="close-btn" on:click={onClose} aria-label="閉じる">&times;</button>
	</div>
	<p class="form-subtitle">今の並びを教えてください</p>

	{#if success}
		<div class="success-message">投稿ありがとうございます！</div>
	{:else}
		<div class="level-buttons">
			{#each WAIT_LEVELS as level}
				<button
					class="level-btn"
					class:selected={selectedLevel === level}
					style="--level-color: {getWaitLevelColor(level)};"
					on:click={() => (selectedLevel = level)}
				>
					{WAIT_LEVEL_LABELS[level]}
				</button>
			{/each}
		</div>

		<div class="comment-section">
			<label for="comment" class="comment-label">コメント（任意）</label>
			<textarea
				id="comment"
				class="comment-input"
				bind:value={comment}
				placeholder="例: 回転早め、ニンニクコール多め"
				maxlength="140"
				rows="3"
			></textarea>
		</div>

		{#if error}
			<p class="error-message">{error}</p>
		{/if}

		<button
			class="submit-btn"
			on:click={handleSubmit}
			disabled={submitting || selectedLevel === null}
		>
			{submitting ? '送信中...' : '投稿する'}
		</button>
	{/if}
</div>

<style>
	.report-form {
		background: var(--color-bg, #fff);
		border-radius: 12px;
		padding: 20px;
		width: 100%;
		max-width: 400px;
		box-sizing: border-box;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.form-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
		color: var(--color-muted, #6b7280);
		padding: 0 4px;
		min-height: 44px;
		min-width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.form-subtitle {
		font-size: 14px;
		color: var(--color-muted, #6b7280);
		margin: 0 0 16px;
	}

	.level-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 16px;
	}

	.level-btn {
		flex: 1 1 calc(50% - 4px);
		min-height: 44px;
		padding: 8px 12px;
		border: 2px solid var(--level-color);
		border-radius: 8px;
		background: #fff;
		color: var(--color-text, #1f2937);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.level-btn.selected {
		background: var(--level-color);
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.level-btn:hover:not(.selected) {
		background: color-mix(in srgb, var(--level-color) 15%, transparent);
	}

	.comment-section {
		margin-bottom: 16px;
	}

	.comment-label {
		display: block;
		font-size: 13px;
		color: var(--color-muted, #6b7280);
		margin-bottom: 6px;
	}

	.comment-input {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		font-size: 14px;
		resize: vertical;
		box-sizing: border-box;
		font-family: inherit;
	}

	.comment-input:focus {
		outline: none;
		border-color: var(--color-primary, #dc2626);
	}

	.error-message {
		color: var(--color-primary, #dc2626);
		font-size: 13px;
		margin: 0 0 12px;
	}

	.submit-btn {
		width: 100%;
		min-height: 44px;
		background: var(--color-primary, #dc2626);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.success-message {
		text-align: center;
		font-size: 16px;
		font-weight: 600;
		color: #22c55e;
		padding: 24px 0;
	}
</style>
