const e = require('express');
const supabase = require('../db');
const Project = require('../model/project');
const { sendCollaboratorInvitation } = require('../services/emailService');
const crypto = require("crypto");

// const User = require('../model/user');


exports.allprojectviewUser = async (req, res) => {
    const { data, error } = await Project.findProjectByUserId(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ projects: data });
}
exports.projectData = async (req, res) => {
    const  projectId  = req.params.projectID;
    console.log(projectId);
    const { data, error } = await Project.findProjectById(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    return res.status(200).json({ project: data[0] });
}

// get all surveys of a project
exports.getAllSurveys = async (req, res) => {
    const projectId = req.params.projectID;
    
    // It will be called from View-Project page. Project ID will be passed from the URL.
    const { data, error } = await Project.findSurveysByProjectId(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'No surveys found for this project' });
    }
    
    return res.status(200).json({ surveys: data });
}

// create survey
exports.createSurvey = async (req, res) => {
    
    const projectId = req.params.projectID;
    const { title } = req.body;
    const userId = req.jwt.id;
    //generate slug and insert it to survey table
    const slug = generateSlug(title, projectId, 'draft');
    const { data, error } = await Project.createSurvey(projectId, title, userId, slug);

    if (error) {
        console.error(error);
        return res.status(400).json({ error: error.message || "Unknown error" }); // send only message
    }

    return res.status(201).json({ data, message: 'Survey created successfully' });
};

exports.updateProject = async (req, res) => {
    const projectId = req.params.projectID;
// check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const { data, error } = await Project.updateProject(projectId,req.body);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Project updated successfully' });
}

exports.createProject = async (req, res) => {
    console.log(req.body);
    const { title,field, description,privacy_mode } = req.body;
    const { data, error } = await Project.createProject(req.jwt.id, title, field, description,privacy_mode);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(201).json({ message: 'Project created successfully' });
}
exports.deleteProject = async (req, res) => {
    const projectId = req.params.projectID;
    // check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { error } = await Project.deleteProject(projectId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Project deleted successfully' });
}
// collaborators

