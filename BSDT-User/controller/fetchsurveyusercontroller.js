const supabase = require("../db");
const { jwtAuthMiddleware } = require("../auth/authmiddleware");

exports.fetchSurveyUser = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.jwt?.id; // Get user ID from optional JWT

    const { data: survey, error: surveyError } = await supabase
      .from("survey")
      .select(
        "survey_id, title, template, banner, response_user_logged_in_status, shuffle_questions"
      )
      .eq("survey_link", slug)
      .single();

    if (surveyError || !survey) {
      return res.status(404).json({
        status: "NOT_FOUND",
        message: "This survey does not exist.",
      });
    }
    console.log("Survey fetched:", survey);
    if (survey.response_user_logged_in_status === true) {
      if (!userId) {
        return res.status(401).json({
          status: "LOGIN_REQUIRED",
          message: "You must be logged in to access this survey.",
        });
      } else {
        // Checking if the user has already submitted a response
        const { data: existingResponse, error: responseError } = await supabase
          .from("response")
          .select("response_id")
          .eq("survey_id", survey.survey_id)
          .eq("user_id", userId)
          .single();
        console.log("Existing response check:", existingResponse, responseError);
        if (responseError && responseError.code !== "PGRST116") {
          // An error other than "no rows found" occurred
          return res.status(500).json({
            status: "ERROR",
            message: "An internal server error occurred.",
          });
        }

        if (existingResponse) {
          return res.status(403).json({
            status: "ALREADY_SUBMITTED",
            message: "You have already submitted a response for this survey.",
          });
        }
      }

      return res.status(200).json({ status: "SUCCESS", data: survey });
    } else {
      return res.status(200).json({ status: "SUCCESS", data: survey });
    }
  } catch (err) {
    console.error("Error in fetchSurveyAccessDetails:", err.message);
    return res.status(500).json({
      status: "ERROR",
      message: "An internal server error occurred.",
    });
  }
};
