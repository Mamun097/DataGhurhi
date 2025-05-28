    const supabase = require("../db");
const { jwtAuthMiddleware } = require("../auth/authmiddleware");

const { Parser } = require("json2csv");

exports.getCSV = async (req, res) => {
  try {
    const surveyId = req.params.surveyId; 
    const user_id = req.jwt.id;
    const { data, error } = await supabase
      .from("response")
      .select("response_data")
      .eq("survey_id", surveyId);

    //check if user is authenticated
    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (error) {
      console.error("Error fetching CSV data:", error);
      return res.status(500).json({ error: "Failed to fetch CSV data" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // Extract all unique question texts for CSV headers
    const allQuestions = new Set();
    data.forEach((entry) => {
      entry.response_data.forEach((response) => {
        allQuestions.add(response.questionText);
      });
    });
    const fields = Array.from(allQuestions);

    // Transform data into CSV-friendly format
    const csvData = data.map((entry) => {
      const row = {};
      // Initialize all question fields with null
      fields.forEach((question) => {
        row[question] = null;
      });
      // Populate responses for questions the user answered
      entry.response_data.forEach((response) => {
        row[response.questionText] = response.userResponse;
      });
      return row;
    });

    // Configure json2csv parser
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Set headers for CSV download
    res.header("Content-Type", "text/csv");
    res.attachment("survey_responses.csv");
    return res.status(200).send(csv);
  } catch (err) {
    console.error("Error generating CSV:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};