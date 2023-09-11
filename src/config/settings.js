module.exports = { 
    secret: "tradly-secret-key",
    packages: {
        "0": {
            min: 0,
            max: 10000,
            priceUSD: 10000,
            depositAmountUSD: 7500,
            fee: 2500
        },
        "1": {
            min: 10000,
            max: 15000,
            priceUSD: 15000,
            depositAmountUSD: 11500,
            fee: 3500
        },
        "2": {
            min: 15000,
            max: 50000,
            priceUSD: 50000,
            depositAmountUSD: 44000,
            fee: 6000
        },
    },
    paymentExpire: 1000 * 60 * 30
}