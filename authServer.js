require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json()); // Middleware to parse JSON bodies

let refreshTokens = [];

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.ACCESS_REFRESH_TOKEN, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    });
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
})

app.post('/login', (req, res) => {
    // Authenticate User

    const username = req.body.username;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const user = { name: username };

    try {
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.ACCESS_REFRESH_TOKEN);
        refreshTokens.push(refreshToken);
        res.json({ 
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate access token' });
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '15s' });
}

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});