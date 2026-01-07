const supabase = require("../db");
const { jwtAuthMiddleware } = require("../auth/authmiddleware");
const crypto = require("crypto");
const { generateSlug } = require("../services/generateSlug");
const Project = require("../model/project");

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
        response_user_logged_in_status: survey_template.isLoggedInRequired,
        shuffle_questions: survey_template.shuffleQuestions,
      })
      .eq("survey_id", survey_id)
      .select("*");
    if (surveyError) {
      console.error("Supabase insert error for survey:", surveyError);
      return res
        .status(500)
        .json({ error: "Failed to create survey template" });
    }
    console.log("Survey template:", surveyData[0]);
    //update last_updated time in project table
    const { error: projectUpdateError } = await supabase
      .from("survey_project")
      .update({ last_updated: new Date() })
      .eq("project_id", project_id);
    if (projectUpdateError) {
      console.error("Supabase update error for project:", projectUpdateError);
      return res
        .status(500)
        .json({ error: "Failed to update project last updated time" });
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
    const {
      survey_id,
      project_id,
      survey_template,
      title,
      response_user_logged_in_status,
      shuffle_questions,
    } = req.body;
    const user_id = req.jwt.id;

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

    //check if the survey_link exists
    const isPublished = survey_link.length > 0 && survey_link[0].survey_link;

    // // get slag
    // const slug = survey_link[0].survey_link
    //   ? survey_link[0].survey_link
    //   : generateSlug(title, survey_id, "published");

    // Step 1: Insert survey template into survey table
    const { data: surveyData, error: surveyError } = await supabase
      .from("survey")
      .update({
        project_id: project_id,
        user_id,
        banner: survey_template.banner || null,
        template: survey_template,
        // survey_link: slug,
        starting_date: new Date(),
        title: title || "Untitled Survey",
        survey_status: "published",
        response_user_logged_in_status: response_user_logged_in_status || false,
        shuffle_questions: shuffle_questions || false,
      })
      .eq("survey_id", survey_id)
      .select("*");
    //update published date or update date
    if (!isPublished) {
      const { error: updateError } = await supabase
        .from("survey")
        .update({ published_date: new Date() })
        .eq("survey_id", survey_id);
      if (updateError) {
        console.error("Supabase update error for survey:", updateError);
        return res
          .status(500)
          .json({ error: "Failed to update survey published date" });
      }
    } else {
      const { error: updateError } = await supabase
        .from("survey")
        .update({ last_updated: new Date() })
        .eq("survey_id", survey_id);
      if (updateError) {
        console.error("Supabase update error for survey:", updateError);
        return res
          .status(500)
          .json({ error: "Failed to update survey last updated time" });
      }
    }
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
      const { text, image, section_id, type, privacy, correct_ans, meta } =
        question;

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
          text: text,
          image: image || null,
          type: type,
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
      const tags = meta?.tags || [];
      for (const tagName of tags) {
        console.log("Processing tag:", tagName);
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
    console.log("Survey template creation/updation:", surveyData[0]);
    //update last_updated time in project table
    const { error: projectUpdateError } = await supabase
      .from("survey_project")
      .update({ last_updated: new Date() })
      .eq("project_id", project_id);
    if (projectUpdateError) {
      console.error("Supabase update error for project:", projectUpdateError);
      return res
        .status(500)
        .json({ error: "Failed to update project last updated time" });
    }

    //fetch survey slug after publishing
    const { data: publishedSurveyData, error: publishedSurveyError } =
      await supabase
        .from("survey")
        .select("survey_link")
        .eq("survey_id", survey_id)
        .single();
    if (publishedSurveyError) {
      console.error(
        "Supabase select error for published survey:",
        publishedSurveyError
      );
      return res.status(500).json({ error: "Failed to fetch survey link" });
    }
    const slug = publishedSurveyData.survey_link;

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
        console.error(
          "Supabase delete error for questions:",
          questionDeleteError
        );
        return res.status(500).json({ error: "Failed to delete questions" });
      }
      // Delete sections associated with the survey
      const { error: sectionDeleteError } = await supabase
        .from("section")
        .delete()
        .eq("survey_id", survey_id);
      if (sectionDeleteError) {
        console.error(
          "Supabase delete error for sections:",
          sectionDeleteError
        );
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
    } else {
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
      //update last_updated time in project table
      const { error: projectUpdateError } = await supabase
        .from("survey_project")
        .update({ last_updated: new Date() })
        .eq("project_id", surveyData.project_id);
      if (projectUpdateError) {
        console.error("Supabase update error for project:", projectUpdateError);
        return res
          .status(500)
          .json({ error: "Failed to update project last updated time" });
      }

      //return success response
      return res.status(200).json({ message: "Survey deleted successfully" });
    }
  } catch (err) {
    console.error("Error in deleteSurveyForm:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSurvey = async (req, res) => {
  try {
    const { survey_id } = req.params;
    const user_id = req.jwt.id;

    // Fetch the survey data
    const { data: surveyData, error: surveyError } = await supabase
      .from("survey")
      .select("*")
      .eq("survey_id", survey_id)
      .single();

    // console.log("Survey Details: ", surveyData);
    if (surveyError) {
      console.error("Supabase select error for survey:", surveyError);
      return res.status(500).json({ error: "Failed to fetch survey" });
    }

    if (!surveyData) {
      return res.status(404).json({ error: "Survey not found" });
    }

    return res.status(200).json(surveyData);
  } catch (err) {
    console.error("Error in getSurvey:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getResponseCount = async (req, res) => {
  const { survey_id } = req.params;
  const user_id = req.jwt.id;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  try {
    const { data: survey, error } = await supabase
      .from("survey")
      .select("user_id")
      .eq("survey_id", survey_id)
      .single();

    if (error || !survey) {
      throw new Error("Survey not found.");
    }

    if (survey.user_id !== user_id) {
      res.write('data: {"error": "Forbidden"}\n\n');
      return res.end();
    }
  } catch (err) {
    console.error("Authorization failed:", err.message);
    res.write(`data: {"error": "${err.message}"}\n\n`);
    return res.end();
  }
  const sendCount = async () => {
    const { count, error } = await supabase
      .from("response")
      .select("*", { count: "exact", head: true })
      .eq("survey_id", survey_id);

    if (error) {
      console.error("Error fetching count:", error);
    } else {
      res.write(`data: ${JSON.stringify({ count })}\n\n`);
    }
  };

  sendCount();
  const channel = supabase.channel(`response-count-${survey_id}`);

  channel
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "response",
        filter: `survey_id=eq.${survey_id}`,
      },
      (payload) => {
        console.log("New response detected! Sending updated count.");
        sendCount();
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(
          `Successfully subscribed to realtime updates for survey ${survey_id}`
        );
      }
    });
  req.on("close", () => {
    console.log(
      `Client disconnected from survey ${survey_id} stream. Unsubscribing.`
    );
    supabase.removeChannel(channel);
    res.end();
  });
};

