import React, { useReducer, useEffect } from "react";
import { List } from "@material-ui/core";
import db from "../../services/db_service";
import NavBarSprintClickable from "./NavBarSprintClickable";

const NavBarSprint = (props) => {
  const initialState = {
    sprints: [],
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      setState({
        sprints: await db.GetAll(`/projects/${props.project.id}/sprints`),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.projects]);

  return (
    <List style={{ margin: 0, padding: 0 }}>
      {state.sprints.map(function (sprint) {
        return (
          <NavBarSprintClickable
            projectId={props.project.id}
            sprint={sprint}
            key={sprint.id}
            refreshProjects={props.refreshProjects}
            displayToastMessage={props.displayToastMessage}
          />
        );
      })}
    </List>
  );
};

export default NavBarSprint;
