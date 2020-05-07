import React, { useContext } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Button } from "react-bootstrap";
import { app } from "../firebase";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../firebase/auth";

const TopBar = (props) => {
  const history = useHistory();
  const context = useContext(AuthContext);

  const signOut = () => {
    app.signOut().catch(function (error) {});
    context.setCurrentUser(null);
    history.push("/login");
  };

  return (
    <div style={{ flexGrow: 1, backgroundColor: "white", marginBottom: 50 }}>
      <AppBar position="static" style={{ backgroundColor: "#007bff" }}>
        <Toolbar>
          <Typography style={{ flexGrow: 1 }}>
            Logged in as: {props.user}
          </Typography>
          <Button variant="light" onClick={signOut}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default TopBar;
