const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
// loading API documentation
const swaggerDocument = yaml.load("./docs/api-docs.yml");
// serving Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cookieParser());
app.use(express.json());

const path = require("path");
// const viewRouter = require("./route/view");
// app.use("/", viewRouter);
app.get("/v/:slug", (req, res) => {
  const slug = req.params.slug;
  const url = `https://dataghurhi.cse.buet.ac.bd/v/${slug}`;
  // res.status(200).send(`
  //   View Project Page Redirecting...
  //   <script>
  //     window.location.href = "${url}";
  //   </script>
  // `);
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta property="og:title" content="Dataghurhi" />
  <meta property="og:description" content="Explore the power of data with Dataghurhi." />
  <meta property="og:image" content="https://dataghurhi.cse.buet.ac.bd/assets/logos/dataghurhi.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
</head>
<body>
  <div id="root"></div>
  <script src="/assets/index.js"></script>
</body>
</html>
`);
});

const allowedOrigins = [
  "http://localhost:5173",
  // "http://103.94.135.115:5173",
  // "http://dataghurhi.cse.buet.ac.bd:5173",
  "https://dataghurhi.cse.buet.ac.bd",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);

const registerRouter = require("./route/register");
const loginRouter = require("./route/login");
const profileRouter = require("./route/profile");

const versionHistoryRouter = require("./route/projectversioning");
const surveyversionHistoryRouter = require("./route/surveyversioning");

const question_import_from_question_bank_Router = require("./route/question_import_from_question_bank");

//project
const UserprojectRouter = require("./route/projectviewUser");
const CollaboratorprojectRouter = require("./route/collaboratorView");

//template
const surveyTemplateRouter = require("./route/surveytemplate");

//Automatic Question Tag Generation
const automatic_question_tag = require("./route/automatic_question_tag");
const generate_question_with_llm = require("./route/generatequestionwithllm");
const generateMultipleQuestionsWithLLMRouter = require("./route/generatequestionwithllm");

// saved templates
const createSurveyRouter = require("./route/createsurvey");

// fetch survey for user end
const fetchSurveyUserRouter = require("./route/fetchsurveyuser");

//submit survey
const surveySubmitRouter = require("./route/surveysubmission");

// get csv
const csvgenerationRouter = require("./route/csvgeneration");

const questionBankRouter = require("./route/questionBankView");

//admin routes
const adminRouter = require("./route/adminroute");
//survey collab routes
const surveyCollabRouter = require("./route/surveyCollaborator");
const faqRoutes = require("./route/faqRouter");
const searchRouter = require("./route/searchRouter");

// voucher routes
const voucherRouter = require("./route/voucherroute");
app.use("/api", voucherRouter);

//file upload for analysis
const analysisFileUploadRouter = require("./route/analysisFileUpload");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password (not Gmail password)
  },
});

app.post("/api/send-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Missing fields" });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code – DataGhurhi",
    text: `Dear User,

We received a request to verify your email address for your DataGhurhi account.

Your verification code is: ${otp}

Please enter this code in the verification field to continue. You might have requested this as part of:
- Creating a new account, or
- Resetting your password.

If you did not request this code, please ignore this email.

Best regards,
The DataGhurhi Team
`,
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
const supabase = require("./db");
require("dotenv").config();
const port = process.env.PORT || 2000;
(async () => {
  const { data, error } = await supabase.rpc("now");
  if (error) {
    console.error("Database connection failed:", error.message);
  } else {
    console.log("Database connected successfully:", data);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
})();

// Routes
app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.use("/api/profile", profileRouter);

app.use("/api", versionHistoryRouter);
app.use("/api", surveyversionHistoryRouter);

app.use("/api", question_import_from_question_bank_Router);

//project
app.use("/api/project", UserprojectRouter);
app.use("/api/collaborator", CollaboratorprojectRouter);

//template
app.use("/api/surveytemplate", surveyTemplateRouter);

//Automatic Question Tag generation
app.use("/api", automatic_question_tag);
app.use("/api/all-tags", automatic_question_tag);

//llm question generation
app.use("/api", generate_question_with_llm);

// saved templates
app.use("/api/get-saved-survey", createSurveyRouter);

// fetch survey for user end
app.use("/api/fetch-survey-user", fetchSurveyUserRouter);

//submit survey
app.use("/api/submit-survey", surveySubmitRouter);

//csv generation
app.use("/api/generatecsv", csvgenerationRouter);

app.use("/api/question-bank", questionBankRouter);

//admin routes
app.use("/api", adminRouter);

// User subscription routes
const userSubscriptionRouter = require("./route/usersubscription");
app.use("/api", userSubscriptionRouter);
// survey collab routes
app.use("/api/survey-collaborator", surveyCollabRouter);

app.use("/api", generateMultipleQuestionsWithLLMRouter);

const paymentRoutes = require("./route/payment");
app.use("/api/payment", paymentRoutes);

// file upload for analysis
app.use("/api", analysisFileUploadRouter);

// app.use('/api/signin', signinRouter);
// Other routes and middleware...

app.use("/api/faq", faqRoutes);
app.use("/api/search", searchRouter);

// app.use(express.static("dist"));
// app.get("*", (_, res) => {
//   res.sendFile(path.join(__dirname, "dist/index.html"));
// });
