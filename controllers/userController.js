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
                    fullname: user.name + ' ' + user.lastname,
                    role: user.role
                };
                let token = jwt.sign(payload, '123456789');
                res.status(200).send({ mytoken: token });
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
    let id = req.params.id;
    User.findOne({ _id: id })
        .then((user) => {
            res.status(200).send(user);
        })
        .catch((err) => {
            res.status(400).send(err);
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
            data: decode,
            isAdmin: decode.role === 'admin'
        });
    } else {
        res.status(400).json({
            login: false,
            data: 'error'
        });
    }
}

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
