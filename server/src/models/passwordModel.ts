import { Schema, model } from 'mongoose'

interface Password {
  addedBy: Schema.Types.ObjectId
  name: string
  encryptedPassword: string
  iv: string
  ivS: string
  // timestamps
  createdAt: number
  updatedAt: number
  totpSecret: string | null; // Aggiungi questa linea

}

const passwordSchema = new Schema<Password>(
  {
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    encryptedPassword: { type: String, required: true },
    iv: { type: String, required: true },
    totpSecret: { type: String, default: null }, // Aggiungi questa linea
    ivS: { type: String, default: null },

  },
  {
    timestamps: true,
  }
)

const passwordModel = model('Password', passwordSchema)

export default passwordModel
