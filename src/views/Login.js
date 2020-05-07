import React, { useState, useContext } from "react";
import { app } from "../firebase";
import { Button } from "react-bootstrap";
import LoginTextInput from "../components/LoginTextInput";
import "../styling/App.css";
import db from "../services/db_service";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../firebase/auth";

const Login = () => {
  const [title, setTitle] = useState("Login");
  const [buttonText, setButtonText] = useState("REGISTER");
  const fromEmail = "email";
  const fromPass = "pass";
  const fromDisplayName = "displayName";
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [displayName, setDisplayName] = useState("");

  const context = useContext(AuthContext);

  if (context.currentUser) {
    history.push("/home");
  }

  const handleSignUp = async () => {
    if (email.length > 0 && pass.length > 0) {
      app
        .createUserWithEmailAndPassword(email, pass)
        .then(async function (_firebaseUser) {
          let newUser = {
            uid: _firebaseUser.user.uid,
            displayName: displayName,
          };
          //Add the newly registered user to the teamMembers collection with their uid
          await db.Add(`/teamMembers`, "Team Members", newUser);
          setEmail("");
          setPass("");
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;

          if (errorCode === "auth/weak-password") {
            alert("The password is too weak.");
          } else {
            alert(errorMessage);
          }
          if (!errorCode) {
            history.push("/home");
          }
        });
    } else {
      alert(
        "Registration Error: Please enter an email and password to register"
      );
    }
  };

  const handleLogin = async () => {
    if (email.length > 0 && pass.length > 0) {
      app
        .signInWithEmailAndPassword(email, pass)
        .then(function (_firebaseUser) {
          setEmail("");
          setPass("");
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;

          if (errorCode === "auth/wrong-password") {
            alert("Wrong password.");
          } else {
            alert("Login Error:" + errorMessage);
          }
          if (!errorCode) {
            history.push("/home");
          }
        });
    } else {
      alert("Login Error: Please enter an email and password to login");
    }
  };

  const dynamicButtonClicked = () => {
    if (buttonText === "REGISTER") {
      setTitle("Register");
      setButtonText("LOGIN");
    } else {
      setTitle("Login");
      setButtonText("REGISTER");
    }
  };

  const onSubmit = () => {
    if (title === "Register") {
      handleSignUp();
    } else {
      // try and login the user
      handleLogin();
    }
  };

  const formFilled = (input, from) => {
    if (from === fromEmail) {
      setEmail(input);
    } else if (from === fromPass) {
      setPass(input);
    } else {
      setDisplayName(input);
    }
  };

  return (
    <div style={{ paddingTop: 50, textAlign: "center", marginLeft: -240 }}>
      <h1 className="pageHead">Sprint Retrospective</h1>
      <h2 className="pageHead mt-5">{title}</h2>

      <div style={{ maxWidth: 400, margin: "auto" }}>
        <div className="mb-5">
          <LoginTextInput
            onSubmit={onSubmit}
            title={"Email:"}
            formFilled={formFilled}
            from={fromEmail}
          ></LoginTextInput>
        </div>
        <LoginTextInput
          onSubmit={onSubmit}
          title={"Password:"}
          formFilled={formFilled}
          type={"password"}
          from={fromPass}
        ></LoginTextInput>
        {title === "Register" && (
          <LoginTextInput
            onSubmit={onSubmit}
            title={"Display Name:"}
            formFilled={formFilled}
            from={fromDisplayName}
          ></LoginTextInput>
        )}
      </div>

      <div style={{ alignItems: "center", marginTop: 70 }}>
        <Button
          style={{ paddingLeft: 20, paddingRight: 20, marginRight: 130 }}
          onClick={onSubmit}
        >
          SUBMIT
        </Button>
        <Button
          style={{ paddingLeft: 20, paddingRight: 20 }}
          onClick={dynamicButtonClicked}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default Login;
