require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Todos = require("./todo");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const logger = require("./logger");

const app = express();
const API_VERSION = "/api/v1";

app.use(express.json());
app.use(morgan("combined"));

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
app.get("/healthz", (req, res) => {
  res.json({ status: "OK" });
});

app.get(`${API_VERSION}/todos`, async (req, res) => {
  logger.info(`GET ${API_VERSION}/todos - Fetching all todos`);

  try {
    const todos = await Todos.find({}, "todo completed");

    if (!todos || todos.length === 0) {
      logger.warn(`GET ${API_VERSION}/todos - No todos found`);
      return res.status(400).json({
        success: false,
        message: "Todos not retrieved",
        todos: [],
      });
    }

    logger.info(`GET ${API_VERSION}/todos - Todos retrieved`);
    return res.status(200).json({
      success: true,
      message: "Todos retrieved",
      todos: todos,
    });

  } catch (error) {
    logger.error(`GET ${API_VERSION}/todos - Error: ${error.message}`);
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
  const todoId = req.params.id;
  logger.info(`GET ${API_VERSION}/todos/${todoId} - Fetching todo by ID`);

  try {
    const todo = await Todos.findById(todoId, "todo completed");

    if (!todo) {
      logger.warn(`GET ${API_VERSION}/todos/${todoId} - Todo not found`);
      return res.status(400).json({
        success: false,
        message: "Todo not found",
        todos: [],
      });
    }

    logger.info(`GET ${API_VERSION}/todos/${todoId} - Todo retrieved`);
    return res.status(200).json({
      success: true,
      message: "Todo task retrieved",
      todos: todo,
    });
  } catch (error) {
    logger.error(
      `GET ${API_VERSION}/todos/${todoId} - Error: ${error.message}`
    );
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
  logger.info(`POST ${API_VERSION}/todos - Creating a new todo task`);

  try {
    const { todo } = req.body;

    const todos = await Todos.create({ todo });
    
    if (!todos) {
      logger.warn(`POST ${API_VERSION}/todos - Issue creating a todo task`);
      return res.status(400).json({
        success: false,
        message: "Issue creating a todo task",
        todos: null,
      });
    }

    logger.info(`POST ${API_VERSION}/todos - Successfully created Todo: ${todos._id}`);
    return res.status(200).json({
      success: true,
      message: "Successfully created Todo",
      todos: todos,
    });

  } catch (error) {
    logger.error(`POST ${API_VERSION}/todos - Error: ${error.message}`);
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
  logger.info(`PATCH ${API_VERSION}/todos/${req.params.id} - Attempting to update todo`);

  try {
    const { todo } = req.body;
    const updateTodo = await Todos.findByIdAndUpdate(
      req.params.id,
      { todo },
      { new: true }
    );

    if (!updateTodo) {
      logger.warn(`PATCH ${API_VERSION}/todos/${req.params.id} - Todo not found for updating`);
      return res.status(400).json({
        success: false,
        message: "Issue updating a todo task",
      });
    }

    logger.info(`PATCH ${API_VERSION}/todos/${req.params.id} - Todo successfully updated`);
    return res.status(200).json({
      success: true,
      message: "Successfully updated Todo",
      todos: updateTodo,
    });
  } catch (error) {
    logger.error(`PATCH ${API_VERSION}/todos/${req.params.id} - Error: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


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
  logger.info(`PATCH ${API_VERSION}/todos/${req.params.id}/completed - Toggling completed status`);

  try {
    const existingTodo = await Todos.findById(req.params.id, "todo completed");
    
    if (!existingTodo) {
      logger.warn(`PATCH ${API_VERSION}/todos/${req.params.id}/completed - Todo task not found`);
      return res.status(400).json({
        success: false,
        message: "Todo task not found",
      });
    }

    const updatedTodo = await Todos.findByIdAndUpdate(
      req.params.id,
      { completed: !existingTodo.completed },
      { new: true, runValidators: true }
    );
    
    if (!updatedTodo) {
      logger.warn(`PATCH ${API_VERSION}/todos/${req.params.id}/completed - Failed to mark as completed`);
      return res.status(400).json({
        success: false,
        message: "Failed to mark as completed",
      });
    }

    logger.info(`PATCH ${API_VERSION}/todos/${req.params.id}/completed - Todo marked as completed`);
    return res.status(200).json({
      success: true,
      message: "Marked as completed",
      todos: updatedTodo,
    });

  } catch (error) {
    logger.error(`PATCH ${API_VERSION}/todos/${req.params.id}/completed - Error: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


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
  logger.info(`DELETE ${API_VERSION}/todos/${req.params.id} - Attempting to delete todo`);

  try {
    const deleteTodo = await Todos.findOneAndDelete({ _id: req.params.id });
    
    if (!deleteTodo) {
      logger.warn(`DELETE ${API_VERSION}/todos/${req.params.id} - Todo not found for deletion`);
      return res.status(400).json({
        success: false,
        message: "Todo not deleted",
      });
    }

    logger.info(`DELETE ${API_VERSION}/todos/${req.params.id} - Todo successfully deleted`);
    return res.status(200).json({
      success: true,
      message: "Todo successfully deleted",
    });
  } catch (error) {
    logger.error(`DELETE ${API_VERSION}/todos/${req.params.id} - Error: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
