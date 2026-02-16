const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: String, unique: true }, 
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 }, // ANTES: category
    entryDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    status: { 
        type: String, 
        default: 'in-stock', 
        enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'] 
    },
    createdBy: { type: String, default: 'System' }
});

ProductSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('Product', ProductSchema);