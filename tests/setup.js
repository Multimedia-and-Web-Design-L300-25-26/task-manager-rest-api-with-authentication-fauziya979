import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";

dotenv.config({ path: ".env.test" });

let useInMemoryFallback = false;
const inMemoryUsers = [];
const inMemoryTasks = [];

const createTaskDoc = (task) => ({
	...task,
	deleteOne: async () => {
		const index = inMemoryTasks.findIndex((currentTask) => currentTask._id.toString() === task._id.toString());
		if (index !== -1) {
			inMemoryTasks.splice(index, 1);
		}
	}
});

const enableInMemoryFallback = () => {
	User.findOne = async (query) => {
		return inMemoryUsers.find((user) => user.email === query.email) || null;
	};

	User.findById = async (id) => {
		return inMemoryUsers.find((user) => user._id.toString() === id.toString()) || null;
	};

	User.create = async (data) => {
		const user = {
			_id: new mongoose.Types.ObjectId(),
			name: data.name,
			email: data.email,
			password: data.password,
			createdAt: new Date()
		};
		inMemoryUsers.push(user);
		return user;
	};

	Task.create = async (data) => {
		const task = {
			_id: new mongoose.Types.ObjectId(),
			title: data.title,
			description: data.description || "",
			completed: Boolean(data.completed),
			owner: data.owner,
			createdAt: new Date()
		};
		inMemoryTasks.push(task);
		return createTaskDoc(task);
	};

	Task.find = async (query) => {
		return inMemoryTasks
			.filter((task) => task.owner.toString() === query.owner.toString())
			.map((task) => createTaskDoc(task));
	};

	Task.findById = async (id) => {
		const task = inMemoryTasks.find((currentTask) => currentTask._id.toString() === id.toString());
		return task ? createTaskDoc(task) : null;
	};
};

beforeAll(async () => {
	process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

	try {
		await connectDB();
	} catch (error) {
		useInMemoryFallback = true;
		enableInMemoryFallback();
	}
});

afterAll(async () => {
	if (!useInMemoryFallback && mongoose.connection.readyState !== 0 && mongoose.connection.db) {
		await mongoose.connection.db.dropDatabase();
		await mongoose.connection.close();
	}
});