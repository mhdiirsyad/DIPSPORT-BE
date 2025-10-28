import express from "express"
import {ApolloServer} from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import {expressMiddleware} from "@as-integrations/express5"
import typeDefs from "./schema/typeDefs"
import resolvers from "./schema/resolvers"
import {prisma} from "./lib/prisma"
import bodyParser from "body-parser"

const app = express()
const server = new ApolloServer(
  {
    typeDefs,
    resolvers
  }
)
const {url} = await startStandaloneServer(server, {
  context: async () => ({prisma}),
})
// app.use("/graphql", bodyParser.json(), expressMiddleware(server, {
//   context: async () => ({prisma})
// }))

// app.listen(4000, ()=>{
//   console.log("Server ready at http://localhost:4000/graphql")
// })

console.log(`Server start ${url}`)
