const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  todo: {
    type: String,
    required: [true, "The todo text field is required"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Todos = mongoose.model("todo", TodoSchema);

module.exports = Todos;
