import { Currencies } from "./currencies";

export function DateToUTCDate(date: Date){
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds(),
        )
    )
}

export function GetFormatterForCurrency(currency: string) {
    const locale = Currencies.find(c => c.value === currency)?.locale || 'en-US';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}