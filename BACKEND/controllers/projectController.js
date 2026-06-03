const Project = require('../models/Project');

const getProjects = async (req, res) => {
  const projects = await Project.find({});
  res.json(projects);
};

const createProject = async (req, res) => {
  const { title, description } = req.body;

  const project = await Project.create({ title, description });
  res.status(201).json(project);
};

module.exports = { getProjects, createProject };
