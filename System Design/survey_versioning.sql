CREATE TABLE survey_versions (
    version_id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL,
    project_id INT NOT NULL,
    previous_data JSONB NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES survey_project(project_id) ON DELETE CASCADE
);



CREATE OR REPLACE FUNCTION save_survey_version() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO survey_versions (survey_id, project_id, previous_data)
    VALUES (OLD.survey_id, OLD.project_id, row_to_json(OLD));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER before_survey_update
BEFORE UPDATE ON survey
FOR EACH ROW
EXECUTE FUNCTION save_survey_version();


--Rollback to the previous version--
WITH latest_version AS (
    SELECT previous_data 
    FROM survey_versions 
    WHERE survey_id = 1 -- has to be id of particular project
    ORDER BY changed_at DESC 
    LIMIT 1
)
UPDATE survey
SET 
    saved_template = (SELECT previous_data->>'saved_template' FROM latest_version),
    survey_link = (SELECT previous_data->>'survey_link' FROM latest_version),
    qr_code = (SELECT previous_data->>'qr_code' FROM latest_version),
    starting_date = (SELECT previous_data->>'starting_date' FROM latest_version),
    ending_date = (SELECT previous_data->>'ending_date' FROM latest_version)
WHERE survey_id = 1;



--Rollback to any of the previous versions--
UPDATE survey 
SET 
    saved_template = (SELECT previous_data->>'saved_template' FROM survey_versions WHERE version_id = 5),--has to be the id of the version that we want to rollback
    survey_link = (SELECT previous_data->>'survey_link' FROM survey_versions WHERE version_id = 5),
    qr_code = (SELECT previous_data->>'qr_code' FROM survey_versions WHERE version_id = 5),
    starting_date = (SELECT previous_data->>'starting_date' FROM survey_versions WHERE version_id = 5),
    ending_date = (SELECT previous_data->>'ending_date' FROM survey_versions WHERE version_id = 5)
WHERE survey_id = 1;
