const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("Please provide password in the form: node mongo.js <password>")
  process.exit(1)
}

if (process.argv.length > 5) {
  console.log(
    "Please provide info in the form: node mongo.js <password> <name> <number>"
  )
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://Huan:${password}@nodeexpressprojects.t0haq.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model("Person", personSchema)

// *Generate new contact
if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log("phonebook:")
    result.forEach((p) => {
      console.log(p.name, p.number)
    })
    mongoose.connection.close()
  })
} else {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({ name, number })
  person.save().then((result) => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
