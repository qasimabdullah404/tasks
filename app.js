require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const Todos = require("./todo");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const API_VERSION = "/api/v1";

app.use(express.json());
app.use(logger("combined"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: App is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 */
app.get("/healthz", (req, res) => res.json({ status: "OK" }));

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 todos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       todo:
 *                         type: string
 *                       completed:
 *                         type: boolean
 */
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

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: A single todo item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 todos:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     todo:
 *                       type: string
 *                     completed:
 *                       type: boolean
 */
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

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo
 *             properties:
 *               todo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 todos:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     todo:
 *                       type: string
 *                     completed:
 *                       type: boolean
 */
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

/**
 * @swagger
 * /todos/{id}:
 *   patch:
 *     summary: Update a todo's text
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo
 *             properties:
 *               todo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated todo task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 todos:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     todo:
 *                       type: string
 *                     completed:
 *                       type: boolean
 */
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

/**
 * @swagger
 * /todos/{id}/completed:
 *   patch:
 *     summary: Toggle the completed status of a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Toggled completed status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 todos:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     todo:
 *                       type: string
 *                     completed:
 *                       type: boolean
 */
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

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID to delete
 *     responses:
 *       200:
 *         description: Successfully deleted todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
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
