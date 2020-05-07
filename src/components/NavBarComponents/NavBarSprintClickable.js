import React from "react";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import { Link } from "react-router-dom";

const NavBarSprintClickable = (props) => {
  return (
    <Link
      style={{ textDecoration: "none", color: "black" }}
      to={{
        pathname: "/sprintuserstories",
        displayToastMessage: props.displayToastMessage,
        state: {
          projectId: props.projectId,
          sprintId: props.sprint.id,
          sprintName: props.sprint.sprintTitle,
        },
      }}
    >
      <ListItem button key={props.sprint.id}>
        <ListItemIcon>
          <DirectionsRunIcon />
        </ListItemIcon>
        <ListItemText primary={`Sprint: ${props.sprint.sprintTitle}`} />
      </ListItem>
    </Link>
  );
};

export default NavBarSprintClickable;
