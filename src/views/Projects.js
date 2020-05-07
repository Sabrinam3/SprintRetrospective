import React, { useReducer, useEffect, useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../App.css";
import CardComponent from "../components/CardComponent";
import ProjectModal from "../components/ProjectModal";
import db from "../services/db_service";
import { AuthContext } from "../firebase/auth";
import util from "../services/util";

const Projects = (props) => {
  const initialState = {
    projects: [],
    showProjectModal: false,
    selectedProject: {},
    update: false,
  };

  const context = useContext(AuthContext);

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);
  const displayToastMessage = props.displayToastMessage;

  useEffect(() => {
    (async () => {
      setState({
        projects: await db.GetAll("/projects", "Projects"),
      });
    })();
    util.checkOutdatedSprints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const toggleProjectModal = async (toToggle) => {
    // To Ensure that projects are reloaded when added.
    if (toToggle === false) {
      setState({
        projects: await db.GetAll("/projects", "Projects"),
        showProjectModal: toToggle,
      });
    }
  };

  const projectCardClick = (project) => {
    setState({
      update: true,
      selectedProject: project,
      showProjectModal: true,
    });

    toggleProjectModal(true);
  };

  const addProjectClickHandler = () => {
    setState({
      update: false,
      selectedProject: {},
      showProjectModal: true,
    });
  };

  const refresh = () => {
    context.setRefresh(!context.refresh);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="pageHead ml-5">Projects</h1>
      <div className="projectsGridView">
        <Container>
          <Row>
            {state.projects.map(function (project, index) {
              return (
                <Col lg={4} md={6} sm={12} key={index}>
                  <div onClick={() => projectCardClick(project)}>
                    <CardComponent
                      data={{
                        cardTitle: project.productName,
                        cardSub1: "Team: " + project.teamName,
                        cardSub2: "Start Date: " + project.startDate,
                      }}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
      <Button title="Add Project" onClick={addProjectClickHandler}>
        Add Project
      </Button>
      {state.showProjectModal && (
        <ProjectModal
          showProjectModal={state.showProjectModal}
          toggleProjectModal={toggleProjectModal}
          displayToastMessage={displayToastMessage}
          update={state.update}
          selectedProject={state.selectedProject}
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default Projects;
