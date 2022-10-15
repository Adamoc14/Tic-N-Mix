// Imports and Package Declarations
import request from "supertest";
import app from "../../app";


// Tests
it('should return a 201 on successful signup', async() => {

    const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: "password"
            })
            .expect(201)
    
    console.log(response.body);

});

it('should return a 400 with invalid email', async() => {

    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test",
            password: "password"
        })
        .expect(400);

});


it('should return a 400 with invalid password', async() => {

    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "pas"
        })
        .expect(400);

});

it('should return a 400 with missing email and password', async() => {

    await request(app)
        .post('/api/users/signup')
        .send({
            email: "",
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            password: ""
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: "",
            password: ""
        })
        .expect(400);

});

it('should disallow duplicate emails', async() => {

    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        })
        .expect(400);

});

it('should set a cookie after successful signup', async() => {

    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email: "test@test.com",
        password: "password"
    })
    .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();

});