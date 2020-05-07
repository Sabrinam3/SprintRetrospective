import React from "react";
import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import { useHistory } from "react-router-dom";

const NavBarProject = (props) => {
  const history = useHistory();

  const reRoute = () => {
    history.push({
      pathname: "/sprints",
      displayToastMessage: props.displayToastMessage,
      refreshProjects: props.refreshProjects,
      state: { projectId: props.project.id, projectName: props.project.name },
    });
  };

  return (
    <List style={{ margin: 0, padding: 0 }} onClick={reRoute}>
      <ListItem button key={props.project.id}>
        <ListItemIcon>
          <AccountTreeIcon />
        </ListItemIcon>
        <ListItemText primary={props.project.name} />
      </ListItem>
    </List>
  );
};

export default NavBarProject;
