const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: false }, // Opcional, Mongo usa _id por defecto
    name: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'viewer', enum: ['admin', 'viewer'] }
});

// Esto asegura que cuando envíes el JSON al front, el '_id' de mongo se vea como 'id'
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('User', UserSchema);