exports.copySurveyForm = async (req, res) => {
  const { survey_id } = req.params;
  const userId = req.jwt.id;
  const { projectId } = req.body;

  // 1. Fetch the original survey (ensure we select copy_count)
  const { data: originalSurvey, error: originalSurveyError } = await supabase
    .from("survey")
    .select("*")
    .eq("survey_id", survey_id)
    .eq("user_id", userId) 
    .single();

  if (originalSurveyError || !originalSurvey) {
    console.error("Supabase select error for original survey:", originalSurveyError);
    return res.status(500).json({ error: "Failed to fetch original survey" });
  }

  // 2. Determine the new title
  // Default to 0 if copy_count is null/undefined
  const currentCount = originalSurvey.copy_count || 0; 
  const newTitle = `${originalSurvey.title}_copy(${currentCount + 1})`;

  // 3. Create the new survey entry (Slug Logic)
  let attempts = 0;
  const maxAttempts = 5;
  let newSurveyId = null;

  while (attempts < maxAttempts) {
      const slug = generateSlug();
      // Attempt to create the shell of the survey
      const { data, error } = await Project.createSurvey(projectId, newTitle, userId, slug);

      if (!error) {
          // Success: Capture ID and break the loop (DO NOT return res yet)
          newSurveyId = data.survey_id;
          break; 
      }
      // Handle Unique Slug Violation
      if (error.code === '23505') {
          attempts++;
          continue;
      }
      // Other errors
      console.error(error);
      return res.status(400).json({ error: error.message || "Unknown error" });
  }
  // If we couldn't create a survey after 5 attempts
  if (!newSurveyId) {
      return res.status(500).json({ error: "Could not generate a unique survey link. Please try again." });
  }
  // 4. Update the NEW survey with the original data
  const { data: copiedSurvey, error: copiedSurveyError } = await supabase
    .from("survey")
    .update({
      template: originalSurvey.template,
      response_user_logged_in_status: originalSurvey.response_user_logged_in_status,
      shuffle_questions: originalSurvey.shuffle_questions,
      collectResponse: originalSurvey.collectResponse,
      banner: originalSurvey.banner,
      survey_status: "saved", // Reset status to saved/draft
      starting_date: new Date(),
      copy_count: 0, // Reset copy count for the new survey
    })
    .eq("survey_id", newSurveyId)
    .select("*")
    .single();

  if (copiedSurveyError) {
    console.error("Supabase update error for copied survey:", copiedSurveyError);
    return res.status(500).json({ error: "Failed to copy survey data" });
  }

  // 5. Increment the copy_count of the ORIGINAL survey
  const { error: incrementError } = await supabase
    .from("survey")
    .update({
        copy_count: currentCount + 1
    })
    .eq("survey_id", survey_id);

  if (incrementError) {
      // This is a non-critical error (survey was copied, but counter failed), 
      // but good to log it.
      console.error("Failed to increment copy count on original survey:", incrementError);
  }

  // 6. Return Success
  return res.status(201).json({
    message: "Survey copied successfully",
    data: copiedSurvey,
  });
};