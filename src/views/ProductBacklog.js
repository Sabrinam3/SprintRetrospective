import React, { useReducer, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../App.css";
import CardComponent from "../components/CardComponent";
import UserStoryModal from "../components/UserStoryModal";
import db from "../services/db_service";

const ProductBacklog = (props) => {
  const initialState = {
    userStories: [],
    selectedUserStory: {},
    showUserStoryModal: false,
    update: false,
    projectId: "",
    displayToastMessage: "",
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    if (props.location.state) {
      (async () => {
        setState({
          projectId: props.location.state.projectId,
          displayToastMessage: props.location.displayToastMessage,
          userStories: await db.GetAll(
            `/projects/${props.location.state.projectId}/backlog`
          ),
        });
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.projectId]);

  const userStoryCardClick = (userStory) => {
    setState({
      update: true,
      selectedUserStory: userStory,
      showUserStoryModal: true,
    });
  };

  const addUserStoryClickHandler = () => {
    setState({
      update: false,
      selectedUserStory: {},
      showUserStoryModal: true,
    });
  };

  const toggleUserStoryModal = async (toToggle) => {
    // To Ensure that user stories are reloaded when updated.
    if (toToggle === false) {
      setState({
        userStories: await db.GetAll(`/projects/${state.projectId}/backlog`),
        showUserStoryModal: toToggle,
      });
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="pageHead ml-5">Product Backlog</h1>
      <div className="projectsGridView">
        <Container>
          <Row>
            {state.userStories.map(function (userStory, index) {
              return (
                <Col lg={4} md={6} sm={12} key={userStory.id}>
                  <div onClick={() => userStoryCardClick(userStory)}>
                    <CardComponent
                      data={{
                        cardTitle: userStory.title,
                        cardSub1:
                          "Initial Estimate: " + userStory.initialEstimate,
                        cardSub2: "Status: " + userStory.status,
                        cardSub3: userStory.teamMember
                          ? `Team Member: ${userStory.teamMember.name}`
                          : undefined,
                        overDue: userStory.overDue,
                      }}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
      <Button title="Add User Story" onClick={addUserStoryClickHandler}>
        Add User Story
      </Button>
      {state.showUserStoryModal && (
        <UserStoryModal
          projectId={state.projectId}
          userStory={state.selectedUserStory}
          showUserStoryModal={state.showUserStoryModal}
          toggleUserStoryModal={toggleUserStoryModal}
          update={state.update}
          displayToastMessage={state.displayToastMessage}
          backlog={true}
        />
      )}
    </div>
  );
};

export default ProductBacklog;
