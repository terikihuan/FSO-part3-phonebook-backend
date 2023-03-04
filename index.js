const express = require("express")
const app = express()
const morgan = require("morgan")

// Data
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

// Use middleware
app.use(express.json())
app.use(express.static("build"))
app.use(morgan("tiny"))

// *ROUTES
app.get("/api/persons", (req, res) => {
  res.json(persons)
})
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find((p) => p.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})
app.get("/info", (req, res) => {
  res.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <div>${Date()}</div>
    `)
})
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter((p) => p.id !== id)
  res.status(204).end()
})

morgan.token("data", function (req, res) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
)
app.post("/api/persons", (req, res) => {
  const body = req.body

  // Name or number is missing
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Please provide name and number",
    })
  }
  // Duplicate name
  const duplicate = persons.find((p) => p.name === body.name)
  if (duplicate) {
    return res.status(400).json({
      error: "Name must be unique",
    })
  }

  const newPerson = {
    id: Math.floor(Math.random() * 10000000),
    name: body.name,
    number: body.number,
  }

  persons.push(newPerson)

  res.json(newPerson)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

// Run server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`)
})
