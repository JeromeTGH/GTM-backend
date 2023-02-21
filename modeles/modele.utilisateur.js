const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const schemaUtilisateur = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 64
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: [isEmail],
            lowercase: true,
            maxlength: 256
        },
        password: {
            type: String,
            required: true,
            minlength: 6,           // 6 caractères minimum pour le mot de passe, avant encodage dans la BDD
            maxlength: 64
        },
        tachespossibles: {
            type: [[String, String]]
        }
    },
    {
        timestamps: true
    }
)

// Pour cryter le mot de passe, avant qu'il soit enregistré (d'où le "pre" - "save") => après la table / avant le passage en "model"
schemaUtilisateur.pre('save', async function (next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// Fonction de connexion
schemaUtilisateur.statics.login = async function (email, password) {
    const user = await this.findOne({ email })
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user
        }
        throw Error('Mot de passe incorrect, désolé …')
    }
    throw Error('Email incorrect, désolé …')
}

// Enregistrement
const ModeleUtilisateur = mongoose.model('utilisateur', schemaUtilisateur)
module.exports = ModeleUtilisateur
