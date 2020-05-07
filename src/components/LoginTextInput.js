import React from "react";
import { Form } from "react-bootstrap";
import { TextField } from "@material-ui/core";

const LoginTextInput = (props) => {
  const onSubmitHandler = (e) => {
    e.preventDefault();
    props.onSubmit();
  };

  return (
    <div className="mt-1">
      <h6 style={{ textAlign: "left", marginBottom: 3 }}>{props.title}</h6>
      <div
        style={{
          borderRadius: 10,
          backgroundColor: "#C4C4C4",
          minHeight: 80,
          minWidth: 250,
          paddingTop: 14,
        }}
      >
        <div
          style={{
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            minHeight: 50,
            maxWidth: 360,
            margin: "auto",
          }}
        >
          <Form style={{ padding: 10 }} onSubmit={onSubmitHandler}>
            <TextField
              fullWidth
              type={props.type}
              onChange={(event) =>
                props.formFilled(event.target.value, props.from)
              }
            />
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginTextInput;
