const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

const registerRouter = require('./route/register');
const loginRouter = require('./route/login');
// // const profile = require('./route/profile');

//connect db
const supabase = require('./db');
require('dotenv').config();
const port = process.env.PORT || 2000;
(async () => {
  const { data, error } = await supabase.rpc('now');
  if (error) {
    console.error('Database connection failed:', error.message);
} else {
    console.log('Database connected successfully:', data);
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

app.use(express.json());
// Routes
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
// app.use('/api/signin', signinRouter);
// Other routes and middleware...


