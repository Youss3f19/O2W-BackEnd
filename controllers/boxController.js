const Box = require('../models/box');  
const Product = require('../models/product');  
const Rarity = require('../models/rarity'); 
const User = require('../models/user');  
const Category = require('../models/category'); 






exports.getAllBoxes = async (req, res) => {
    try {
        const boxes = await Box.find().populate('rarityProbabilities.rarity').populate('categories');
        res.status(200).json(boxes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch boxes', error });
    }
};



exports.purchaseBox = async (req, res) => {
    const { boxId } = req.params;
    const userId = req.user._id;
    

    try {
        // Find the box and user
        const box = await Box.findById(boxId);
        const user = await User.findById(userId);
        if (!box) {
            return res.status(404).json({ message: 'Box not found' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has enough balance (solde) to buy the box
        if (user.solde < box.price) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct the price from user's balance
        user.solde -= box.price;

        // Add the box to the user's inventory
        user.boxes.push({ box: boxId, opened: false });

        // Save the user with the updated balance and box in inventory
        await user.save();

        return res.status(200).json({ message: 'Box purchased successfully', inventory: user.boxes });
    } catch (error) {
        console.error('Error purchasing box:', error); // Logs the error for better visibility in server logs
        return res.status(500).json({ message: 'Error purchasing box', error: error.message });
    }
};

exports.purchaseBoxes = async (req, res) => {
    const { panier } = req.body; // Tableau d'objets contenant `boxId` et `quantity`
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let totalCost = 0;
        const purchasedBoxes = [];

        // Vérifier chaque boîte et calculer le coût total
        for (const item of panier) {
            const {quantity } = item;
            const boxId = item.box._id;

            // Vérifiez si la boîte existe
            const box = await Box.findById(boxId);
            if (!box) {
                return res.status(404).json({ message: `Box with ID ${boxId} not found` });
            }

            const costForItem = box.price * quantity;

            // Vérifiez si l'utilisateur a un solde suffisant
            if (user.solde < costForItem) {
                return res.status(400).json({
                    message: `Insufficient balance to purchase box with ID ${boxId} in quantity ${quantity}`,
                    purchasedBoxes,
                    totalCost,
                });
            }

            // Déduire le coût du solde utilisateur
            user.solde -= costForItem;

            // Ajouter les boîtes au compte utilisateur
            for (let i = 0; i < quantity; i++) {
                user.boxes.push({ box: boxId, opened: false });
            }

            purchasedBoxes.push({ boxId, quantity });
            totalCost += costForItem;
        }

        // Sauvegarder les modifications de l'utilisateur
        await user.save();

        // Réponse en cas de succès
        return res.status(200).json({
            message: 'Boxes purchased successfully',
            purchasedBoxes,
            totalCost,
            remainingBalance: user.solde,
        });
    } catch (error) {
        console.error('Error purchasing boxes:', error);
        return res.status(500).json({ message: 'Error purchasing boxes', error: error.message });
    }
};



// Add a new box
exports.addBox = async (req, res) => { 
    const { name, price, rarityProbabilities , productLimit } = req.body;
    const categories = JSON.parse(req.body.categories);
    


    // Extract file path from the uploaded file
    const boxImage = req.file ? req.file.path : null;  

    try {
        // Validate all rarity references before proceeding
        for (const rarityProbability of JSON.parse(rarityProbabilities || '[]')) {
            const { rarity } = rarityProbability;
            const validRarity = await Rarity.findById(rarity);
            if (!validRarity) {
                return res.status(400).json({ error: `Invalid rarity ID: ${rarity}` });
            }
        }

        // Validate category references before proceeding
        if (categories && categories.length > 0) {
            for (const categoryId of categories) {
                const validCategory = await Category.findById(categoryId);
                if (!validCategory) {
                    return res.status(400).json({ error: `Invalid category ID: ${categoryId}` });
                }
            }
        }

        // Create a new Box object with the provided data
        const newBox = new Box({
            name,
            price,
            productLimit,
            boxImage, 
            rarityProbabilities: JSON.parse(rarityProbabilities || '[]'),
            categories: categories || [] 
        });

        // Save the new Box to the database
        const savedBox = await newBox.save();

        // Send the saved Box as the response
        return res.status(201).json(savedBox);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error adding box: ' + error.message });
    }
};




// Delete a box
exports.deleteBox = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBox = await Box.findByIdAndDelete(id);
        if (!deletedBox) {
            return res.status(404).json({ error: 'Box not found' });
        }
        return res.status(200).json({ message: 'Box deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting box: ' + error.message });
    }
};

// Get a box by ID
exports.getBoxById = async (req, res) => {
    try {
        const box = await Box.findById(req.params.boxId);
        if (!box) {
            return res.status(404).json({ message: 'Box not found' });
        }
        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Update a box
exports.updateBox = async (req, res) => {
    const { id } = req.params;
    let updateData = req.body;
  
    // If a new file is included, update the image field
    if (req.file) {
      updateData.boxImage = req.file.path; // Ensure `upload.single` is handling the file correctly
    }
  
    // Parse stringified fields if they exist
    try {
      if (typeof updateData.rarityProbabilities === 'string') {
        updateData.rarityProbabilities = JSON.parse(updateData.rarityProbabilities);
      }
      if (typeof updateData.categories === 'string') {
        updateData.categories = JSON.parse(updateData.categories);
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid format for nested fields' });
    }
  
    try {
      const updatedBox = await Box.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedBox) {
        return res.status(404).json({ error: 'Box not found' });
      }
      return res.status(200).json(updatedBox);
    } catch (error) {
      return res.status(500).json({ error: 'Error updating box: ' + error.message });
    }
  };
  



// Open a box
exports.openBox = async (req, res) => {
    try {
        const { boxId } = req.params;
        const userId = req.user._id;

        const user = await findUserWithInventory(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userBox = findUserBox(user, boxId);
        if (!userBox) return res.status(400).json({ message: 'Box not found or already opened' });

        const box = await findBoxWithRarityAndCategory(boxId);
        if (!box) return res.status(404).json({ message: 'Box not found' });

        const generatedProducts = await generateProductsForBox(box);
        
        updateUserInventory(user, userBox, generatedProducts);
        
        userBox.opened = true;
        await user.save();

        return res.status(200).json({ message: 'Box opened successfully', generatedProducts, inventory: user.inventory });
    } catch (error) {
        return res.status(500).json({ message: 'Error opening box', error });
    }
};

// Helper function to find user and populate inventory
async function findUserWithInventory(userId) {
    return await User.findById(userId).populate('boxes.box inventory.product');
}

// Helper function to check if the user has the box and it is unopened
function findUserBox(user, boxId) {
    return user.boxes.find(b => b.box._id.toString() === boxId && !b.opened);
}

// Helper function to retrieve the box with rarity probabilities
async function findBoxWithRarityAndCategory(boxId) {
    return await Box.findById(boxId)
    .populate('rarityProbabilities.rarity')  
    .populate('categories')
}

// Helper function to generate products based on box rarity and category
async function generateProductsForBox(box) {
    const generatedProducts = [];
    const totalProductsToGenerate = box.productLimit || 5;
    const attemptsLimit = 500;
    let attempts = 0;

    // Extract category IDs from the box to filter products
    const boxCategoryIds = box.categories.map(category => category._id);

    while (generatedProducts.length < totalProductsToGenerate && attempts < attemptsLimit) {
        attempts++;
        const rarityProbability = box.rarityProbabilities[Math.floor(Math.random() * box.rarityProbabilities.length)];
        const { rarity, probability } = rarityProbability;

        if (rarity && Math.random() * 100 < probability) {
            // Construct the query based on the existence of categories
            const query = {
                rarity: rarity._id,
                stock: { $gt: 0 }
            };

            // If box has categories, filter by them
            if (boxCategoryIds.length > 0) {
                query.categories = { $in: boxCategoryIds }; // Only include products with matching categories
            }

            // Find products based on the constructed query and populate rarity and categories
            const products = await Product.find(query)
                .populate('rarity')   // Populate the rarity field
                .populate('categories'); // Populate the categories field

            if (products.length > 0) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                generatedProducts.push(randomProduct);

                // Decrement the stock of the product
                randomProduct.stock -= 1;
                await randomProduct.save();
            }
        }
    }
    return generatedProducts;
}



// Helper function to update user inventory and box content with generated products
function updateUserInventory(user, userBox, generatedProducts) {
    generatedProducts.forEach(product => {
        const existingProductInBox = userBox.products.find(p => p.product.toString() === product._id.toString());
        if (existingProductInBox) {
            existingProductInBox.quantity += 1;
        } else {
            userBox.products.push({ product: product._id, quantity: 1 });
        }

        const existingProductInInventory = user.inventory.find(p => p.product._id.toString() === product._id.toString());
        if (existingProductInInventory) {
            existingProductInInventory.quantity += 1;
        } else {
            user.inventory.push({ product: product._id, quantity: 1 });
        }
    });
    
}




exports.getAllPurchaseLogs = async (req, res) => {
    try {
        // Fetch all users and populate their purchased boxes
        const users = await User.find()
            .populate({
                path: 'boxes.box',
                model: 'Box',
                select: 'name price rarityProbabilities categories', 
                populate: [
                    { path: 'rarityProbabilities.rarity', select: 'name order' }, 
                    { path: 'categories', select: 'name' } 
                ]
            })
            .select('fullname email boxes');

        const purchaseLogs = users.map(user => ({
            user: {
                id: user._id,
                name: user.fullname,
                email: user.email,
            },
            purchases: user.boxes.map(boxEntry => ({
                boxId: boxEntry.box ? boxEntry.box._id : null,
                boxName: boxEntry.box ? boxEntry.box.name : null,
                price: boxEntry.box ? boxEntry.box.price : null,
                rarityProbabilities: boxEntry.box
                    ? boxEntry.box.rarityProbabilities.map(r => ({
                          rarityName: r.rarity.name,
                          probability: r.probability,
                      }))
                    : [],
                categories: boxEntry.box
                    ? boxEntry.box.categories.map(c => c.name)
                    : [],
                opened: boxEntry.opened,
            })),
        }));

        return res.status(200).json(purchaseLogs);
    } catch (error) {
        console.error('Error fetching purchase logs:', error);
        return res.status(500).json({
            message: 'Failed to fetch purchase logs',
            error: error.message,
        });
    }
};


















