const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users', ()=>{
    describe('UC-201 add user /api/user', ()=>{
        beforeEach((done)=>{
            database = [];
            done();
        })

        it('When a user is added with no unique email an error should be returned', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                //firstname ontbreekt
                lastName: "Pulles",
                email: "dennispulles@hotmail.com",
                password: "secret"
            })
            .end((err, res)=>{
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(406)
                result.should.be.an('string').that.equals('AssertionError [ERR_ASSERTION]: firstName must be a string!')
                done();
            })
        })
    })
})