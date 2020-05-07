import React from "react";
import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import { useHistory } from "react-router-dom";

const NavBarHome = (props) => {
  const history = useHistory();

  const reRoute = () => {
    history.push({
      pathname: "/home",
      displayToastMessage: props.displayToastMessage,
    });
  };

  return (
    <List style={{ margin: 0, padding: 0 }} onClick={reRoute}>
      <ListItem button>
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItem>
    </List>
  );
};

export default NavBarHome;
