<svelte:head>
    <title>二郎の頼み方・ルールガイド | 二郎マップ</title>
    <meta name="description" content="ラーメン二郎の注文方法・トッピングの答え方・マナーをわかりやすく解説。初めての方でも安心。" />
</svelte:head>

<script lang="ts">
    import { JIRO_GUIDE, GUIDE_VERSION } from '$lib/content/jiro-guide.js';
</script>

<div class="guide-page">
    <div class="disclaimer">
        <p class="disclaimer-text">
            ⚠️ この情報はAIが生成した参考情報です（最終更新: {GUIDE_VERSION}）。
            ラーメン二郎および各店舗の公式情報ではありません。
            ルールは店舗によって異なる場合があります。
            最新の情報は各店舗にてご確認ください。
        </p>
    </div>

    <h1 class="page-title">二郎の頼み方ガイド</h1>

    {#each JIRO_GUIDE as section}
        <section class="guide-section">
            <h2 class="section-title">{section.title}</h2>
            {#if section.intro}
                <p class="section-intro">{section.intro}</p>
            {/if}
            <ul class="item-list">
                {#each section.items as item}
                    <li class="item">{item}</li>
                {/each}
            </ul>
            {#if section.tip}
                <p class="tip">💡 {section.tip}</p>
            {/if}
        </section>
    {/each}
</div>

<style>
    .guide-page {
        max-width: 640px;
        margin: 0 auto;
        padding: 0 16px 40px;
    }

    .disclaimer {
        background: #fefce8;
        border: 1px solid #fde047;
        border-radius: 8px;
        padding: 12px 14px;
        margin: 16px 0;
    }

    .disclaimer-text {
        font-size: 12px;
        color: #713f12;
        margin: 0;
        line-height: 1.6;
    }

    .page-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-text, #1f2937);
        margin: 0 0 20px;
    }

    .guide-section {
        margin-bottom: 28px;
    }

    .section-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--color-text, #1f2937);
        margin: 0 0 8px;
        padding-bottom: 6px;
        border-bottom: 2px solid #dc2626;
    }

    .section-intro {
        font-size: 13px;
        color: var(--color-muted, #6b7280);
        margin: 0 0 8px;
        line-height: 1.6;
    }

    .item-list {
        margin: 0;
        padding-left: 18px;
    }

    .item {
        font-size: 13px;
        color: var(--color-text, #1f2937);
        line-height: 1.7;
        margin-bottom: 2px;
    }

    .tip {
        font-size: 12px;
        color: #065f46;
        background: #ecfdf5;
        border-radius: 6px;
        padding: 8px 12px;
        margin: 8px 0 0;
    }
</style>
