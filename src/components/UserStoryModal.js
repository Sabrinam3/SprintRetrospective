import React, { useReducer, useEffect } from "react";
import { Modal, Button, Card, Form } from "react-bootstrap";
import db from "../services/db_service";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";
import util from "../services/util";

const UserStoryModal = ({
  projectId,
  userStory,
  showUserStoryModal,
  toggleUserStoryModal,
  update,
  displayToastMessage,
  backlog,
}) => {
  const initialState = {
    userStory: userStory,
    project: {},
    selectedSprint: {},
    selectedTeamMember: {},
    errorMessage: [],
    sprints: [],
    teamMembers: [],
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        //Find sprints associated with this project
        let sprints = await db.GetAll(`/projects/${projectId}/sprints`);
        //get rid of option to add user story to outdated sprint
        sprints = sprints.filter((sprint) => {
          return !util.compareDates(sprint.endDate);
        });

        //Find team members that are on the project
        let teamMembers = await db.GetAll(`/projects/${projectId}/teamMembers`);

        //Find the project associated with this user story
        let project = await db.GetById(`/projects`, projectId, "Project");

        //If the user story is in a sprint, set selectedSprint to initial value
        let selectedSprint = {};
        if (userStory.sprints && userStory.sprints.length > 0) {
          selectedSprint = userStory.sprints[userStory.sprints.length - 1];
        }
        setState({
          sprints: sprints,
          teamMembers: teamMembers,
          project: project.payload,
          selectedSprint: selectedSprint,
        });
        updateErrors(state.errorMessage);
      } catch (error) {
        displayToastMessage(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    let u = state.userStory;
    u[name] = value;
    if (u.status === "Delivered") {
      u.percentageComplete = 100;
    } else {
      u = updatePercentageComplete(u, value);
    }
    setState({
      userStory: u,
    });
  };

  const updatePercentageComplete = (u, value) => {
    let estimate = state.userStory.initialEstimate * state.project.hrsPerStory;
    let ratio = value / estimate;
    // Intentionally allowed percentageComplete go past 100 for UI trigger
    u["percentageComplete"] = ratio * 100;
    return u;
  };

  const onChangeAutocomplete = (e, selectedOption, field) => {
    switch (field) {
      case "status":
      case "initialEstimate":
        let u = state.userStory;
        u[field] = selectedOption;
        u = updatePercentageComplete(u, u.hoursComplete);
        setState({
          userStory: u,
        });
        break;
      case "sprint":
        setState({
          selectedSprint: selectedOption ? selectedOption : {},
        });
        break;
      case "teamMember":
        setState({
          selectedTeamMember: selectedOption ? selectedOption : {},
        });
        break;
      default:
        break;
    }
  };

  const updateErrors = function (errors) {
    if (errors.length === 0) {
      setState({
        errorMessage: "",
      });
    } else {
      let message = `Please fill out all fields. [${errors}]`;
      setState({
        errorMessage: message,
      });
    }
  };

  const saveUserStory = async () => {
    if (validateUserStory()) {
      let u = state.userStory;
      u.sprints = []; //sprint history
      u.status = state.userStory.status ? state.userStory.status : "Planned";
      //assignee
      if (state.selectedTeamMember.uid) {
        u.assignee = state.selectedTeamMember;
      }
      //sprint
      if (state.selectedSprint.id) {
        u.sprints.push(state.selectedSprint);
      }
      u.hoursComplete = 0;
      u.overDue = false;
      u.cloned = false;
      u.percentageComplete = 0;
      //If assigned to Sprint, add the User Story to the sprint, else the backlog
      let collectionPath = state.selectedSprint.sprintTitle
        ? `/projects/${projectId}/sprints/${state.selectedSprint.id}/userStories`
        : `/projects/${projectId}/backlog`;

      let json = await db.Add(collectionPath, "User Story", u);
      let toastMessage = state.selectedSprint.sprintTitle
        ? `${json.msg} and moved to Sprint ${state.selectedSprint.sprintTitle}`
        : json.msg;
      displayToastMessage(toastMessage);
      toggleUserStoryModal(false);
      let sprints = state.userStory.sprints;
      if (state.selectedSprint.id)
        util.CalculateSprintCompletion(
          projectId,
          sprints[sprints.length - 1].id
        );
    }
  };

  const updateUserStory = async () => {
    if (validateUserStory()) {
      try {
        if (state.userStory.status === "Delivered") {
          let sprints = state.userStory.sprints;
          let u = state.userStory;
          u.percentageComplete = 100;
          setState({
            userStory: u,
          });
          util.CalculateSprintCompletion(
            projectId,
            sprints[sprints.length - 1].id
          );
        } else {
          let u = state.userStory;
          u = updatePercentageComplete(u, u.hoursComplete);
          setState({
            userStory: u,
          });
        }
        if (backlog) {
          updateUserStoryInBacklog();
        } else {
          updateUserStoryInSprint();
          await util.CalculateSprintCompletion(
            projectId,
            state.selectedSprint.id
          );
        }
      } catch (error) {
        displayToastMessage(error);
      }
    }
  };

  const updateUserStoryInBacklog = async () => {
    let currentSprintId =
      state.userStory.sprints.length > 0
        ? state.userStory.sprints[state.userStory.sprints.length - 1].id
        : 0;

    //Check if the sprint has changed
    if (
      state.selectedSprint.id &&
      state.selectedSprint.id !== currentSprintId
    ) {
      let u = state.userStory;
      u.sprints.push(state.selectedSprint);
      u.assignee = state.selectedTeamMember;
      u.overDue = false;
      u.cloned = false;
      let result = await db.Add(
        `/projects/${projectId}/sprints/${state.selectedSprint.id}/userStories`,
        "User Story",
        u
      );
      //If add operation succeeded, remove from the backlog
      if (result.status === 200) {
        await db.Delete(
          `/projects/${projectId}/backlog`,
          state.userStory.id,
          "User Story"
        );

        displayToastMessage(
          `User Story Updated and moved to Sprint ${state.selectedSprint.sprintTitle}`
        );
      }
    }
    //else just a regular field has updated
    else {
      let result = await db.Update(
        `/projects/${projectId}/backlog`,
        "User Story",
        state.userStory
      );
      displayToastMessage(result.msg);
    }
    toggleUserStoryModal(false);
  };

  const updateUserStoryInSprint = async () => {
    //Get the id of the sprint the user story is currently assigned to (before update)
    let currentSprintId =
      state.userStory.sprints[state.userStory.sprints.length - 1].id;
    let u = state.userStory;
    //check if the assignee has changed
    if (
      state.selectedTeamMember.uid &&
      state.userStory.assignee.uid !== state.selectedTeamMember.uid
    ) {
      u.assignee = state.selectedTeamMember;
    }
    //Check if the sprint has changed
    if (state.selectedSprint.id !== currentSprintId) {
      //Add this new sprint to the User Story's history
      u.sprints.push(state.selectedSprint);
      //Add User Story to New Sprint
      let result = await db.Add(
        `/projects/${projectId}/sprints/${state.selectedSprint.id}/userStories`,
        "User Story",
        u
      );
      //If add operation was successful, remove from old sprint
      if (result.status === 200) {
        await db.Delete(
          `/projects/${projectId}/sprints/${currentSprintId}/userStories`,
          state.userStory.id,
          "User Story"
        );
        displayToastMessage(
          `User Story Updated and moved to Sprint ${state.selectedSprint.sprintTitle}`
        );
      }
    }
    //else just a regular field has updated
    else {
      let result = await db.Update(
        `/projects/${projectId}/sprints/${currentSprintId}/userStories`,
        "User Story",
        state.userStory
      );
      displayToastMessage(result.msg);
    }
    toggleUserStoryModal(false);
  };
  const deleteUserStory = async () => {
    try {
      if (
        window.confirm(
          `Are you sure you wish to delete ${state.userStory.title}?`
        )
      ) {
        //If user story is in a sprint, delete from there
        if (state.userStory.sprints.length > 0) {
          let sprintId =
            state.userStory.sprints[state.userStory.sprints.length - 1].id;
          let json = await db.Delete(
            `/projects/${projectId}/sprints/${sprintId}/userStories`,
            state.userStory.id,
            "User Story"
          );
          displayToastMessage(json.msg);
        }
        //delete from the backlog
        else {
          let json = await db.Delete(
            `/projects/${projectId}/backlog`,
            state.userStory.id,
            "User Story"
          );
          displayToastMessage(json.msg);
        }
        toggleUserStoryModal(false);
      }
    } catch (error) {
      displayToastMessage(error);
    }
  };

  const validateUserStory = () => {
    let errors = [];
    let isValid = true;

    if (!state.userStory.title) {
      isValid = false;
      errors.push("Title");
    }
    if (!state.userStory.initialEstimate) {
      isValid = false;
      errors.push("Initial Estimate");
    }

    if (
      update &&
      state.userStory.hoursComplete &&
      /[^0-9]/g.test(state.userStory.hoursComplete)
    ) {
      isValid = false;
      errors.push("Hours Complete[Positive Numbers only]");
    }
    //user story should not be assigned to a sprint unless it has an assignee
    if (
      state.selectedSprint.id &&
      !state.userStory.assignee &&
      !state.selectedTeamMember.uid
    ) {
      isValid = false;
      errors.push("User Story must be assigned before moving to a Sprint");
    }
    updateErrors(errors);
    return isValid;
  };

  const getSprintLabel = (option) => {
    return option.sprintTitle
      ? `Sprint ${option.sprintTitle} - ${option.startDate}`
      : "";
  };

  return (
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showUserStoryModal}
      onHide={() => toggleUserStoryModal(false)}
      style={{ marginLeft: 120 }}
    >
      <Modal.Header className="modalHeader">
        <Modal.Title>
          {update ? "Update User Story" : "Add User Story"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card>
          <Card.Body>
            <Form>
              <Form.Group controlId="formTitle">
                <Form.Label>User Story Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Title"
                  name="title"
                  value={state.userStory.title ? state.userStory.title : ""}
                  onChange={handleInputChange}
                  disabled={state.userStory.overDue && !backlog}
                />
              </Form.Group>

              <Form.Group controlId="formInitialEstimate">
                <Form.Label>
                  {state.userStory.overDue ? "Re-Estimate" : "Initial Estimate"}
                </Form.Label>
                <Autocomplete
                  id="initialEstimate"
                  value={
                    state.userStory.initialEstimate
                      ? state.userStory.initialEstimate
                      : ""
                  }
                  options={["0.5", "1", "2", "3", "5", "8", "13"]}
                  getOptionLabel={(option) => option}
                  style={{ marginBottom: 15 }}
                  onChange={(event, selectedOption) =>
                    onChangeAutocomplete(
                      event,
                      selectedOption,
                      "initialEstimate"
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Story Points"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  disabled={state.userStory.overDue && !backlog}
                />
              </Form.Group>

              {update && (
                <Form.Group controlId="formHoursComplete">
                  <Form.Label>Hours Complete</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Hours Complete"
                    name="hoursComplete"
                    value={state.userStory.hoursComplete}
                    onChange={handleInputChange}
                    disabled={state.userStory.overDue && !backlog}
                  />
                </Form.Group>
              )}

              {update && (
                <Form.Group controlId="formPercentageComplete">
                  <Form.Label>Percentage Complete</Form.Label>
                  <Form.Control
                    type="text"
                    name="percentageComplete"
                    value={
                      state.userStory.percentageComplete
                        ? state.userStory.percentageComplete.toFixed(2) + " %"
                        : undefined
                    }
                    disabled={true}
                  />
                </Form.Group>
              )}

              <Form.Group controlId="formProject">
                <Form.Label>Project</Form.Label>
                <Form.Control
                  type="text"
                  value={state.project.productName || ""}
                  name="projectName"
                  disabled={true}
                />
              </Form.Group>

              <Autocomplete
                id="status"
                value={
                  state.userStory.status ? state.userStory.status : "Planned"
                }
                options={["Planned", "Started", "Delivered"]}
                getOptionLabel={(option) => option}
                style={{ marginBottom: 15 }}
                onChange={(event, selectedOption) =>
                  onChangeAutocomplete(event, selectedOption, "status")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    variant="outlined"
                    fullWidth
                  />
                )}
                disabled={state.userStory.overDue && !backlog}
              />

              <Autocomplete
                id="sprints"
                value={state.selectedSprint ? state.selectedSprint : ""}
                options={state.sprints}
                getOptionLabel={(option) => getSprintLabel(option)}
                style={{ marginBottom: 15 }}
                onChange={(event, selectedOption) =>
                  onChangeAutocomplete(event, selectedOption, "sprint")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sprints"
                    variant="outlined"
                    fullWidth
                  />
                )}
                disabled={state.userStory.overDue && !backlog}
              />

              <Form.Group>
                <Autocomplete
                  id="teammembers"
                  value={
                    state.userStory.assignee ? state.userStory.assignee : ""
                  }
                  options={state.teamMembers}
                  getOptionLabel={(option) =>
                    option && option.displayName ? option.displayName : ""
                  }
                  style={{ marginBottom: 25 }}
                  onChange={(event, selectedOption) =>
                    onChangeAutocomplete(event, selectedOption, "teamMember")
                  }
                  disabled={
                    state.selectedSprint.id === undefined ||
                    state.userStory.cloned
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned To"
                      variant="outlined"
                      value={
                        state.userStory.assignee
                          ? state.userStory.assignee.displayName
                          : ""
                      }
                      fullWidth
                    />
                  )}
                />
              </Form.Group>

              <Card.Text style={{ color: "red" }}>
                {state.errorMessage}
              </Card.Text>
            </Form>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="modalFooter">
        {update && (
          <Button variant="danger" title="Delete" onClick={deleteUserStory}>
            Delete
          </Button>
        )}

        {update && !state.userStory.overDue && (
          <Button title="Update User Story" onClick={updateUserStory}>
            Update
          </Button>
        )}

        {!update && !state.userStory.overDue && (
          <Button title="Add User Story" onClick={saveUserStory}>
            Save
          </Button>
        )}

        <Button variant="secondary" onClick={() => toggleUserStoryModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserStoryModal;
