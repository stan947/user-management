const request = require("supertest");
const { app,server } = require("../index"); // Įsitikink, kad eksportuoji Express app iš inddex.js failo

describe("API Integration Tests", () => {
    let testUser = {
        username: "testuser",
        password: "testpassword",
        fullName: "Test User",
        email: "testuser@example.com"
    };
    afterAll(() => {
        server.close(); // Uždaro serverį po visų testų
    });

    it("should register a new user", async () => {
        const res = await request(app).post("/register").send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    it("should not allow duplicate usernames", async () => {
        const res = await request(app).post("/register").send(testUser);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Username already exists");
    });

    it("should login with correct credentials", async () => {
        const res = await request(app).post("/login").send({
            username: testUser.username,
            password: testUser.password
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Login successful");
    });

    it("should not login with incorrect credentials", async () => {
        const res = await request(app).post("/login").send({
            username: "wronguser",
            password: "wrongpassword"
        });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error", "Invalid username or password");
    });

    it("should get user details", async () => {
        const res = await request(app).get(`/user/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("username", testUser.username);
    });

    it("should delete user", async () => {
        const res = await request(app).delete(`/delete-user/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", `User ${testUser.username} deleted successfully`);
    });
});
