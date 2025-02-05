require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json()); // Middleware to parse JSON bodies

const posts = [
    {
        username: 'cob',
        content: 'This is the first post'
    },
    {
        username: 'phil',
        content: 'This is the second post'
    }
];

app.get('/posts', authToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name));
});

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});