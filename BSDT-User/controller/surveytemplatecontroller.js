const supabase = require('../db');

exports.createSurveyTemplate = async (req, res) => {
  try {
    const { project_id, survey_template } = req.body;
    console.log('Request Body:', req.body);

    // Validate input
    if (!project_id || !survey_template) {
      return res.status(400).json({ error: 'project_id and survey_template are required' });
    }

    // Insert into database
    const { data, error } = await supabase
      .from('survey')
      .insert({
        project_id,
        template: survey_template,
        starting_date: new Date(),
      })
      .select('*');

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create survey template' });
    }

    return res.status(201).json({
      message: 'Survey template created successfully',
      data: data[0]  // optional: send back the inserted row
    });
  } catch (err) {
    console.error('Error in createSurveyTemplate:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
