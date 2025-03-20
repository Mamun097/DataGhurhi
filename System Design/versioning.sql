CREATE TABLE survey_project_versions (
    version_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    previous_data JSONB NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES survey_project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);



CREATE OR REPLACE FUNCTION save_project_version() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO survey_project_versions (project_id, user_id, previous_data)
    VALUES (OLD.project_id, OLD.user_id, row_to_json(OLD));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER before_project_update
BEFORE UPDATE ON survey_project
FOR EACH ROW
EXECUTE FUNCTION save_project_version();


--Rollback to the previous version--
WITH latest_version AS (
    SELECT previous_data 
    FROM project_versions 
    WHERE project_id = 1 --ekhan e particular project er id hobe arki
    ORDER BY changed_at DESC 
    LIMIT 1
)
UPDATE survey_project 
SET 
    title = (SELECT previous_data->>'title' FROM latest_version),
    field = (SELECT previous_data->>'field' FROM latest_version),
    description = (SELECT previous_data->>'description' FROM latest_version),
    privacy_mode = (SELECT previous_data->>'privacy_mode' FROM latest_version),
    scheduled_type = (SELECT previous_data->>'scheduled_type' FROM latest_version),
    schedule_date = (SELECT previous_data->>'schedule_date' FROM latest_version)
WHERE project_id = 1;



--Rollback to any of the previous versions--
UPDATE survey_project 
SET 
    title = (SELECT previous_data->>'title' FROM project_versions WHERE version_id = 5),--ekhan kon version e jete chai seta dite hobe
    field = (SELECT previous_data->>'field' FROM project_versions WHERE version_id = 5),
    description = (SELECT previous_data->>'description' FROM project_versions WHERE version_id = 5),
    privacy_mode = (SELECT previous_data->>'privacy_mode' FROM project_versions WHERE version_id = 5),
    scheduled_type = (SELECT previous_data->>'scheduled_type' FROM project_versions WHERE version_id = 5),
    schedule_date = (SELECT previous_data->>'schedule_date' FROM project_versions WHERE version_id = 5)
WHERE project_id = 1;





INSERT INTO survey_project (project_id, user_id, title, field, description, privacy_mode, scheduled_type, schedule_date) 
VALUES (1, 20, 'Project A', 'Science', 'Initial version', 'Public', 'Manual', '2025-01-01');


UPDATE survey_project
SET 
    title = 'Updated Project A',
    field = 'Physics',
    description = 'New updated description',
    privacy_mode = 'Private',
    scheduled_type = 'Auto',
    schedule_date = '2025-02-01'
WHERE project_id = 1;
