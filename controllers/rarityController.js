const Rarity = require('../models/rarity');

// Add a new rarity
exports.addRarity = async (req, res) => {
    const { name, order } = req.body;

    try {
        const newRarity = new Rarity({
            name,
            order
        });

        const savedRarity = await newRarity.save();
        return res.status(201).json(savedRarity);
    } catch (error) {
        return res.status(500).json({ error: 'Error adding rarity: ' + error.message });
    }
};

// Delete a rarity
exports.deleteRarity = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRarity = await Rarity.findByIdAndDelete(id);
        if (!deletedRarity) {
            return res.status(404).json({ error: 'Rarity not found' });
        }
        return res.status(200).json({ message: 'Rarity deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting rarity: ' + error.message });
    }
};

// Update a rarity
exports.updateRarity = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedRarity = await Rarity.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedRarity) {
            return res.status(404).json({ error: 'Rarity not found' });
        }
        return res.status(200).json(updatedRarity);
    } catch (error) {
        return res.status(500).json({ error: 'Error updating rarity: ' + error.message });
    }
};

// Get all rarities
exports.getAllRarities = async (req, res) => {
    try {
        const rarities = await Rarity.find().sort({ order: 1 });  // Sort by 'order' field
        return res.status(200).json(rarities);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching rarities: ' + error.message });
    }
};

// Get rarity by ID
exports.getRarityById = async (req, res) => {
    const { id } = req.params;

    try {
        const rarity = await Rarity.findById(id);
        if (!rarity) {
            return res.status(404).json({ error: 'Rarity not found' });
        }
        return res.status(200).json(rarity);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching rarity: ' + error.message });
    }
};
