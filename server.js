var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var { request, gql, GraphQLClient } = require('graphql-request');
const jwt = require("jsonwebtoken");

// GraphQL schema
var schema = buildSchema(`
    type Query {
        user(id: Int!): User
        users(topic: String): [User]
    },
    type User {
        id: Int
        first_name: String
        last_name: String
        gender: String
    }
`);

var app = express();
app.use(express.json());


app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    if (email == "admin" && password == "admin") {
      // Create token
      const token = jwt.sign(
        {"https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["admin"],
          "x-hasura-default-role": "admin",
        }},
        "TUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQ"
      );

      let user = {};
      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});


app.get('/api/v1/users', async (req, res) => {

  let limit = 10;
  let offset = 1;
  
  if(req.query.page != undefined && req.query.page != null)
    offset = req.query.page;
  
  if(req.query.limit != undefined && req.query.limit != null)
    limit = req.query.limit;

  offset = ( offset - 1 ) * limit;
  
  const endpoint = 'http://graphql-engine:8080/v1/graphql'

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4ifSwiaWF0IjoxNjc0MzkxODI3fQ.EMaN-Vl-qQhbeNezQqFrKqmmUYQYevWagAn8YNxO69g',
    },
  })

  const query = gql`
    query {
      user (limit:  ${limit}, offset:  ${offset}){
        id,
        first_name,
        last_name,
        gender
      }
    }
  `

  const data = await graphQLClient.request(query)
  res.send(data);

})

app.get('/api/v1/users/find', async (req, res) => {

  const endpoint = 'http://graphql-engine:8080/v1/graphql'

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4ifSwiaWF0IjoxNjc0MzkxODI3fQ.EMaN-Vl-qQhbeNezQqFrKqmmUYQYevWagAn8YNxO69g',
    },
  })
  const query = gql`
    query findusers($radius: Int!) {
      user(where: { id: { _eq: $radius } }) {
        id
        first_name
        last_name
        gender
        location {
           lat
           lng
        }
      }
    }
  `

  const data = await graphQLClient.request(query,{radius: 1})
  res.send(data);

})


app.listen(3000);
console.log('Running server at http://localhost:3000');