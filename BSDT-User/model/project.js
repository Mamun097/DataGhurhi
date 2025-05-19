const supabase = require("../db");
const bcrypt = require("bcryptjs");

// create project
async function createProject(userId, title, field, description, privacy_mode) {
  console.log(userId, title, field, description, privacy_mode);
  const newProject = await supabase.from("survey_project").insert([
    {
      user_id: userId,
      title,
      field,
      privacy_mode,
      description,
    },
  ]);
  return newProject;
}
// find project by user id
async function findProjectByUserId(userId) {
  const { data, error } = await supabase
    .from("survey_project")
    .select("*")
    .eq("user_id", userId);
  return { data, error };
}
// find project by project id
async function findProjectById(projectId) {
  const { data, error } = await supabase
    .from("survey_project")
    .select("*")
    .eq("project_id", projectId);
  return { data, error };
}
// find survey by project id
async function findSurveysByProjectId(projectId) {
  const { data, error } = await supabase
    .from("survey")
    .select("*")
    .eq("project_id", projectId);
  return { data, error };
}
// create survey for a project id
// async function createSurvey(projectId, title) {
//     // console.log("Create Survey: ",projectId, title);
//   const { data, error } = await supabase.from("survey").insert([
//     {
//       project_id: projectId,
//       title,
//     },
//   ]);

//   return { data, error };
// }
async function createSurvey(projectId, title) {
  // Check for duplicates
  const { data: existing, error: fetchError } = await supabase
    .from("survey")
    .select("*")
    .eq("project_id", projectId)
    .eq("title", title)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { data: null, error: fetchError };
  }

  if (existing) {
    return {
      data: null,
      error: {
        message: "A survey with this title already exists for the project.",
      },
    };
  }

  // Insert and return the full row
  const { data, error } = await supabase
    .from("survey")
    .insert([{ project_id: projectId, title }])
    .select()
    .single(); // ensures only one row is returned

  return { data, error };
}

// update project
async function updateProject(projectId, data) {
  console.log(data);
  const { datas, error } = await supabase
    .from("survey_project")
    .update({
      title: data.title,
      field: data.field,
      description: data.description,
      privacy_mode: data.privacy_mode,
      scheduled_type: data.scheduled_type,
      schedule_date: data.scheduled_date,
    })
    .eq("project_id", projectId);

  if (error) {
    console.error("Error updating project:", error);
  } else {
    console.log("Project updated successfully:", data);
  }
  return { datas, error };
}
async function deleteProject(projectId) {
  const { data, error } = await supabase
    .from("survey_project")
    .delete()
    .eq("project_id", projectId);
  return { error };
}
// collaborators

async function inviteCollaborator(projectId, user_data) {
  const { data, error } = await supabase.rpc("get_survey_designer_by_email", {
    u_email: user_data.email,
  });
  if (error) {
    console.error(error);
    return { error };
  }
  if (data.length === 0) {
    return { error: "user does not exist" };
  }

  const id = data;
  console.log(data);

  const { error: insertError } = await supabase
    .from("survey_shared_with_collaborators")
    .insert([
      {
        user_id: id,
        project_id: projectId,
        access_role: user_data.access_role,
        invitation: user_data.invitation,
      },
    ]);
  return { error: insertError };
}
async function getCollaborators(projectId) {
  const { data, error } = await supabase
    .from("survey_shared_with_collaborators")
    .select(
      `
            *,
            user (
              email,
              name
            )
          `
    )
    .eq("project_id", projectId);
  return { data, error };
}

async function removeCollaborator(projectId, collaboratorId) {
  const { error } = await supabase
    .from("survey_shared_with_collaborators")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", collaboratorId);
  return { error };
}
module.exports = {
  createProject,
  findProjectByUserId,
  findProjectById,
  findSurveysByProjectId,
  createSurvey,
  updateProject,
  deleteProject,
  inviteCollaborator,
  getCollaborators,
  removeCollaborator,
};
