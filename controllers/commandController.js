const Command = require('../models/Command');
const User = require('../models/user');
const Product = require('../models/product'); 





exports.getAllCommands = async (req, res) => {
    try {
        // Récupérer toutes les commandes
        const commands = await Command.find()
            .populate('products.product' , 'name price stock productImage')
            .populate('user' , 'name lastname email')
               

        res.status(200).json(commands);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
    }
};


exports.createCommand = async (req, res) => {
    try {
        const { products } = req.body; // Produits de la commande (array: { product, quantity })
        
        // Vérifier si l'utilisateur existe
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si les produits sont dans l'inventaire de l'utilisateur
        for (const item of products) {
            const inventoryItem = user.inventory.find(
                (inv) => inv.product.toString() === item.product
            );

            if (!inventoryItem) {
                return res.status(404).json({
                    message: `Le produit avec l'ID ${item.product} n'est pas présent dans votre inventaire.`,
                });
            }

            if (inventoryItem.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Quantité insuffisante dans l'inventaire pour le produit ${item.product}. Disponible: ${inventoryItem.quantity}, demandé: ${item.quantity}`,
                });
            }
        }

        // Réduire les quantités dans l'inventaire
        for (const item of products) {
            const inventoryItem = user.inventory.find(
                (inv) => inv.product.toString() === item.product
            );

            if (inventoryItem) {
                inventoryItem.quantity -= item.quantity;
            }
        }

        // Supprimer les produits avec une quantité de 0 (optionnel)
        user.inventory = user.inventory.filter((inv) => inv.quantity > 0);

        // Sauvegarder l'utilisateur avec l'inventaire mis à jour
        await user.save();

        // Créer la commande
        const command = new Command({
            user: req.user._id,
            products,
        });

        await command.save();

        res.status(201).json({ message: 'Commande créée avec succès', command });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la commande', error });
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

        if (status === 'Cancelled') {
            console.log(command.products);
        
            // Réinjecter les produits dans l'inventaire
            command.products.forEach((p) => {
                const existingInventoryItem = user.inventory.find((item) => 
                    item.product.toString() === p.product.toString()
                );
        
                if (existingInventoryItem) {
                    // Si le produit existe déjà dans l'inventaire, ajouter la quantité
                    existingInventoryItem.quantity += p.quantity;
                } else {
                    // Sinon, ajouter un nouvel élément dans l'inventaire
                    user.inventory.push({ product: p.product, quantity: p.quantity });
                }
            });
        
            console.log("Inventaire mis à jour :", user.inventory);
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



