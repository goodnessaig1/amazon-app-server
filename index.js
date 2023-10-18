const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./models/user');
const Order = require('./models/order');
const app = express();
const port = 8200;
const cors = require('cors');
app.use(cors());
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});
mongoose
  .connect(
    'mongodb+srv://goodnessaig:osemudiame12@cluster0.aarpdwr.mongodb.net/',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.log(err);
    console.log('Error connecting to MongoDB');
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const sendVerificationEmail = async (email, verificationToken) => {
  //Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'goodness6337@gmail.com',
      pass: 'xpqxahgsviyymzkf',
    },
  });
  const mailOptions = {
    from: 'amazon.com',
    to: email,
    subject: 'Email Vefification',
    text: `Please click the following link to verify your email : http://localhost:8080/verify/${verificationToken} `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Error sending verification email', error);
  }
};

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const newUser = new User({ name, email, password });
    newUser.verificationToken = crypto.randomBytes(20).toString('hex');
    await newUser.save();
    sendVerificationEmail(newUser.email, newUser.verificationToken);
  } catch (error) {
    console.log('Error registering user', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

//endpoint to verify the email
app.get('/verify:token', async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({ message: 'Email Verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification vailed' });
  }
});
app.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json({ status: 'Success', message: 'Get successful', users });
  } catch (error) {
    res.status(500).json({ message: 'An error occured' });
  }
});
