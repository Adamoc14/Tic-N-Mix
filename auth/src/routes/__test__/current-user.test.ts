// Imports and Package Declarations
import request from "supertest";
import app from "../../app";

// Tests
it('should return null as current user when not signed in', async() => {

    const response = await request(app)
    .get('/api/users/currentuser')
    .expect(200)

    expect(response.body.currentUser).toEqual(null)
})

it('should return current user when signed in', async() => {
    const cookie = await signUp();

    const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .expect(200)

    expect(response.body.currentUser.email).toEqual('test@test.com')


})

it('should return response object with emitted details', async() => {
    const cookie = await signUp();

    const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .expect(200)

    expect(response.body.currentUser.password).toBeUndefined();
    expect(response.body.currentUser.__v).toBeUndefined();
})

it('should return response object with changed id property', async() => {
    const cookie = await signUp();

    const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .expect(200)

    expect(response.body.currentUser._id).toBeUndefined();
    expect(response.body.currentUser.id).toBeDefined();
})