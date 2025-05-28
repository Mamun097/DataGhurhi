module.exports = {
  // Survey-related constants
  DEFAULT_SURVEY_TITLE: "Untitled Survey",
  SURVEY_STATUS_SAVED: "saved",
  SURVEY_STATUS_PUBLISHED: "published",

  // HTTP Status Codes 
  HTTP_STATUS_BAD_REQUEST: 400,
  HTTP_STATUS_UNAUTHORIZED: 403,
  HTTP_STATUS_NOT_FOUND: 404,
  HTTP_STATUS_OK: 200,
  HTTP_STATUS_CREATED: 201,
  HTTP_STATUS_INTERNAL_SERVER_ERROR: 500,

  // Error Messages
  ERROR_MISSING_FIELDS: "project_id, survey_template, and survey_id are required",
  ERROR_UNAUTHORIZED: "User not authorized to modify this survey",
  ERROR_SURVEY_NOT_FOUND: "Survey not found or user not authorized",
  ERROR_INVALID_TEMPLATE: "survey_template must contain sections and questions arrays",
  ERROR_FAILED_SURVEY_UPDATE: "Failed to update survey",
  ERROR_FAILED_SURVEY_DELETE: "Failed to delete survey",
  ERROR_FAILED_SECTION_INSERT: "Failed to insert section",
  ERROR_FAILED_QUESTION_INSERT: "Failed to insert question",
  ERROR_FAILED_TAG_INSERT: "Failed to insert tag",
  ERROR_FAILED_QUESTION_TAG_INSERT: "Failed to insert question_tag",
  ERROR_INVALID_SECTION_ID: "Invalid local_section_id",
};