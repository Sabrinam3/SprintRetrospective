import React, { useState } from "react";

import Projects from "./views/Projects";
import Login from "./views/Login";
import ProductBacklog from "./views/ProductBacklog";
import Sprints from "./views/Sprints";
import SprintUserStories from "./views/SprintUserStories";
import { AuthProvider } from "./firebase/auth";
import { Toast } from "react-bootstrap";
import { Route, Redirect } from "react-router-dom";
import NavBar from "./components/NavBar";
import "./App.css";

function App() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const displayToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <div style={{ marginLeft: 240 }}>
      <AuthProvider>
        <div>
          <NavBar displayToastMessage={displayToastMessage} />
          <div>
            <Route exact path="/" render={() => <Redirect to="/home" />} />
            <Route exact path="/login" render={() => <Login />} />
            <Route exact path="/home" render={() => <Projects displayToastMessage={displayToastMessage} />} />
            <Route exact path="/productbacklog" component={ProductBacklog} />
            <Route exact path="/sprints" component={Sprints} />
            <Route exact path="/sprintuserstories" component={SprintUserStories} />
          </div>
        </div>
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Toast
            style={{ paddingLeft: 25, paddingRight: 25 }}
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
          >
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;
