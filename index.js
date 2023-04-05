require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const Person = require("./models/person")

// Use middleware
app.use(express.json())
app.use(express.static("build"))
app.use(morgan("tiny"))

// Random change

// *ROUTES
app.get("/health", (req, res) => {
  res.send("ok")
})
app.get("/version", (req, res) => {
  res.send("v1")
})
app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((result) => {
      res.json(result)
    })
    .catch((error) => next(error))
})
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => {
      if (result) {
        res.json(result)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})
app.get("/info", (req, res) => {
  Person.find({}).then((result) => {
    res.send(`
    <div>Phonebook has info for ${result.length} people</div>
    <div>${Date()}</div>
    `)
  })
})
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

// POST & PUT
morgan.token("data", function (req) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
)
app.post("/api/persons", (req, res, next) => {
  const body = req.body

  // Name or number is missing
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Please provide name and number",
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((result) => {
      res.json(result)
    })
    .catch((error) => next(error))
})
app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((result) => {
      res.json(result)
    })
    .catch((error) => next(error))
})

// !ERROR HANDLING
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

// Run server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})
