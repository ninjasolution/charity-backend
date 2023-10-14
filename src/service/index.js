const CryptAPI = require('@cryptapi/api');

class Service {

    constructor() {
        (async () => {
            let address = await this.createWallet("btc", "0x7B7887059860a1A21f3C62542B6CE5c0a23c76d5")
            console.log(address)
        })()
    }

    async createWallet(coin, myAddress, callbackUrl, params, cryptapiParams) {
        const ca = new CryptAPI(coin, myAddress, callbackUrl, params, cryptapiParams)
        const address = await ca.getAddress()
        return address;
    }

}

module.exports = new Service();
