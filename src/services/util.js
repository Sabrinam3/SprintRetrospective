import db from "./db_service";

const CalculateSprintCompletion = async (projectId, sprintId) => {
  let sprint = (
    await db.GetById(`/projects/${projectId}/sprints`, sprintId, "Sprints")
  ).payload;
  let completed = 0;
  let userStories = await db.GetAll(
    `projects/${projectId}/sprints/${sprintId}/userStories`
  );
  try {
    if (userStories) {
      for (var x = 0; x < userStories.length; ++x)
        if (userStories[x].status === "Delivered") completed++;

      // Update the sprint in the db
      if (completed === 0) {
        sprint.percentageComplete = 0;
      } else {
        sprint.percentageComplete = (completed / userStories.length) * 100;
      }
      await db.Update(`projects/${projectId}/sprints`, "Sprints", sprint);
    }
  } catch (err) {
    console.log("ERROR: " + err);
  }
};

const CalculateProjectCompletion = async (projectId) => {
  let project = await db.GetById(`/projects/${projectId}`);
  let total = 0;
  for (var x = 0; x < project.sprints.length; ++x)
    total += project.sprints[x].percentageComplete;

  return (total / project.sprints.length) * 100;
};

const compareDates = (sprintEndDateP) => {
  sprintEndDateP = new Date(sprintEndDateP);
  let today = new Date();

  if (sprintEndDateP <= today) return true;
  else return false;
};

const checkOutdatedSprints = async () => {
  let projects = [];
  let sprints = [];

  //call fetch projects
  projects = await db.GetAll("/projects", "Projects");

  //for each project get the sprints
  projects.map(async (project) => {
    sprints = await db.GetAll(`/projects/${project.id}/sprints`, "Sprints");

    //for each sprint get the user stories
    sprints.map(async (sprint) => {
      let userStories = await db.GetAll(
        `/projects/${project.id}/sprints/${sprint.id}/userStories`
      );
      // var sprintEndDate = new Date(sprint.endDate);
      // var today = new Date(date);

      // if the sprint has ended
      if (compareDates(sprint.endDate)) {
        userStories.map(async (story) => {
          if (story.status === "Started") {
            if (!story.cloned) {
              // clone the story and put it into the backlog & reset time left reset it to planned
              let clone = Object.assign(story);
              clone.overDue = true;
              clone.status = "Planned";
              clone.initialEstimate = 0;
              clone.hoursCompleted = 0;
              clone.percentageComplete = 0;
              clone.sprints = [];

              let clonedPath = `/projects/${project.id}/backlog`;
              let originalPath = `/projects/${project.id}/sprints/${sprint.id}/userStories`;

              //clone it
              await db.Add(clonedPath, "User Story", clone);

              // then mark the original as cloned
              let originalCloned = story;
              originalCloned.cloned = true;
              await db.Update(originalPath, "User Story", originalCloned);
            }
          }
        });
      }
    });
  });
};

export default {
  CalculateSprintCompletion,
  CalculateProjectCompletion,
  checkOutdatedSprints,
  compareDates,
};
