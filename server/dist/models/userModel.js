import { Schema, model } from 'mongoose';
const refreshTokenSchema = new Schema({
    refreshToken: { type: String, required: true },
    expirationDate: { type: Date, required: true },
}, { _id: false });
const userSchema = new Schema({
    email: { type: String, required: true },
    code: { type: String },
    refreshTokens: [refreshTokenSchema],
}, {
    timestamps: true,
});
const userModel = model('User', userSchema);
export default userModel;
