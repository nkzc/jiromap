import type { Shop } from './types.js';

const CLOSED_DAY_MAP: Array<[string, number]> = [
    ['月', 1], ['火', 2], ['水', 3], ['木', 4], ['金', 5], ['土', 6], ['日', 0]
];

function parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function isWithinBusinessHours(hoursStr: string, nowMinutes: number): boolean {
    return hoursStr.split(/[,、]/).map(s => s.trim()).some(range => {
        const match = range.match(/(\d{1,2}:\d{2})\s*[-~〜]\s*(\d{1,2}:\d{2})/);
        if (!match) return false;
        const start = parseTimeToMinutes(match[1]);
        const end = parseTimeToMinutes(match[2]);
        if (end > 1440) {
            return nowMinutes >= start || nowMinutes < end - 1440;
        }
        if (end <= start) {
            return nowMinutes >= start || nowMinutes < end;
        }
        return nowMinutes >= start && nowMinutes < end;
    });
}

function isClosedToday(closedDaysStr: string, dayOfWeek: number): boolean {
    if (!closedDaysStr || closedDaysStr === 'なし') return false;
    return CLOSED_DAY_MAP.some(([kanji, day]) => {
        if (day !== dayOfWeek) return false;
        if (new RegExp(`第[1-5一二三四五]${kanji}`).test(closedDaysStr)) return false;
        return closedDaysStr.includes(kanji);
    });
}

export function isShopLikelyOpen(shop: Shop, now: Date = new Date()): boolean {
    if (!shop.business_hours) return false;
    const dayOfWeek = now.getDay();
    if (shop.closed_days && isClosedToday(shop.closed_days, dayOfWeek)) return false;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return isWithinBusinessHours(shop.business_hours, nowMinutes);
}
