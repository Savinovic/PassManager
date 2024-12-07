const addSecretErrors = {
  addSecret: {
    required: {
      value: true,
      message: 'validationErrorRequired',
    },
    maxLength: {
      value: 40,
      message: 'validationErrorNameLength',
    },
  },
}

const deleteSecretErrors = {
  deleteSecret: {
    required: {
      value: true,
      message: 'validationErrorRequired',
    },
    maxLength: {
      value: 40,
      message: 'validationErrorNameLength',
    },
  },

}

export { addSecretErrors, deleteSecretErrors }