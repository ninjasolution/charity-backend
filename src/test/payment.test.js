const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);

describe('Payment Controller', () => {
  describe('/POST payWithStripe', () => {
    it('it should POST a payment with Stripe', (done) => {
      let payment = {
        amount: 1000,
        currency: 'usd',
        source: 'tok_visa',
      }
      chai.request(server)
        .post('/payWithStripe')
        .send(payment)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('amount');
          res.body.should.have.property('currency');
          done();
        });
    });
  });

  describe('/POST payWithPaypal', () => {
    it('it should POST a payment with Paypal', (done) => {
      let payment = {
        total: '25.00',
      }
      chai.request(server)
        .post('/payWithPaypal')
        .send(payment)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('approval_url');
          done();
        });
    });
  });

  describe('/GET confirmPaypalPayment', () => {
    it('it should GET a confirmation of Paypal payment', (done) => {
      chai.request(server)
        .get('/confirmPaypalPayment')
        .query({PayerID: 'payer_id', paymentId: 'payment_id'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('transactions');
          done();
        });
    });
  });
});