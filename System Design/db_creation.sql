-- Create the 'user' table
CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    secret_question TEXT,
    address TEXT,
    date_of_birth DATE,
    contact VARCHAR(15),
    gender VARCHAR(10),
    religion VARCHAR(50),
    image TEXT
);

-- Create the 'survey_designer' table
CREATE TABLE "survey_designer" (
    user_id INTEGER PRIMARY KEY, -- Foreign key from the "user" table
    affiliation VARCHAR(255),
    research_field VARCHAR(255),
    profession VARCHAR(100),
    years_of_experience INTEGER,
    profile_link TEXT,
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'survey_designer_working_field' table
CREATE TABLE "survey_designer_working_field" (
    user_id INTEGER,
    working_field VARCHAR(255),
    PRIMARY KEY (user_id, working_field),
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'admin_panel' table
CREATE TABLE "admin_panel" (
    user_id INTEGER PRIMARY KEY, -- Foreign key from the "user" table
    access_role VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'project_owner' table
CREATE TABLE "project_owner" (
    user_id INTEGER PRIMARY KEY, -- Foreign key from the "user" table
    access_role VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'project_collaborator' table
CREATE TABLE "project_collaborator" (
    user_id INTEGER PRIMARY KEY, -- Foreign key from the "user" table
    access_role VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'survey_project' table
CREATE TABLE "survey_project" (
    project_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    user_id INTEGER,
    title VARCHAR(255),
    field VARCHAR(255),
    description TEXT,
    privacy_mode VARCHAR(50),
    scheduled_type VARCHAR(50),
    schedule_date DATE,
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'survey_shared_with_collaborators' table
CREATE TABLE "survey_shared_with_collaborators" (
    user_id INTEGER,
    project_id INTEGER,
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES "survey_project" (project_id) ON DELETE CASCADE
);

-- Create the 'survey' table
CREATE TABLE "survey" (
    survey_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    project_id INTEGER,
    saved_template TEXT,
    survey_link TEXT,
    qr_code TEXT,
    starting_date DATE,
    ending_date DATE,
    FOREIGN KEY (project_id) REFERENCES "survey_project" (project_id) ON DELETE CASCADE
);

-- Create the 'question' table
CREATE TABLE "question" (
    question_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    user_id INTEGER,
    survey_id INTEGER,
    qb_id INTEGER,
    text TEXT,
    image TEXT,
    tag JSONB,  --Can store multiple tags for a question as array
    input_type VARCHAR(50),
    privacy VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES "survey" (survey_id) ON DELETE CASCADE,
    FOREIGN KEY (qb_id) REFERENCES "question_bank" (qb_id) ON DELETE CASCADE
);

-- Create the 'question_bank' table
CREATE TABLE "question_bank" (
    qb_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'comment' table
CREATE TABLE "comment" (
    comment_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    user_id INTEGER,
    survey_id INTEGER,
    resolved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES "survey" (survey_id) ON DELETE CASCADE
);

-- Create the 'visitors_query' table
CREATE TABLE "visitors_query" (
    query_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    query TEXT NOT NULL
);

-- Create the 'visitors_query_reply' table
CREATE TABLE "visitors_query_reply" (
    query_id INTEGER,
    user_id INTEGER,
    reply_text TEXT,
    PRIMARY KEY (query_id, user_id),
    FOREIGN KEY (query_id) REFERENCES "visitors_query" (query_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE
);

-- Create the 'templates' table
CREATE TABLE "templates" (
    template_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    template_file TEXT
);

-- Create the 'survey_response' table
CREATE TABLE "survey_response" (
    response_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    survey_id INTEGER,
    question_id INTEGER,
    email VARCHAR(255),
    status VARCHAR(50),
    access_time TIMESTAMP,
    response_data JSONB,
    remainder BOOLEAN DEFAULT FALSE,
    submission_time TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES "survey" (survey_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES "question" (question_id) ON DELETE CASCADE
);

-- Create the 'report' table
CREATE TABLE "report" (
    report_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    survey_id INTEGER,
    pdf_link TEXT,
    excel_link TEXT,
    access_mode VARCHAR(50),
    publish_time TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES "survey" (survey_id) ON DELETE CASCADE
);

-- Create the 'preprocessed_data' table
CREATE TABLE "preprocessed_data" (
    preprocess_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    response_id INTEGER,
    demographic JSONB,
    quantitative JSONB,
    qualitative JSONB,
    correction_type VARCHAR(50),
    status VARCHAR(50),
    FOREIGN KEY (response_id) REFERENCES "survey_response" (response_id) ON DELETE CASCADE
);



-- Question Bank is unnecessary
ALTER TABLE "question" 
DROP COLUMN qb_id;

DROP TABLE IF EXISTS "question_bank";

ALTER TABLE "question"
ALTER COLUMN survey_id DROP NOT NULL;   --Making survey_id not required, it is not mandatory for a
                                        --question to be from a survey


--This table will store unique tags.
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,  -- Unique ID for each tag
    tag_name VARCHAR(100) UNIQUE NOT NULL  -- Tag name must be unique
);

--This table will establish a many-to-many relationship between question and tags.
CREATE TABLE question_tag (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (question_id, tag_id),  -- Composite primary key to prevent duplicates
    FOREIGN KEY (question_id) REFERENCES question (question_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE
);


--Since tags are now stored separately, remove the tag column from the question table.
ALTER TABLE question DROP COLUMN tag;





--^ CHANGES DONE AT 25/03/2025, TUESDAY ^--
--^ =================================== ^--

--!Creating the section table
CREATE TABLE section (
    section_id SERIAL PRIMARY KEY,   -- Auto-incrementing primary key
    survey_id INTEGER NOT NULL,      -- Foreign key referencing survey table
    title VARCHAR(255) NOT NULL,     -- Section title (required)
    description TEXT,                -- Optional description
    CONSTRAINT fk_survey FOREIGN KEY (survey_id) 
        REFERENCES survey(survey_id) ON DELETE CASCADE
);
ALTER TABLE section 
ALTER COLUMN title DROP NOT NULL,  -- Allow NULL values
ALTER COLUMN title SET DEFAULT 'Section Title',  -- Set default value
ALTER COLUMN description SET DEFAULT 'Section Description';  -- Set default value

--!Modifying the Question table
-- 1️⃣ Make `user_id` and `input_type` NOT NULL
ALTER TABLE question 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN input_type SET NOT NULL;

-- 2️⃣ Set default value of `privacy` to 'private'
ALTER TABLE question 
ALTER COLUMN privacy SET DEFAULT 'private';

-- 3️⃣ Remove `survey_id` column
ALTER TABLE question 
DROP COLUMN survey_id;

-- 4️⃣ Add `section_id` as a foreign key (nullable)
ALTER TABLE question 
ADD COLUMN section_id INTEGER,
ADD CONSTRAINT fk_section FOREIGN KEY (section_id) REFERENCES section(section_id) ON DELETE SET NULL;

-- 5️⃣ Add `options` column as JSONB (nullable)
ALTER TABLE question 
ADD COLUMN options JSONB;


--!For getting the structure of a table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'question';


--!Insert data to Question table
INSERT INTO question (user_id, text, input_type, privacy, options)  
VALUES (20, 'At which side does the sun rise?', 'radio', 'private',  
        '[{"Text": "North"}, {"Text": "South"}, {"Text": "East"}, {"Text": "West"}]'::jsonb);
