const Command = require('../models/command'); 
const mongoose = require('mongoose');

// Create a new command
exports.createCommand = async (req, res) => {
    const { user, boxes, totalAmount } = req.body;

    try {
        const newCommand = new Command({
            user: mongoose.Types.ObjectId(user),
            boxes: boxes.map(box => mongoose.Types.ObjectId(box)), // Ensure all box IDs are ObjectIds
            totalAmount
        });

        await newCommand.save();
        res.status(201).json(newCommand); // Return the newly created command
    } catch (error) {
        res.status(400).json({ message: 'Failed to create command', error });
    }
};

// Get all commands for a user
exports.getUserCommands = async (req, res) => {
    const userId = req.params.userId;

    try {
        const commands = await Command.find({ user: mongoose.Types.ObjectId(userId) })
            .populate('user')
            .populate('boxes');

        res.status(200).json(commands);
    } catch (error) {
        res.status(400).json({ message: 'Failed to retrieve commands', error });
    }
};

// Get a specific command by ID
exports.getCommandById = async (req, res) => {
    const commandId = req.params.id;

    try {
        const command = await Command.findById(commandId)
            .populate('user')
            .populate('boxes');

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        res.status(200).json(command);
    } catch (error) {
        res.status(400).json({ message: 'Failed to retrieve command', error });
    }
};

// Update a command's status
exports.updateCommandStatus = async (req, res) => {
    const commandId = req.params.id;
    const { status } = req.body;

    try {
        const updatedCommand = await Command.findByIdAndUpdate(
            commandId,
            { status },
            { new: true }
        );

        if (!updatedCommand) {
            return res.status(404).json({ message: 'Command not found' });
        }

        res.status(200).json(updatedCommand);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update command status', error });
    }
};

// Delete a command
exports.deleteCommand = async (req, res) => {
    const commandId = req.params.id;

    try {
        const deletedCommand = await Command.findByIdAndDelete(commandId);

        if (!deletedCommand) {
            return res.status(404).json({ message: 'Command not found' });
        }

        res.status(200).json({ message: 'Command deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to delete command', error });
    }
};
