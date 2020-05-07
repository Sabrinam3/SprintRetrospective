import React, { useReducer, useEffect } from "react";
import {
  Modal,
  Button,
  Card,
  Form,
  ListGroup,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";
import { faUserTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import db from "../services/db_service";

const ProjectModal = ({
  selectedProject,
  showProjectModal,
  toggleProjectModal,
  displayToastMessage,
  update,
  refresh,
}) => {
  const initialState = {
    project: selectedProject,
    allTeamMembers: [],
    teamMembers: [],
    teamMember: {
      displayName: "",
    },
    modalMessage: "",
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    //fetch team members that are on this project
    (async () => {
      setState({
        teamMembers: await db.GetAll(
          `/projects/${state.project.id}/teamMembers`,
          "Team Members"
        ),
        allTeamMembers: await db.GetAll(`/teamMembers`),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const updateErrors = function (errors) {
    if (errors.length === 0) {
      setState({
        modalMessage: "",
      });
    } else {
      let message = `Please fill out all fields. [${errors}]`;
      setState({
        modalMessage: message,
      });
    }
  };

  const saveProject = async () => {
    if (validateProject()) {
      let json = await db.Add("/projects", "Project", state.project);
      displayToastMessage(json.msg);
      toggleProjectModal(false);
      refresh();
    }
  };

  const validateProject = () => {
    let errors = [];
    let isValid = true;
    if (!state.project.teamName) {
      isValid = false;
      errors.push("Team Name");
    }
    if (!state.project.teamNumber) {
      isValid = false;
      errors.push("Team Number");
    }
    if (!state.project.productName) {
      isValid = false;
      errors.push("Product Name");
    }
    if (!state.project.startDate) {
      isValid = false;
      errors.push("Start Date");
    }
    if (!state.project.initialVelocity) {
      isValid = false;
      errors.push("Initial Velocity");
    }
    if (!state.project.hrsPerStory) {
      isValid = false;
      errors.push("Hours per Story Point");
    }
    updateErrors(errors);
    return isValid;
  };
  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    let p = { ...state.project, [name]: value };
    setState({
      project: p,
    });
  };
  const updateProject = async () => {
    try {
      let json = await db.Update(`/projects`, "Project", state.project);
      displayToastMessage(json.msg);
      toggleProjectModal(false);
      refresh();
    } catch (error) {
      displayToastMessage(error);
    }
  };
  const deleteProject = async () => {
    try {
      if (
        window.confirm(
          `Are you sure you wish to delete ${state.project.productName}?`
        )
      ) {
        let json = await db.Delete("/projects", state.project.id, "Project");
        displayToastMessage(json.msg);
        toggleProjectModal(false);
        refresh();
      }
    } catch (error) {
      displayToastMessage(error);
    }
  };

  const addTeamMemberToProject = async () => {
    if (
      state.teamMember.uid &&
      !state.teamMembers
        .map((teamMember) => teamMember.uid)
        .includes(state.teamMember.uid)
    ) {
      try {
        let result = await db.Add(
          `/projects/${state.project.id}/teamMembers`,
          "Team Member",
          state.teamMember
        );
        setState({
          modalMessage:
            result.status === 200
              ? "Team Member Added"
              : "Problem Adding Team Member",
          teamMember: {},
        });
      } catch (error) {
        setState({
          modalMessage: error,
        });
      }
      //refresh list
      setState({
        teamMembers: await db.GetAll(
          `/projects/${state.project.id}/teamMembers`,
          "Team Members"
        ),
        teamMember: { displayName: "" },
      });
    } else {
      let message = state.teamMember.uid
        ? "Team Member already assigned to project"
        : "Select a team member to add";
      setState({
        modalMessage: message,
      });
    }
  };

  const deleteTeamMemberFromProject = async (teamMember) => {
    try {
      let result = await db.Delete(
        `/projects/${state.project.id}/teamMembers`,
        teamMember.id,
        "Team Member"
      );
      setState({
        modalMessage:
          result.status === 200
            ? "Team Member Removed"
            : "Problem Removing Team Member",
      });
      //refresh list
      setState({
        teamMembers: await db.GetAll(
          `/projects/${state.project.id}/teamMembers`,
          "Team Members"
        ),
      });
    } catch (error) {
      setState({
        modalMessage: error,
      });
    }
  };

  return (
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showProjectModal}
      onHide={() => toggleProjectModal(false)}
      style={{ marginLeft: 120 }}
      scrollable={true}
    >
      <Modal.Header className="modalHeader">
        <Modal.Title>
          {update && <h3 className="col-12 modal-title">Update Project</h3>}
          {!update && <h3 className="col-12 modal-title">Add Project</h3>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card>
          <Card.Body>
            <Form>
              <Form.Group controlId="formTeamName">
                <Form.Label>Team Name</Form.Label>
                <Form.Control
                  type="text"
                  value={state.project.teamName || ""}
                  name="teamName"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formTeamNumber">
                <Form.Label>Team Number</Form.Label>
                <Form.Control
                  type="text"
                  value={state.project.teamNumber || ""}
                  name="teamNumber"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formProductName">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={state.project.productName || ""}
                  name="productName"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formProjectName">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  onChange={handleInputChange}
                  value={state.project.startDate || ""}
                />
              </Form.Group>

              <Form.Group controlId="formInitialVelocity">
                <Form.Label>Initial Velocity</Form.Label>
                <Form.Control
                  type="text"
                  value={state.project.initialVelocity || ""}
                  name="initialVelocity"
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formHrsPerStory">
                <Form.Label>Hours per Story Point</Form.Label>
                <Form.Control
                  type="text"
                  value={state.project.hrsPerStory || ""}
                  name="hrsPerStory"
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
            <hr />
            {update && (
              <Container>
                <Row>
                  <Col lg={6} md={12}>
                    <h5>Current Team Members: </h5>
                    <div className="scrollView">
                      <ListGroup>
                        {state.teamMembers.map(function (teamMember) {
                          return (
                            <ListGroup.Item
                              action
                              variant="light"
                              onClick={(event) => console.dir(event)}
                              key={teamMember.id}
                            >
                              {teamMember.displayName}
                              <FontAwesomeIcon
                                icon={faUserTimes}
                                size="sm"
                                className="deleteIcon"
                                style={{ marginRight: 15 }}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Are you sure you wish to delete ${teamMember.displayName}?`
                                    )
                                  )
                                    deleteTeamMemberFromProject(teamMember);
                                }}
                              />
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    </div>
                  </Col>
                  <Col lg={6} md={12}>
                    <Form.Group>
                      <Form.Label>Add Team Member</Form.Label>
                      <Autocomplete
                        id="teamMember"
                        options={state.allTeamMembers}
                        value={state.teamMember}
                        getOptionLabel={(option) => option.displayName}
                        style={{ marginBottom: 15 }}
                        onChange={(e, selectedOption) => {
                          setState({
                            teamMember: selectedOption ? selectedOption : {},
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Team Member"
                            variant="outlined"
                            fullWidth
                          />
                        )}
                      />
                    </Form.Group>
                    <Button
                      title="AddTeamMember"
                      onClick={addTeamMemberToProject}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
              </Container>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="modalFooter">
        {update && (
          <Button variant="danger" title="Delete" onClick={deleteProject}>
            Delete
          </Button>
        )}

        <div
          style={{
            flex: 1,
            textAlign: "center",
            width: "100%",
          }}
        >
          <h6 style={{ color: "red" }}>{state.modalMessage}</h6>
        </div>
        {update && (
          <Button title="Update Project" onClick={updateProject}>
            Update
          </Button>
        )}
        {!update && (
          <Button variant="primary" onClick={saveProject}>
            Save
          </Button>
        )}
        <Button variant="secondary" onClick={() => toggleProjectModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectModal;
