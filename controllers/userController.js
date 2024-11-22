const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    let data = req.body;
    
    try {
        // Vérifier si l'email existe déjà dans la base de données
        let existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).send('L\'email est déjà utilisé.');
        }

        // Si l'email n'existe pas, créer un nouvel utilisateur
        let user = new User(data);

        // Hasher le mot de passe avant de le sauvegarder
        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(data.password, salt);

        let savedUser = await user.save();
        res.status(200).send(savedUser);
    } catch (err) {
        console.error('Erreur lors de la création du compte :', err);
        res.status(500).send('Erreur lors de la création du compte.');
    }
};

exports.login = (req, res) => {
    let data = req.body;
    User.findOne({ email: data.email })
        .then((user) => {
            if (!user) {
                return res.status(400).send('Mail invalid!');
            }
            bcrypt.compare(data.password, user.password, (err, valid) => {
                if (err) return res.status(500).send('Error occurred: ' + err.message);
                if (!valid) return res.status(400).send('Password invalid!!');
         
                let payload = {
                    _id: user._id,
                    email: user.email,
                    name: user.name ,
                    lastname : user.lastname,
                    role: user.role,
                    solde : user.solde,
                    inventory: user.inventory,
                    boxes: user.boxes
                };
                let token = jwt.sign(payload, '123456789');
                res.status(200).send({ mytoken: token , user : user });
            });
        })
        .catch((err) => {
            res.status(400).send('Error occurred: ' + err.message);
        });
};

exports.getAllUsers = (req, res) => {
    User.find({})
        .then((users) => {
            res.status(200).send(users);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

exports.getUserById = (req, res) => {
    const id = req.params.id;

    User.findOne({ _id: id })
        .populate('boxes.box inventory.product' )
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.status(200).send(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send({ error: 'An error occurred while fetching the user' });
        });
};






exports.getUserByEmail = (req, res) => {
    let mail = req.params.email;
    User.findOne({ email: mail })
        .then((user) => {
            res.status(200).send(user);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

exports.verifyToken = (req, res) => {
    const token = req.body.token;    
    if (token) {
        const decode = jwt.verify(token, '123456789');
        res.status(200).json({
            login: true,
            user: decode,
            isAdmin: decode.role === 'admin'
        });
    } else {
        res.status(400).json({
            login: false,
            data: 'error'
        });
    }
}

exports.getUserByToken = (req, res) => {  
    let id = req.user._id;
    User.findOne({ _id: id })
        .then((user) => {
            res.status(200).send(user);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
  };

// Function to reset the password using the reset token
exports.resetPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // Extracted from the token

    try {
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist!' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect!' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password cannot be the same as the current password!' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error while resetting password:', err);
        return res.status(500).json({ message: 'Error while resetting password.', error: err.message });
    }
};

exports.rechargeAccount = async (req, res) => {
    try {
        const userId = req.user._id;  // Récupérer id de l'utilisateur à partir du token
        const { amount } = req.body;  // Le montant à recharger

        if (!amount || amount <= 0) {
            return res.status(400).send('Le montant de la recharge est invalide.');
        }

        // Trouver l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Ajouter le montant au solde de l'utilisateur
        user.solde += Number(amount) ; 

        // Sauvegarder les modifications
        await user.save();

        return res.status(200).json({ message: 'Compte rechargé avec succès.', newSolde: user.solde });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur lors du rechargement du compte.' });
    }
};
