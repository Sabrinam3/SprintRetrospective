import React, { useEffect } from "react";
import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import { useHistory } from "react-router-dom";

const NavBarBacklog = (props) => {
  const history = useHistory();

  const reRoute = () => {
    history.push({
      pathname: "/productbacklog",
      displayToastMessage: props.displayToastMessage,
      state: { projectId: props.project.id },
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.projects]);

  return (
    <List style={{ margin: 0, padding: 0 }} onClick={reRoute}>
      <ListItem button>
        <ListItemIcon>
          <MenuBookIcon />
        </ListItemIcon>
        <ListItemText primary="Product Backlog" />
      </ListItem>
    </List>
  );
};

export default NavBarBacklog;
