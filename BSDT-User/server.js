const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
// loading API documentation
const swaggerDocument = yaml.load('./docs/api-docs.yml');
// serving Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const allowedOrigins = ['https://localhost:5173', 'http://localhost:5173']
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
const profileRouter = require('./route/profile');

const versionHistoryRouter= require('./route/projectversioning');
const surveyversionHistoryRouter= require('./route/surveyversioning');

const question_import_from_question_bank_Router= require('./route/question_import_from_question_bank')

//project
const UserprojectRouter = require('./route/projectviewUser');
const CollaboratorprojectRouter = require('./route/collaboratorView');

//template
const surveyTemplateRouter = require('./route/surveytemplate');

//Automatic Question Tag Generation
const automatic_question_tag= require('./route/automatic_question_tag');
const generate_question_with_llm= require('./route/generatequestionwithllm');
const generateMultipleQuestionsWithLLMRouter = require('./route/generatequestionwithllm');


// saved templates
const createSurveyRouter = require('./route/createsurvey');

// fetch survey for user end
const fetchSurveyUserRouter = require('./route/fetchsurveyuser');

//submit survey
const surveySubmitRouter = require('./route/surveysubmission');

// get csv
const csvgenerationRouter = require('./route/csvgeneration');

const questionBankRouter = require('./route/questionBankView');

//admin routes
const adminRouter = require('./route/adminroute');
//survey collab routes
const surveyCollabRouter = require('./route/surveyCollaborator');
const faqRoutes = require('./route/faqRouter');
const searchRouter = require('./route/searchRouter');

//file upload for analysis
const analysisFileUploadRouter = require('./route/analysisFileUpload');







const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password (not Gmail password)
  },
});

app.post("/api/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your verification code is: ${otp}. Please write this code in the input box to verify your email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});


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
app.use('/api/profile', profileRouter);

app.use('/api', versionHistoryRouter);
app.use('/api', surveyversionHistoryRouter);

app.use('/api', question_import_from_question_bank_Router);

//project
app.use('/api/project', UserprojectRouter);
app.use('/api/collaborator', CollaboratorprojectRouter);

//template
app.use('/api/surveytemplate', surveyTemplateRouter);

//Automatic Question Tag generation
app.use('/api', automatic_question_tag);
app.use('/api/all-tags', automatic_question_tag);

//llm question generation
app.use('/api', generate_question_with_llm);

// saved templates
app.use('/api/get-saved-survey', createSurveyRouter);

// fetch survey for user end
app.use('/api/fetch-survey-user', fetchSurveyUserRouter);


//submit survey
app.use('/api/submit-survey', surveySubmitRouter);

//csv generation
app.use('/api/generatecsv', csvgenerationRouter);



app.use('/api/question-bank', questionBankRouter);

//admin routes
app.use('/api', adminRouter);

// User subscription routes
const userSubscriptionRouter = require('./route/usersubscription');
app.use('/api', userSubscriptionRouter);
// survey collab routes
app.use('/api/survey-collaborator', surveyCollabRouter);

app.use('/api', generateMultipleQuestionsWithLLMRouter);

const paymentRoutes = require('./route/payment');
app.use('/api/payment', paymentRoutes);

// file upload for analysis
app.use('/api', analysisFileUploadRouter);

// app.use('/api/signin', signinRouter);
// Other routes and middleware...


app.use('/api/faq', faqRoutes);
app.use('/api/search', searchRouter);