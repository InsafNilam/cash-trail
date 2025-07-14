export const Currencies = [
    {
        value: "USD",
        label: "US Dollar (USD)",
    },
    {
        value: "EUR",
        label: "Euro (EUR)",
        locale: "de-DE",
    },
    {
        value: "GBP",
        label: "British Pound (GBP)",
        locale: "en-GB",
    },
    {
        value: "JPY",
        label: "Japanese Yen (JPY)",
        locale: "ja-JP",
    },
    {
        value: "AUD",
        label: "Australian Dollar (AUD)",
        locale:"en-AU",
    },
    {
        value: "CAD",
        label: "Canadian Dollar (CAD)",
        locale: "en-CA",
    },
    {
        value: "CHF",
        label: "Swiss Franc (CHF)",
        locale: "de-CH",
    },
]

export type Currency = (typeof Currencies)[number]