exports.inviteCollaborator = async (req, res) => {
    const projectId = req.params.projectID;
    const invitorId = req.jwt.id; // The user who is inviting
    
    console.log('Project ID:', projectId);
    console.log('Request Body:', req.body);
    
    try {
        // 1. Check if project exists
        const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
        if (projectError) {
            console.error('Project fetch error:', projectError);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!projectData.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projectData[0];

        // 2. Get invitor details (the person sending the invitation)
        const { data: invitorData, error: invitorError } = await supabase
            .from('user')
            .select('name, email')
            .eq('user_id', invitorId)
            .single();

        if (invitorError || !invitorData) {
            console.error('Invitor fetch error:', invitorError);
            return res.status(404).json({ error: 'Invitor not found' });
        }

        // 3. Get collaborator details (the person being invited)
        const collaboratorEmail = req.body.email;
        
        const { data: collaboratorData, error: collaboratorError } = await supabase
            .from('user')
            .select('user_id, name, email')
            .eq('email', collaboratorEmail)
            .single();

        if (collaboratorError || !collaboratorData) {
            console.error('Collaborator not found:', collaboratorError);
            return res.status(404).json({ 
                error: 'User with this email does not exist on the platform' 
            });
        }

        // 4. Add collaborator to database (your existing logic)
        const { data, error } = await Project.inviteCollaborator(projectId, req.body, res);
        
        if (error) {
            console.error('Invite error:', error);
            if (error === 'Collaborator exists') {
                return res.status(401).json({ error: 'Collaborator already exists' });
            }
            return res.status(500).json({ error: error });
        }

        // 5. Send email notification
        let emailSent = false;
        let emailError = null;

        try {
            await sendCollaboratorInvitation({
                invitorName: invitorData.name,
                invitorEmail: invitorData.email,
                collaboratorEmail: collaboratorData.email,
                collaboratorName: collaboratorData.name,
                projectTitle: project.title,
                projectField: project.field,
                projectDescription: project.description || '',
                accessRole: req.body.access_role,
                projectId: projectId,
            });
            
            emailSent = true;
            console.log(`✅ Invitation email sent to ${collaboratorData.email}`);
        } catch (emailErr) {
            // Log email error but don't fail the request
            emailError = emailErr.message;
            console.error('❌ Failed to send invitation email:', emailErr);
        }

        // 6. Return success response
        return res.status(200).json({ 
            message: 'Collaborator invited successfully',
            emailSent: emailSent,
            ...(emailError && { emailError: 'Email notification failed to send' })
        });

    } catch (error) {
        console.error('Server error in inviteCollaborator:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};

exports.getCollaborators = async (req, res) => {
    try {
        const { projectID } = req.params;

        if (!projectID) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        // Check if project exists
        const { data: projectData, error: projectError } = await Project.findProjectById(projectID);
        
        if (projectError) {
            console.error("Error fetching project:", projectError);
            return res.status(500).json({ error: "Error fetching project: " + projectError.message });
        }

        if (!projectData || !projectData.length) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Get all collaborators
        const { data: allCollaborators, error: collaboratorsError } = await Project.getCollaborators(projectID);
        
        if (collaboratorsError) {
            console.error("Error fetching collaborators:", collaboratorsError);
            return res.status(500).json({ error: "Error fetching collaborators: " + collaboratorsError.message });
        }

        // Filter accepted collaborators
        const acceptedCollaborators = allCollaborators.filter(
            collaborator => collaborator.invitation === "accepted"
        );

        return res.status(200).json({ 
            collaborators: allCollaborators,
            acceptedCollaborators: acceptedCollaborators
        });

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ error: "Server error: " + error.message });
    }
};
exports.removeCollaborator = async (req, res) => {
    const projectId = req.params.projectID;
    const collaboratorId = req.params.collaboratorId;
    // check if exists
    const { data: projectData, error: projectError } = await Project.findProjectById(projectId);
    if (projectError) {
        console.error(projectError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!projectData.length) {
        return res.status(404).json({ error: 'Project not found' });
    }
    const { data, error } = await Project.removeCollaborator(projectId, collaboratorId);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Collaborator removed successfully' });
}

exports.fetchUserAccess = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.jwt.id; // Assuming user ID comes from auth middleware

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // First, check if the user is the owner of the project
        const { data: projectData, error: projectError } = await supabase
            .from("survey_project")
            .select("user_id")
            .eq("project_id", projectId)
            .single();

        if (projectError) {
            console.error("Error fetching project:", projectError);
            return res.status(500).json({ error: "Error fetching project: " + projectError.message });
        }

        if (!projectData) {
            return res.status(404).json({ error: "Project not found" });
        }

        // If the user is the owner
        if (projectData.user_id === userId) {
            return res.status(200).json({
                access_role: "owner",
                is_owner: true
            });
        }

        // If not owner, check if they are a collaborator
        const { data: collaboratorData, error: collaboratorError } = await supabase
            .from("project_shared_with_collaborator")
            .select("access_role, invitation")
            .eq("project_id", projectId)
            .eq("user_id", userId)
            .eq("invitation", "accepted") // Only accepted invitations
            .single();

        if (collaboratorError) {
            // If no row found, user has no access
            if (collaboratorError.code === 'PGRST116') {
                return res.status(403).json({ 
                    error: "Access denied. You do not have permission to access this project.",
                    access_role: null
                });
            }
            
            console.error("Error fetching collaborator data:", collaboratorError);
            return res.status(500).json({ error: "Error fetching access data: " + collaboratorError.message });
        }

        // Return the collaborator's access role
        return res.status(200).json({
            access_role: collaboratorData.access_role, // "editor" or "viewer"
            is_owner: false
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

function generateSlug(survey_title, survey_id, survey_status) {
  const hash = crypto.createHash("sha256");
  hash.update(`${survey_id}-${survey_status}-${survey_title}`);
  const hashValue = hash.digest("hex");

  const currentTime = Date.now().toString();
  const randomValue = Math.floor(Math.random() * 1e6).toString();
  const title_hash = crypto
    .createHash("sha256")
    .update(survey_title)
    .digest("hex")
    .slice(0, 10);
  const currentTime_hash = crypto
    .createHash("sha256")
    .update(currentTime)
    .digest("hex")
    .slice(0, 10);
  const randomValue_hash = crypto
    .createHash("sha256")
    .update(randomValue)
    .digest("hex")
    .slice(0, 10);
  const final_hash = `${hashValue}-${title_hash}-${currentTime_hash}-${randomValue_hash}`;

  return `${final_hash}`;
}

