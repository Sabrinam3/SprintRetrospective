import React, { useEffect, useReducer, useContext } from "react";
import "../App.css";
import db from "../services/db_service";
import NavBarSprint from "./NavBarComponents/NavBarSprint";
import NavBarProject from "./NavBarComponents/NavBarProject";
import NavBarBacklog from "./NavBarComponents/NavBarBacklog";
import NavBarHome from "./NavBarComponents/NavBarHome";
import TopBar from "./TopBar";
import { AuthContext } from "../firebase/auth";
import { Drawer, Divider, makeStyles, CssBaseline } from "@material-ui/core";

function NavBar(props) {
  const initialState = {
    projects: [],
    displayName: "",
  };

  const { currentUser, refresh } = useContext(AuthContext);

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      let teamMembers = await db.GetAll("/teamMembers", "Team Members");
      if (currentUser != null) {
        setState({
          displayName: teamMembers.find(
            (teamMember) => teamMember.uid === currentUser.uid
          ).displayName,
        });
      }
      createData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, refresh]);

  const createData = async () => {
    setState({
      projects: [],
    });
    let projects = await db.GetAll("/projects", "projects");

    let formattedProjects = [];

    //foreach project go and get the sprints and then add them to the array
    projects.forEach(function (project) {
      let data = {
        id: null,
        name: null,
      };

      data.id = project.id;
      data.name = project.productName;
      formattedProjects.push(data);
    });

    setState({
      projects: formattedProjects,
    });
  };

  const drawerWidth = 240;

  const useStyles = makeStyles((theme) => ({
    root: {
      marginLeft: 240,
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    toolbar: theme.mixins.toolbar,
    content: {
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  }));

  const classes = useStyles();

  return (
    <div>
      {currentUser !== null && (
        <div>
          <TopBar user={state.displayName}></TopBar>
          <CssBaseline />
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left"
          >
            <div className={classes.toolbar} />
            <Divider />
            <NavBarHome />
            <Divider />
            {state.projects.map(function (project) {
              return (
                <div style={{ marginBottom: 20 }} key={project.id}>
                  <NavBarProject
                    project={project}
                    displayToastMessage={props.displayToastMessage}
                    refreshProjects={props.refreshProjects}
                  />
                  <NavBarBacklog
                    project={project}
                    displayToastMessage={props.displayToastMessage}
                    refreshProjects={props.projects}
                  />
                  <NavBarSprint
                    project={project}
                    displayToastMessage={props.displayToastMessage}
                    refreshProjects={props.projects}
                  />
                </div>
              );
            })}

            <Divider />
          </Drawer>
        </div>
      )}
    </div>
  );
}

export default NavBar;
