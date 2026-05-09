import { describe, it, expect } from 'vitest';
import { isShopLikelyOpen } from '../../src/lib/shop-hours.js';
import type { Shop } from '../../src/lib/types.js';

function makeShop(overrides: Partial<Shop> = {}): Shop {
    return {
        id: 1,
        name: 'テスト店',
        lat: 35.0,
        lng: 139.0,
        address: '',
        nearest_station: null,
        category: 'jiro',
        business_hours: null,
        closed_days: null,
        queue_notes: null,
        topping_notes: null,
        shop_notes: null,
        distance_m: 100,
        status: null,
        ...overrides
    };
}

function makeDate(hour: number, minute: number, dayOfWeek: number): Date {
    const d = new Date(2024, 0, 7 + dayOfWeek); // 2024-01-07 は日曜, +1=月曜...
    d.setHours(hour, minute, 0, 0);
    return d;
}

describe('isShopLikelyOpen', () => {
    describe('business_hours が null', () => {
        it('null のとき false を返す', () => {
            const shop = makeShop({ business_hours: null });
            expect(isShopLikelyOpen(shop, makeDate(12, 0, 1))).toBe(false);
        });
    });

    describe('営業時間内・外の判定', () => {
        const shop = makeShop({ business_hours: '11:00-14:00' });

        it('営業時間内（12:00）→ true', () => {
            expect(isShopLikelyOpen(shop, makeDate(12, 0, 1))).toBe(true);
        });

        it('開始時刻ちょうど（11:00）→ true', () => {
            expect(isShopLikelyOpen(shop, makeDate(11, 0, 1))).toBe(true);
        });

        it('終了時刻ちょうど（14:00）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(14, 0, 1))).toBe(false);
        });

        it('営業開始前（10:59）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(10, 59, 1))).toBe(false);
        });

        it('営業終了後（14:01）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(14, 1, 1))).toBe(false);
        });
    });

    describe('複数時間帯（昼夜2部制）', () => {
        const shop = makeShop({ business_hours: '11:00-14:00, 17:00-20:00' });

        it('昼営業中（12:00）→ true', () => {
            expect(isShopLikelyOpen(shop, makeDate(12, 0, 1))).toBe(true);
        });

        it('昼休み（15:00）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(15, 0, 1))).toBe(false);
        });

        it('夜営業中（18:00）→ true', () => {
            expect(isShopLikelyOpen(shop, makeDate(18, 0, 1))).toBe(true);
        });

        it('夜営業終了後（20:00）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(20, 0, 1))).toBe(false);
        });
    });

    describe('25時表記（深夜またぎ）', () => {
        const shop = makeShop({ business_hours: '17:00-25:00' });

        it('17:00 〜 23:59 は営業中', () => {
            expect(isShopLikelyOpen(shop, makeDate(22, 0, 1))).toBe(true);
        });

        it('00:30 は営業中（翌日の0:30）', () => {
            expect(isShopLikelyOpen(shop, makeDate(0, 30, 2))).toBe(true);
        });

        it('01:00 は終了（25:00=01:00 ちょうど）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(1, 0, 2))).toBe(false);
        });

        it('16:59 は開始前 → false', () => {
            expect(isShopLikelyOpen(shop, makeDate(16, 59, 1))).toBe(false);
        });
    });

    describe('定休日の判定', () => {
        const shop = makeShop({ business_hours: '11:00-20:00', closed_days: '月曜日・祝日' });

        it('月曜日（dayOfWeek=1）→ false', () => {
            expect(isShopLikelyOpen(shop, makeDate(12, 0, 1))).toBe(false);
        });

        it('火曜日（dayOfWeek=2）→ true（営業中）', () => {
            expect(isShopLikelyOpen(shop, makeDate(12, 0, 2))).toBe(true);
        });

        it('closed_days が「なし」→ 定休なし', () => {
            const s = makeShop({ business_hours: '11:00-20:00', closed_days: 'なし' });
            expect(isShopLikelyOpen(s, makeDate(12, 0, 1))).toBe(true);
        });
    });

    describe('第N曜日パターン', () => {
        it('第2月曜は毎週定休と誤判定しない（月曜でも true）', () => {
            const shop = makeShop({ business_hours: '11:00-20:00', closed_days: '第2月曜日' });
            expect(isShopLikelyOpen(shop, makeDate(12, 0, 1))).toBe(true);
        });
    });
});
