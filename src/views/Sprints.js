import React, { useReducer, useEffect, useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../App.css";
import CardComponent from "../components/CardComponent";
import SprintModal from "../components/SprintModal";
import db from "../services/db_service";
import { AuthContext } from "../firebase/auth";

const Sprints = (props) => {
  const initialState = {
    sprints: [],
    showSprintModal: false,
    update: false, //for modal reuse
    selectedSprint: {},
    refresh: false,
    displayToastMessage: null,
    projectId: "",
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  const context = useContext(AuthContext);

  useEffect(() => {
    if (props.location.state) {
      (async () => {
        let sprints = await db.GetAll(`/projects/${props.location.state.projectId}/sprints`, "Sprints");
        sprints.sort(function (sprinta, sprintb) {
          if (sprinta.startDate < sprintb.startDate) return -1;
          if (sprinta.startDate > sprintb.startDate) return 1;
          return 0;
        });
        setState({
          projectId: props.location.state.projectId,
          displayToastMessage: props.location.displayToastMessage,
          sprints: sprints,
        });
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.update, state.sprints]);

  const toggleSprintModal = async (toToggle) => {
    // To Ensure that sprints are reloaded when updated.
    if (toToggle === false) {
      setState({
        sprints: await db.GetAll(`/projects/${state.projectId}/sprints`, "Sprints"),
      });
    }
    setState({
      showSprintModal: toToggle,
    });
  };
  const sprintCardClick = (sprint) => {
    setState({
      update: true,
      selectedSprint: sprint,
    });

    toggleSprintModal(true);
  };

  const addSprintClickHandler = () => {
    setState({
      update: false,
      selectedSprint: {},
    });

    toggleSprintModal(true);
  };

  const refresh = () => {
    context.setRefresh(!context.refresh);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="pageHead ml-5">{props.location.state.projectName}</h1>
      <div className="projectsGridView">
        <Container>
          <Row>
            {state.sprints.map(function (sprint, index) {
              return (
                <Col lg={4} md={6} sm={12} key={sprint.id}>
                  <div onClick={() => sprintCardClick(sprint)}>
                    <CardComponent
                      data={{
                        cardTitle: `Sprint: ${sprint.sprintTitle}`,
                        cardSub1: `Start Date: ${sprint.startDate}`,
                        cardSub2: `End Date: ${sprint.endDate}`,
                        cardSub3: `Velocity: ${sprint.velocity}`,
                        cardSub4:
                          sprint.percentageComplete !== undefined
                            ? `Percentage Complete: ${sprint.percentageComplete.toFixed(2)} %`
                            : undefined,
                      }}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
      <Button title="Add Sprint" onClick={addSprintClickHandler}>
        Add Sprint
      </Button>
      {state.showSprintModal && (
        <SprintModal
          projectId={state.projectId}
          showSprintModal={state.showSprintModal}
          toggleSprintModal={toggleSprintModal}
          selectedSprint={state.selectedSprint}
          displayToastMessage={state.displayToastMessage}
          update={state.update}
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default Sprints;
