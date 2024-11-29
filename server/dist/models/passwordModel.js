import { Schema, model } from 'mongoose';
const passwordSchema = new Schema({
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    encryptedPassword: { type: String, required: true },
    iv: { type: String, required: true },
}, {
    timestamps: true,
});
const passwordModel = model('Password', passwordSchema);
export default passwordModel;
