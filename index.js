const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
 
const app = express();
const PORT = 3000;
 
// Middleware
app.use(cors());
app.use(bodyParser.json());
 
// In-Memory User Data (Stores registered users)
let users = [];
let loggedInUser = null; // Stores currently logged-in user session
 
// Register User
app.post("/register", (req, res) => {
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
 
// Get User Details (Only if logged in)
app.get("/user", (req, res) => {
    if (!loggedInUser) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
 
    res.json({ username: loggedInUser.username, fullName: loggedInUser.fullName, email: loggedInUser.email });
});
 
// Logout User
app.post("/logout", (req, res) => {
    loggedInUser = null;
    res.json({ message: "Logged out successfully" });
});
 
// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});