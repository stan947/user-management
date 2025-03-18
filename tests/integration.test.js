const request = require("supertest");
const { app, server } = require("../index");

describe("User API Integration Tests", () => {
    let testUser = { username: "testuser", password: "password123", fullName: "Test User", email: "test@example.com" };

    afterAll(() => {
        server.close();
    });

    test("Should register a new user", async () => {
        const res = await request(app).post("/register").send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    test("Should not allow duplicate user registration", async () => {
        const res = await request(app).post("/register").send(testUser);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Username already exists");
    });

    test("Should log in the registered user", async () => {
        const res = await request(app).post("/login").send({ username: testUser.username, password: testUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Login successful");
    });

    test("Should fail to log in with incorrect credentials", async () => {
        const res = await request(app).post("/login").send({ username: "wronguser", password: "wrongpass" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error", "Invalid username or password");
    });

    test("Should retrieve user details", async () => {
        const res = await request(app).get(`/user/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("username", testUser.username);
    });

    test("Should get all users without passwords", async () => {
        const res = await request(app).get("/users");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).not.toHaveProperty("password");
    });

    test("Should log out the user", async () => {
        const res = await request(app).post("/logout");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Logged out successfully");
    });
    test("Should not register a user with missing fields", async () => {
        const res = await request(app).post("/register").send({ username: "", password: "", fullName: "", email: "" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid input");

    });


    test("Should delete the user", async () => {
        const res = await request(app).delete(`/delete-user/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", `User ${testUser.username} deleted successfully`);
    });

    test("Should not find deleted user", async () => {
        const res = await request(app).get(`/user/${testUser.username}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User not found");
    });
    test("Should not expose password in user details response", async () => {
        await request(app).post("/register").send(testUser); // Užtikriname, kad vartotojas yra
    
        const res = await request(app).get(`/user/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).not.toHaveProperty("password");
    });
    test("Should prevent SQL injection attempts", async () => {
        const res = await request(app).post("/login").send({ username: "' OR 1=1 --", password: "anything" });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error", "Invalid username or password");
    });
    test("Should prevent XSS attacks in user input", async () => {
        const res = await request(app).post("/register").send({ username: "<script>alert('XSS')</script>", password: "password123", fullName: "Test User", email: "test@example.com" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid input");
    });
    
})
    

