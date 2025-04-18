require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const Todos = require("./todo");

const app = express();
const API_VERSION = "/api/v1";

app.use(express.json());
app.use(logger("combined"));

const PORT = process.env.PORT || 8000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/todos";

mongoose.connect(MONGODB_URI);

mongoose.connection.on("open", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("Could not connect to MongoDB");
  return console.log(err.message);
});

app.get("/healthz", (req, res) => res.json({ status: "OK" }));
app.get(`${API_VERSION}/todos`, async (req, res) => {
  try {
    const todos = await Todos.find({}, "todo completed");
    if (!todos) {
      return res.status(400).json({
        success: false,
        message: "Todos not retrieved",
        todos: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Todos retrieved",
      todos: todos,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.get(`${API_VERSION}/todos/:id`, async (req, res) => {
  try {
    const todo = await Todos.findById(req.params.id, "todo completed")
    if (!todo) {
      return res.status(400).json({
        success: false,
        message: "Todo not found",
        todos: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Todo task retrieved",
      todos: todo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.post(`${API_VERSION}/todos`, async (req, res) => {
  try {
    const { todo } = req.body;
    const todos = await Todos.create({ todo });
    if (!todos) {
      return res.status(400).json({
        success: false,
        message: "Issue creating a todo task",
        todos: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Successfully created Todo",
      todos: todos,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.patch(`${API_VERSION}/todos/:id`, async (req, res) => {
  try {
    const { todo } = req.body;
    const updateTodo = await Todos.findByIdAndUpdate(req.params.id, { todo }, { new: true })
    if (!updateTodo) {
      return res.status(400).json({
        success: false,
        message: "Issue updating a todo task",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Successfully updated Todo",
      todos: updateTodo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
})

app.patch(`${API_VERSION}/todos/:id/completed`, async (req, res) => {
  try {
    const existingTodo = await Todos.findById(req.params.id, "todo")
    if (!existingTodo) {
      return res.status(400).json({
        success: false,
        message: "Todo task not found",
      });
    }
    const updatedTodo = await Todos.findByIdAndUpdate(req.params.id, { completed: !existingTodo.completed }, { new: true, runValidators: true })
    if (!updatedTodo) {
      return res.status(400).json({
        success: false,
        message: "Failed to mark as completed",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Marked as completed",
      todos: updatedTodo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
})

app.delete(`${API_VERSION}/todos/:id`, async (req, res) => {
  try {
    const deleteTodo = await Todos.findOneAndDelete({_id: req.params.id})
    if (!deleteTodo) {
      return res.status(400).json({
        success: false,
        message: "Todo not deleted",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Todo successfully deleted",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
