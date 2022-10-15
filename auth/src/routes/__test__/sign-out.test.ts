// Imports and Package Declarations
import request from "supertest";
import app from "../../app";

it('should return a {} on succesful signout', async() => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: "test@test.com",
        password: "password"
    })
    .expect(201)

    const response = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);

    expect(response.body).toEqual({});

});

it('should remove a cookie after successful signout', async() => {

    await request(app)
    .post('/api/users/signup')
    .send({
        email: "test@test.com",
        password: "password"
    })
    .expect(201)

    const response = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);

    // console.log(response.get('Set-Cookie'));
    expect(response.get('Set-Cookie')[0]).toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly')
});