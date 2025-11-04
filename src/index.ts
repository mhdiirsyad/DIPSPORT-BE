import "dotenv/config"
import express from "express"
import cors from "cors"
import { ApolloServer } from "@apollo/server"
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs"
import { expressMiddleware } from "@as-integrations/express5"
import bodyParser from "body-parser"
import typeDefs from "./schema/typeDefs.js"
import resolvers from "./schema/resolvers/index.js"
import { buildContext } from "./lib/context.js"

const app = express()
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

await server.start()

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

app.use(
  "/graphql",
  bodyParser.json(),
  graphqlUploadExpress(),
  expressMiddleware(server, {
    context: async ({ req }) => buildContext(req),
  })
)

const port = process.env.PORT || 4001

app.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}/graphql`)
})
