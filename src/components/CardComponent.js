import React from "react";
import { Card } from "react-bootstrap";
import "../App.css";

const CardComponent = ({ data }) => {
  return (
    <Card className="card">
      <Card.Header>
        <h4>{data.cardTitle}</h4>
      </Card.Header>
      <Card.Body>
        <Card.Text>{data.cardSub1}</Card.Text>
        <Card.Text>{data.cardSub2}</Card.Text>
        {data.cardSub3 && <Card.Text>{data.cardSub3}</Card.Text>}
        {data.cardSub4 && <Card.Text>{data.cardSub4}</Card.Text>}
      </Card.Body>
      <Card.Footer style={{ color: "red" }}>
        {data.overDue && <Card.Text>Over Due!</Card.Text>}
      </Card.Footer>
    </Card>
  );
};
export default CardComponent;
