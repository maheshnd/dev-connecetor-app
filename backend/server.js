const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Initiate middleware

app.use(express.json({ extended: true }));

//Connecting Database
connectDB();

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
