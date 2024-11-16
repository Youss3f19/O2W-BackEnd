const Command = require('../models/Command');
const User = require('../models/user');
const Product = require('../models/product');

exports.createCommand = async (req, res) => {
    try {
        const { userId, products } = req.body;

        // Vérifier que l'utilisateur existe
        const user = await User.findById(userId).populate('inventory.product');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }

        // Vérifier et retirer les quantités des produits
        const inventoryUpdates = [];
        for (const product of products) {
            const { productId, quantity } = product;

            // Trouver le produit dans l'inventaire
            const inventoryItem = user.inventory.find(item => 
                item.product._id.toString() === productId
            );

            if (!inventoryItem || inventoryItem.quantity < quantity) {
                return res.status(400).json({
                    message: `Quantité insuffisante pour le produit: ${inventoryItem ? inventoryItem.product.name : productId}.`
                });
            }

            // Mettre à jour l'inventaire
            inventoryItem.quantity -= quantity;
            if (inventoryItem.quantity === 0) {
                inventoryUpdates.push(productId);
            }
        }

        // Supprimer les produits avec quantité zéro
        user.inventory = user.inventory.filter(item => 
            !inventoryUpdates.includes(item.product._id.toString())
        );

        // Enregistrer les changements dans l'inventaire
        await user.save();

        // Créer la commande
        const command = new Command({
            user: userId,
            products: products.map(p => p.productId),
            status: 'Pending'
        });

        await command.save();

        res.status(201).json({ message: 'Commande créée avec succès.', command });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
    }
};

exports.updateCommandStatus = async (req, res) => {
    try {
        const { commandId } = req.params;
        const { status } = req.body;

        // Vérifier si le statut est valide
        if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide.' });
        }

        // Récupérer la commande
        const command = await Command.findById(commandId).populate('products');
        if (!command) {
            return res.status(404).json({ message: 'Commande introuvable.' });
        }

        // Si le statut est déjà celui demandé
        if (command.status === status) {
            return res.status(400).json({ message: 'La commande est déjà dans ce statut.' });
        }

        // Récupérer l'utilisateur associé
        const user = await User.findById(command.user);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }

        // Gestion des statuts
        if (status === 'Completed') {
            // Si la commande est acceptée (Completed), retirer les produits de l'inventaire
            command.products.forEach(productId => {
                const inventoryItem = user.inventory.find(item => 
                    item.product.toString() === productId.toString()
                );

                if (inventoryItem) {
                    inventoryItem.quantity -= 1;

                    // Si la quantité devient 0, retirer le produit
                    if (inventoryItem.quantity <= 0) {
                        user.inventory = user.inventory.filter(item => 
                            item.product.toString() !== productId.toString()
                        );
                    }
                }
            });
        } else if (status === 'Cancelled') {
            // Si la commande est annulée (Cancelled), réinjecter les produits dans l'inventaire
            command.products.forEach(productId => {
                const existingInventoryItem = user.inventory.find(item => 
                    item.product.toString() === productId.toString()
                );

                if (existingInventoryItem) {
                    existingInventoryItem.quantity += 1; // Augmenter la quantité
                } else {
                    user.inventory.push({ product: productId, quantity: 1 });
                }
            });
        }

        // Mettre à jour l'utilisateur et la commande
        await user.save();
        command.status = status;
        await command.save();

        res.status(200).json({ message: `Commande mise à jour avec succès au statut ${status}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande.' });
    }
};

