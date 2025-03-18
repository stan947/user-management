const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
 
const app = express();
const PORT = 3000;
 
// Middleware
app.use(cors());
app.use(bodyParser.json());
 
// In-Memory User Data (Stores registered users)
let users = [];
let loggedInUser = null; // Stores currently logged-in user session
 
// Register User
app.post("/register",
    [
        body("username").trim().escape().not().isEmpty().matches(/^[a-zA-Z0-9_-]+$/).withMessage("Invalid username"),
        body("fullName").trim().escape().not().isEmpty(),
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 })
], 
(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Invalid input" });
    }
        

    const { username, password, fullName, email } = req.body;
 
    // Validate input
    if (!username || !password || !fullName || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }
 
    // Check if user already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
    }
 
    // Create new user
    const newUser = { username, password, fullName, email };
    users.push(newUser);
 
    res.status(201).json({ message: "User registered successfully", user: { username, fullName, email } });
});
 
// Login User
app.post("/login", (req, res) => {
    const { username, password } = req.body;
 
    // Find user
    const user = users.find(user => user.username === username && user.password === password);
 
    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
    }
 
    // Store logged-in user session
    loggedInUser = user;
    res.json({ message: "Login successful", user: { username: user.username, fullName: user.fullName, email: user.email } });
});
 
// Get User Details by Username
app.get("/user/:username", (req, res) => {
    const { username } = req.params;
 
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
 
    res.json({ username: user.username, fullName: user.fullName, email: user.email });
});
 
// Get All Users
app.get("/users", (req, res) => {
    res.json(users.map(({ password, ...user }) => user)); // Excluding password from response
});
 
// Delete User by Username
app.delete("/delete-user/:username", (req, res) => {
    const { username } = req.params;
 
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
 
    users.splice(userIndex, 1);
    res.json({ message: `User ${username} deleted successfully` });
});
 
// Logout User
app.post("/logout", (req, res) => {
    loggedInUser = null;
    res.json({ message: "Logged out successfully" });
});
 
// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = {app, server};