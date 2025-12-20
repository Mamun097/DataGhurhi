import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Login from "./AccountManagement/login";
import Register from "./AccountManagement/registernew";
import Home from "./Homepage/landingpage";
import Dashboard from "./ProfileManagement/Dashboard";
import AddProject from "./ProjectManagement/createProject";
import Index from "./SurveyTemplate/Components/Index";
import IndexUser from "./SurveyTemplateUser/Components/IndexUser";
import ResponseIndex from "./SurveyUserResponse/Components/ResponseIndex";
import SurveyResponses from "./SurveyTemplate/Components/SurveyResponses";
//import PreviewPage from "./SurveyTemplate/SurveyTemplatePreview/PreviewPage";
import PreviewPage from "./SurveyTemplate/Components/Preview/Components/IndexUser";
import QB from "./QBmanagement/QuestionBankUser";
import FaqTopics from "./FAQ/faqTopics";
import FaqByTopic from "./FAQ/faqByTopic";
import SearchResults from "./Homepage/searchResults";
import StatisticalAnalysisTool from "./StatisticalTool/StatisticalAnalysisTool";
import AboutPage from "./About/AboutPage";
import PreprocessDataPage from "./StatisticalTool/PreprocessDataPage";
import Layout from "./Layout";
import SurveySuccess from "./SurveyTemplateUser/Components/SurveySuccess";
import GroupPreviewPage from "./StatisticalTool/GroupPreviewPage";
import ForgotPassword from "./AccountManagement/forgotPassword";
import ReportViewer from "./StatisticalTool/ReportViewer";
import Data_summary from "./StatisticalTool/visualization";
import EditProfile from "./ProfileManagement/EditProfile";
import SecuritySettings from "./ProfileManagement/SecuritySettings";
import SubscriptionPage from "./ProfileManagement/SubscriptionPage";
import FileExplorer from "./StatisticalTool/FolderView";
import LandingLogin from "./Homepage/landinglogin";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}

          <Route path="/signup" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<FaqTopics />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq/:topic" element={<FaqByTopic />} />
          {/* <Route
            path="/view-project/:projectId/:privacy"
            element={<EditProject />}
          /> */}
          <Route path="/search-results" element={<SearchResults />} />
          {/* <Route path="/surveytemplate" element={<Index />} /> */}

          <Route path="/v/:slug" element={<IndexUser />} />
          <Route path="/survey-success" element={<SurveySuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 
              User Response View Route; It shouldn't be in public routes. 
              It should be protected. Will be fixed later 
          */}
          <Route path="/user-response-view" element={<ResponseIndex />} />

          {/* Protected Routes */}
          {token && role == "user" ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/addproject" element={<AddProject />} />
              
              {/* <Route
                path="/view-project/:projectId"
                element={<EditProject />}
              /> */}

              <Route path="/view-survey/:survey_id" element={<Index />} />
              <Route path="/v/:slug" element={<IndexUser />} />
              {/* <Route path="/user-response-view" element={<ResponseIndex />} /> */}
              <Route path="/preview" element={<IndexUser />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/security-settings" element={<SecuritySettings />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              {/* <Route path="/question-bank" element={<QB />} /> */}
              <Route path="/analysis" element={<StatisticalAnalysisTool />} />
              <Route path="/preprocess" element={<PreprocessDataPage />} />
              <Route path="/visualization" element={<Data_summary />} />
              <Route path="/saved-files" element={<FileExplorer />} />

              <Route
                path="/survey-responses/:survey_id"
                element={<SurveyResponses />}
              />

              <Route path="/group-preview" element={<GroupPreviewPage />} />

              <Route path="/report" element={<ReportViewer />} />
            </>
          ) : (
            <>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/home" element={<LandingLogin  />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/" element={<LandingLogin />} />
            </>
          )}

          {/* Catch-All Route (404 Page) */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;