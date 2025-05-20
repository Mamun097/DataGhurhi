const supabase = require('../db');

exports.createSurveyTemplate = async (req, res) => {
  try {
    const { project_id, survey_template, user_id, title } = req.body;

    // Validate input
    if (!project_id || !survey_template || !user_id) {
      return res.status(400).json({ error: 'project_id, survey_template, and user_id are required' });
    }

    // Step 1: Insert survey template into survey table
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey')
      .insert({
        project_id,
        user_id,
        template: survey_template,
        starting_date: new Date(),
        title: title || 'Untitled Survey',
      })
      .select('survey_id');

    if (surveyError) {
      console.error('Supabase insert error for survey:', surveyError);
      return res.status(500).json({ error: 'Failed to create survey template' });
    }

    const surveyId = surveyData[0].survey_id; // Fixed to use survey_id

    // Step 2: Insert sections into the section table
    const sectionMapping = {};
    for (const section of survey_template.sections) {
      const { section_id, title } = section;

      const { data: sectionData, error: sectionError } = await supabase
        .from('section')
        .insert({
          survey_id: surveyId,
          title: title,
          local_section_id: section_id, // Local identifier from request
        })
        .select('section_id');

      if (sectionError) {
        console.error('Supabase insert error for section:', sectionError);
        return res.status(500).json({ error: 'Failed to insert section' });
      }

      const sectionId = sectionData[0].section_id;
      sectionMapping[section_id] = sectionId; // Map local_section_id to database section_id
    }

    // Step 3: Insert questions with the correct section_id
    for (const question of survey_template.questions) {
      const { text, image, section_id, question_type, privacy, correct_ans, meta } = question;

      // Get the section_id using the local_section_id
      const sectionId = sectionMapping[section_id];
      if (!sectionId) {
        return res.status(400).json({ error: `Invalid local_section_id: ${section_id}` });
      }

      const { data: questionData, error: questionError } = await supabase
        .from('question')
        .insert({
          user_id,
          text,
          image,
          question_type,
          privacy,
          section_id: sectionId, // Link to the database section_id
          correct_ans: correct_ans || null,
          meta_data: meta,
        })
        .select('*');

      if (questionError) {
        console.error('Supabase insert error for question:', questionError);
        return res.status(500).json({ error: 'Failed to insert question' });
      }

      const questionId = questionData[0].question_id;

      // Handle tags from the meta field
      const tags = meta?.tag || [];
      for (const tagName of tags) {
        const { data: existingTag, error: tagCheckError } = await supabase
          .from('tags')
          .select('tag_id')
          .eq('tag_name', tagName)
          .single();

        let tagId;
        if (tagCheckError || !existingTag) {
          const { data: newTag, error: newTagError } = await supabase
            .from('tags')
            .insert({ tag_name: tagName })
            .select('tag_id')
            .single();

          if (newTagError) {
            console.error('Supabase insert error for tag:', newTagError);
            return res.status(500).json({ error: 'Failed to insert tag' });
          }
          tagId = newTag.tag_id;
        } else {
          tagId = existingTag.tag_id;
        }

        const { error: questionTagError } = await supabase
          .from('question_tag')
          .insert({
            question_id: questionId,
            tag_id: tagId,
          });

        if (questionTagError) {
          console.error('Supabase insert error for question_tag:', questionTagError);
          return res.status(500).json({ error: 'Failed to insert question_tag' });
        }
      }
    }

    return res.status(201).json({
      message: 'Survey template created successfully',
      data: surveyData[0],
    });
  } catch (err) {
    console.error('Error in createSurveyTemplate:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSurveyForm = async (req, res) => {
  try {
    const { survey_id } = req.params;
    const  user_id  = req.jwt.id;
    console.log('Deleting survey with ID:', survey_id);
    console.log('User ID:', req.jwt.id);
    // Check if user id and survey id match
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey')
      .select('*')
      .eq('survey_id', survey_id)
      .eq('user_id', req.jwt.id)
      .single();
    if (surveyError) {
      console.error('Supabase select error for survey:', surveyError);
      return res.status(500).json({ error: 'Failed to fetch survey' });
    }
    if (!surveyData) {
      return res.status(404).json({ error: 'Survey not found or user not authorized' });
    }
    // Delete the survey
    const { error: deleteError } = await supabase
      .from('survey')
      .delete()
      .eq('survey_id', survey_id)
      .eq('user_id', user_id);
    if (deleteError) {
      console.error('Supabase delete error for survey:', deleteError);
      return res.status(500).json({ error: 'Failed to delete survey' });
    }    
    //return success response
    return res.status(200).json({ message: 'Survey deleted successfully' });
  } catch (err) {
    console.error('Error in deleteSurveyForm:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}