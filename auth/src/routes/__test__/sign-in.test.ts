// Imports and Package Declarations
import request from "supertest";
import app from "../../app";


// Tests
it('should fail when a non-existing email is supplied', async() => {

    return request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(400)

})

it('should fail when incorrect password is supplied', async() => {

    await request(app)
    .post('/api/users/signup')
    .send({
        email: "test@test.com",
        password: "password"
    })
    .expect(201)

    return request(app)
    .post('/api/users/signin')
    .send({
        email:'test@test.com',
        password: "passwod"
    })
    .expect(400)

})

it('should return a 200 on successful sign in', async() => {

    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201)

    return request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(200);

})

it('should returns with a cookie when given valid credentials', async() => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: "test@test.com",
        password: "password"
    })
    .expect(201)

const response = await  request(app)
    .post('/api/users/signin')
    .send({
        email: "test@test.com",
        password: "password"
    })
    .expect(200);


    expect(response.get('Set-Cookie')).toBeDefined();
})