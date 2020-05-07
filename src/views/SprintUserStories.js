import React, { useReducer, useEffect, useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../App.css";
import CardComponent from "../components/CardComponent";
import UserStoryModal from "../components/UserStoryModal";
import { AuthContext } from "../firebase/auth";
import db from "../services/db_service";
import "../App.css";

const SprintUserStories = (props) => {
  const initialState = {
    userStories: [],
    teamMembers: [],
    update: false,
    selectedUserStory: {},
    showUserStoryModal: false,
  };

  const projectId = props.location.state.projectId;
  const displayToastMessage = props.location.displayToastMessage;
  const sprintId = props.location.state.sprintId;
  const sprintName = props.location.state.sprintName;

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      setState({
        userStories: await db.GetAll(`/projects/${projectId}/sprints/${sprintId}/userStories`),
        teamMembers: await db.GetAll(`/teamMembers`),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId]);

  const userStoryCardClick = (userStory) => {
    setState({
      update: true,
      selectedUserStory: userStory,
      showUserStoryModal: true,
    });
  };

  const toggleUserStoryModal = async (toToggle) => {
    // To Ensure that user stories are reloaded when updated.
    if (toToggle === false) {
      setState({
        userStories: await db.GetAll(`/projects/${projectId}/sprints/${sprintId}/userStories`),
        showUserStoryModal: toToggle,
      });
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="pageHead ml-5">Sprint: {sprintName}</h1>
      <div className="projectsGridView">
        <Container>
          <h5 className="taskHeader">Your Tasks</h5>
          <Row>
            {state.userStories.map(function (userStory, index) {
              if (userStory.assignee.uid === currentUser.uid) {
                return (
                  <Col lg={4} md={6} sm={12} key={index}>
                    <div onClick={() => userStoryCardClick(userStory)}>
                      <CardComponent
                        data={{
                          cardTitle: userStory.title,
                          cardSub1: "Initial Estimate: " + userStory.initialEstimate,
                          cardSub2: "Status: " + userStory.status,
                          cardSub3: `Team Member: ${userStory.assignee.displayName}`,
                          cardSub4: `Percentage Complete: ${userStory.percentageComplete.toFixed(2)}%`,
                          overDue: userStory.overDue,
                        }}
                      />
                    </div>
                  </Col>
                );
              } else {
                return null;
              }
            })}
          </Row>
          <h5 className="taskHeader">Other Tasks</h5>
          <Row>
            {state.userStories.map(function (userStory, index) {
              if (userStory.assignee.uid !== currentUser.uid) {
                return (
                  <Col lg={4} md={6} sm={12} key={index}>
                    <div onClick={() => userStoryCardClick(userStory)}>
                      <CardComponent
                        data={{
                          cardTitle: userStory.title,
                          cardSub1: "Initial Estimate: " + userStory.initialEstimate,
                          cardSub2: "Status: " + userStory.status,
                          cardSub3: `Team Member: ${userStory.assignee.displayName}`,
                          cardSub4: `Percentage Complete: ${userStory.percentageComplete.toFixed(2)}%`,
                          overDue: userStory.overDue,
                        }}
                      />
                    </div>
                  </Col>
                );
              } else {
                return null;
              }
            })}
          </Row>
        </Container>
      </div>
      {state.showUserStoryModal && (
        <UserStoryModal
          projectId={projectId}
          userStory={state.selectedUserStory}
          showUserStoryModal={state.showUserStoryModal}
          toggleUserStoryModal={toggleUserStoryModal}
          update={state.update}
          displayToastMessage={displayToastMessage}
          backlog={false}
        />
      )}
    </div>
  );
};

export default SprintUserStories;
