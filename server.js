var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

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

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.get('/', async (request, response) => {
  const response = await request(
    "http://localhost:3000/graphql",
    addPersonMutation
  );
  console.log(response);
  response.send('Hello, GraphQL!')
})




app.listen(3000);
console.log('Running a GraphQL API server at http://localhost:3000/graphql');