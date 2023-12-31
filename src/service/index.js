const CryptAPI = require('@cryptapi/api');
require('dotenv').config();
const { MailService } = require('@sendgrid/mail');
const resetPasswordEmail = require('../email-templates/resetPasswordEmail');
const verifyAccountEmail = require('../email-templates/verifyAccountEmail');

class Service {

    constructor() {
        this.mailService = new MailService();
        this.mailService.setApiKey(process.env.SEND_GRID_API_KEY);
    }

    async createWallet(coin, myAddress, callbackUrl, params, cryptapiParams) {
        const ca = new CryptAPI(coin, myAddress, callbackUrl, params, cryptapiParams)
        const address = await ca.getAddress()
        return address;
    }

    async verifyAccount(data) {
        const html = new verifyAccountEmail(data.token);

        const from = `${process.env.SEMD_GRID_COMPANY_MAIL}`;

        //convert the email and password to base64 format
        const message = {
            from,
            to: `${data.email}`,
            subject: `Verify Account - SBS`,
            html,
        };

        const status = await this.mailService.send(message).then(res => {
            console.log('^-^Success : ', data.email);
            return 'success';
        }).catch(err => {
            console.log('^-^Error : ', err);
            return 'failed';
        })

        return status;
    }

    async resetPassword(data) {
        const html = resetPasswordEmail(data.code);

        const from = `${process.env.SEMD_GRID_COMPANY_MAIL}`;

        const message = {
            from,
            to: `${data.email}`,
            subject: `Account Recovery - DRE docs`,
            html,
        };
        const status = await this.mailService.send(message).then(res => {
            console.log('^-^Success : ', res);
            return 'success';
        }).catch(err => {
            console.log('^-^Error : ', err);
            return 'failed';
        })

        return status;
    }
}

module.exports = new Service();
