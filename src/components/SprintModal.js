import React, { useReducer, useEffect } from "react";
import { Modal, Button, Card, Form } from "react-bootstrap";
import db from "../services/db_service";

// Add arg of velocity to calculate hours validation
const SprintModal = ({
  projectId,
  selectedSprint,
  showSprintModal,
  toggleSprintModal,
  displayToastMessage,
  update,
  refresh,
}) => {
  const initialState = {
    sprint: selectedSprint,
    errorMessage: [],
    projectName: "",
    modalTitle: "",
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);
  useEffect(() => {
    (async () => {
      try {
        let project = await db.GetById("/projects", projectId, "Project");
        setState({
          projectName: project.payload.productName,
          modalTitle: update ? "Update Sprint" : "Add New Sprint",
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

    let s = state.sprint;
    s[name] = value;
    setState({
      sprint: s,
    });
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

  const saveSprint = async () => {
    if (validateSprint()) {
      let s = state.sprint;
      s.percentageComplete = 0;
      let json = await db.Add(`projects/${projectId}/sprints`, "Sprint", s);
      displayToastMessage(json.msg);
      if (json.status === 200) toggleSprintModal(false);
      refresh();
    }
  };

  const updateSprint = async () => {
    try {
      let json = await db.Update(
        `/projects/${projectId}/sprints`,
        "Sprint",
        state.sprint
      );
      displayToastMessage(json.msg);
      toggleSprintModal(false);
      refresh();
    } catch (error) {
      displayToastMessage(error);
    }
  };

  const deleteSprint = async () => {
    try {
      if (
        window.confirm(
          `Are you sure you wish to delete Sprint ${state.sprint.sprintTitle}?`
        )
      ) {
        let json = await db.Delete(
          `/projects/${projectId}/sprints`,
          state.sprint.id,
          "Sprint"
        );
        displayToastMessage(json.msg);
        toggleSprintModal(false);
        refresh();
      }
    } catch (error) {
      displayToastMessage(error);
    }
  };

  const validateSprint = () => {
    let errors = [];
    let isValid = true;
    if (!state.sprint.sprintTitle) {
      isValid = false;
      errors.push("Sprint Title");
    }
    if (!state.sprint.velocity) {
      isValid = false;
      errors.push("Velocity");
    }
    if (!state.sprint.startDate) {
      isValid = false;
      errors.push("Start Date");
    }
    if (!state.sprint.endDate) {
      isValid = false;
      errors.push("End Date");
    }
    if (state.sprint.startDate > state.sprint.endDate) {
      isValid = false;
      errors.push("Start date should not be after end date");
    }

    updateErrors(errors);
    return isValid;
  };

  return (
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showSprintModal}
      onHide={() => toggleSprintModal(false)}
      style={{ marginLeft: 120 }}
    >
      <Modal.Header className="modalHeader">
        <Modal.Title>{state.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card>
          <Card.Body>
            <Form>
              <Form.Group controlId="formProject">
                <Form.Label>Project</Form.Label>
                <Form.Control
                  type="text"
                  value={state.projectName}
                  name="projectName"
                  disabled={true}
                />
              </Form.Group>
              <Form.Group controlId="formTitle">
                <Form.Label>Sprint Title</Form.Label>
                <Form.Control
                  type="text"
                  value={state.sprint.sprintTitle || ""}
                  name="sprintTitle"
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formVelocity">
                <Form.Label>Velocity</Form.Label>
                <Form.Control
                  type="text"
                  value={state.sprint.velocity || ""}
                  name="velocity"
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formPercentageComplete">
                <Form.Label>Percentage Complete</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    state.sprint.percentageComplete
                      ? state.sprint.percentageComplete.toFixed(2) + " %"
                      : 0
                  }
                  name="percentageComplete"
                  disabled={true}
                />
              </Form.Group>
              <Form.Group controlId="formStartDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={state.sprint.startDate || ""}
                  name="startDate"
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEndDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={state.sprint.endDate || ""}
                  name="endDate"
                  onChange={handleInputChange}
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
          <Button variant="danger" title="Delete" onClick={deleteSprint}>
            Delete
          </Button>
        )}

        {update && (
          <Button title="Update User Story" onClick={updateSprint}>
            Update
          </Button>
        )}
        {!update && (
          <Button title="Add User Story" onClick={saveSprint}>
            Save
          </Button>
        )}

        <Button variant="secondary" onClick={() => toggleSprintModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SprintModal;
