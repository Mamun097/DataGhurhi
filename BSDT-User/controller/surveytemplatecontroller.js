const supabase = require("../db");
const { jwtAuthMiddleware } = require("../auth/authmiddleware");
const crypto = require("crypto");

exports.saveSurveyForm = async (req, res) => {
  try {
    const { survey_id, project_id, survey_template } = req.body;
    // Validate input
    if (!project_id || !survey_template) {
      return res
        .status(400)
        .json({ error: "project_id and survey_template are required" });
    }

    // Step 1: Insert survey template into survey table
    const { data: surveyData, error: surveyError } = await supabase
      .from("survey")
      .update({
        project_id: project_id,
        banner: survey_template.banner || null,
        template: survey_template,
        starting_date: new Date(),
        title: survey_template.title || "Untitled Survey",
        survey_status: "saved",
      })
      .eq("survey_id", survey_id)
      .select("*");
    if (surveyError) {
      console.error("Supabase insert error for survey:", surveyError);
      return res
        .status(500)
        .json({ error: "Failed to create survey template" });
    }
    return res.status(201).json({
      message: "Survey template created successfully",
      data: surveyData[0],
    });
  } catch (err) {
    console.error("Error in createSurveyTemplate:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.createSurveyForm = async (req, res) => {
  try {
    const { survey_id, project_id, survey_template, title } = req.body;
    const user_id = req.jwt.id;
    console.log(survey_template.questions);
    // Validate input
    if (!project_id || !survey_template) {
      return res.status(400).json({
        error: "project_id, survey_template, and user_id are required",
      });
    }

    const { data: survey_link, error: survey_link_error } = await supabase
      .from("survey")
      .select("survey_link")
      .eq("survey_id", survey_id);

    // get slag
    const slug = survey_link[0].survey_link
      ? survey_link[0].survey_link
      : generateSlug(title, survey_id, "published");

    // Step 1: Insert survey template into survey table
    const { data: surveyData, error: surveyError } = await supabase
      .from("survey")
      .update({
        project_id: project_id,
        user_id,
        banner: survey_template.banner || null,
        template: survey_template,
        survey_link: slug,
        starting_date: new Date(),
        title: title || "Untitled Survey",
        survey_status: "published",
      })
      .eq("survey_id", survey_id)
      .select("survey_id");

    if (surveyError) {
      console.error("Supabase insert error for survey:", surveyError);
      return res
        .status(500)
        .json({ error: "Failed to create survey template" });
    }

    const surveyId = surveyData[0].survey_id; // Fixed to use survey_id

    // Step 2: Insert sections into the section table
    const sectionMapping = {};
    for (const section of survey_template.sections) {
      const { section_id, title } = section;

      const { data: sectionData, error: sectionError } = await supabase
        .from("section")
        .insert({
          survey_id: surveyId,
          title: title,
          local_section_id: section_id, // Local identifier from request
        })
        .select("section_id");

      if (sectionError) {
        console.error("Supabase insert error for section:", sectionError);
        return res.status(500).json({ error: "Failed to insert section" });
      }

      const sectionId = sectionData[0].section_id;
      sectionMapping[section_id] = sectionId; // Map local_section_id to database section_id
    }

    // Step 3: Insert questions with the correct section_id
    for (const question of survey_template.questions) {
      const {
        text,
        image,
        section_id,
        question_type,
        privacy,
        correct_ans,
        meta,
      } = question;

      // Get the section_id using the local_section_id
      const sectionId = sectionMapping[section_id];
      if (!sectionId) {
        return res
          .status(400)
          .json({ error: `Invalid local_section_id: ${section_id}` });
      }

      const { data: questionData, error: questionError } = await supabase
        .from("question")
        .insert({
          user_id: user_id,
          survey_id: surveyId,
          text: question.text,
          image: question.image || null,
          type: question.type,
          privacy,
          section_id: sectionId, // Link to the database section_id
          correct_ans: correct_ans || null,
          meta_data: meta,
        })
        .select("*");

      if (questionError) {
        console.error("Supabase insert error for question:", questionError);
        return res.status(500).json({ error: "Failed to insert question" });
      }

      const questionId = questionData[0].question_id;

      // Handle tags from the meta field
      const tags = meta?.tag || [];
      for (const tagName of tags) {
        const { data: existingTag, error: tagCheckError } = await supabase
          .from("tags")
          .select("tag_id")
          .eq("tag_name", tagName)
          .single();

        let tagId;
        if (tagCheckError || !existingTag) {
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({ tag_name: tagName })
            .select("tag_id")
            .single();

          if (newTagError) {
            console.error("Supabase insert error for tag:", newTagError);
            return res.status(500).json({ error: "Failed to insert tag" });
          }
          tagId = newTag.tag_id;
        } else {
          tagId = existingTag.tag_id;
        }

        const { error: questionTagError } = await supabase
          .from("question_tag")
          .insert({
            question_id: questionId,
            tag_id: tagId,
          });

        if (questionTagError) {
          console.error(
            "Supabase insert error for question_tag:",
            questionTagError
          );
          return res
            .status(500)
            .json({ error: "Failed to insert question_tag" });
        }
      }
    }
    
    return res.status(201).json({
      survey_link: slug,
      message: "Survey template created successfully",
      data: surveyData[0],
    });
  } catch (err) {
    console.error("Error in createSurveyTemplate:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSurveyForm = async (req, res) => {
  try {
    const { survey_id } = req.params;
    const user_id = req.jwt.id;
    console.log("Deleting survey with ID:", survey_id);
    console.log("User ID:", req.jwt.id);
    // Check if user id and survey id match
    const { data: surveyData, error: surveyError } = await supabase
      .from("survey")
      .select("*")
      .eq("survey_id", survey_id)
      .eq("user_id", req.jwt.id)
      .single();
    if (surveyError) {
      console.error("Supabase select error for survey:", surveyError);
      return res.status(500).json({ error: "Failed to fetch survey" });
    }
    if (!surveyData) {
      return res
        .status(404)
        .json({ error: "Survey not found or user not authorized" });
    }
    // check if survey is published
    if (surveyData.survey_status != null) {
          //Delete questions associated with the survey
    const { error: questionDeleteError } = await supabase
      .from("question")
      .delete()
      .eq("survey_id", survey_id);
    if (questionDeleteError) {
      console.error("Supabase delete error for questions:", questionDeleteError);
      return res.status(500).json({ error: "Failed to delete questions" });
    }
    // Delete sections associated with the survey
    const { error: sectionDeleteError } = await supabase
      .from("section")
      .delete()
      .eq("survey_id", survey_id);
    if (sectionDeleteError) {
      console.error("Supabase delete error for sections:", sectionDeleteError);
      return res.status(500).json({ error: "Failed to delete sections" });
    }
    // Delete the survey
    const { error: deleteError } = await supabase
      .from("survey")
      .delete()
      .eq("survey_id", survey_id)
      .eq("user_id", user_id);
    if (deleteError) {
      console.error("Supabase delete error for survey:", deleteError);
      return res.status(500).json({ error: "Failed to delete survey" });
    }
    //return success response
    return res.status(200).json({ message: "Survey deleted successfully" });
    }else{
      //just delete the survey
      console.log("Deleting survey with ID:", survey_id);
      const { error: deleteError } = await supabase
        .from("survey")
        .delete()
        .eq("survey_id", survey_id)
        .eq("user_id", user_id);
      if (deleteError) {
        console.error("Supabase delete error for survey:", deleteError);
        return res.status(500).json({ error: "Failed to delete survey" });
      }
      //return success response
      return res.status(200).json({ message: "Survey deleted successfully" });
    }

  } catch (err) {
    console.error("Error in deleteSurveyForm:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

function generateSlug(survey_title, survey_id, survey_status) {
  const hash = crypto.createHash("sha256");
  hash.update(`${survey_id}-${survey_status}-${survey_title}`);
  const hashValue = hash.digest("hex");

  const currentTime = Date.now().toString();
  const randomValue = Math.floor(Math.random() * 1e6).toString();

  // Concatenate all and hash again
  const finalHash = crypto
    .createHash("sha256")
    .update(currentTime + randomValue + hashValue)
    .digest("hex");

  return `${finalHash}`;
}
