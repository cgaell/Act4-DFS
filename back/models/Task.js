const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Mantenemos tu ID manual para compatibilidad con el front
    taskName: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    status: { type: String, default: 'not-started', enum: ['not-started', 'in-progress', 'completed', 'on-hold'] },
    createdBy: { type: String, default: 'System' },
    assignedTo: { type: String, required: true },
    assignedDate: { type: Date }
});

// Transformación para el frontend
TaskSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('Task', TaskSchema);