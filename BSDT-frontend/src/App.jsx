import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./AccountManagement/login";
import Register from "./AccountManagement/registernew";
import Home from "./Homepage/landingpage";
import Dashboard from "./ProfileManagement/Dashboard";
import AddProject from "./ProjectManagement/createProject";
import EditProject from "./ProjectManagement/editProject";
import Index from "./SurveyTemplate/Components/Index";
import IndexUser from "./SurveyTemplateUser/Components/IndexUser";
import SurveyResponses from "./SurveyTemplate/Components/SurveyResponses"
import PreviewPage from "./SurveyTemplate/SurveyTemplatePreview/PreviewPage";
import QB from "./QBmanagement/QuestionBankUser";
import FaqTopics from "./FAQ/faqTopics";
import FaqByTopic from "./FAQ/faqByTopic";
import SearchResults from "./Homepage/searchResults";
import StatisticalAnalysisTool from "./StatisticalTool/StatisticalAnalysisTool";
import AboutPage from "./About/AboutPage";
import PreprocessDataPage from "./StatisticalTool/PreprocessDataPage";
import Layout from "./Layout";
import SurveySuccess from "./SurveyTemplateUser/Components/SurveySuccess";
import GroupPreviewPage from "./StatisticalTool/GroupPreviewPage"
import ForgotPassword from "./AccountManagement/forgotPassword";


function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");


  return (
    <Router>
    <Layout>
      <Routes>
        {/* Public Routes */}
   
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/faq" element={<FaqTopics />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq/:topic" element={<FaqByTopic />} />
        <Route path="/view-project/:projectId/:privacy" element={<EditProject />} />
        <Route path="/search-results" element={<SearchResults />} />
        {/* <Route path="/surveytemplate" element={<Index />} /> */}
        <Route path="/v/:slug" element={<IndexUser />} />
        <Route path="/survey-success" element={<SurveySuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        {token && role== "user"? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/addproject" element={<AddProject />} />
            <Route path="/view-project/:projectId" element={<EditProject />} />
            
            <Route path="/view-survey/:survey_id" element={<Index />} />
            <Route path="/v/:slug" element={<IndexUser />} />
            <Route path="/preview" element={<PreviewPage />} />
            {/* <Route path="/question-bank" element={<QB />} /> */}
            <Route path="/analysis" element={<StatisticalAnalysisTool />} />   
            <Route path="/preprocess" element={<PreprocessDataPage />} />
            <Route path="/survey-responses/:survey_id" element={<SurveyResponses />} />
            
            <Route path="/group-preview" element={<GroupPreviewPage />} />

          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        {/* Catch-All Route (404 Page) */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />

       
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;
