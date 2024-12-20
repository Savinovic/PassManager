import { useRef, useState, useEffect, Fragment } from 'react'
import { AnyAction } from 'redux'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Transition, Dialog } from '@headlessui/react'
import { FaTimes } from 'react-icons/fa'
import { useAppSelector, useAppDispatch } from '../../features/store'
import { successReset, errorReset } from '../../features/passwordSlices/createUserPassword'
import { addSecretErrors } from '../../validations/totpValidations'


import { setTotpSecret } from '../../features/totpSlices/setTotpSecret';
import Success from '../universal/Success'
import Error from '../universal/Error'
import Loader from '../universal/Loader'
import { tr } from '../../translations/translations'

interface AddTotpModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  passwordToAddTotp: { id: string; name: string; password: string }
  setPasswordToAddTotp: React.Dispatch<React.SetStateAction<{ id: string; name: string; password: string }>>
  onTotpAdded: () => void
}

interface AddTotpFormValues {
  addSecret: string
}

const AddTotpModal = (props: AddTotpModalProps) => {
  //variables
  const isMounted = useRef(true)
  const getUserPasswordsAbort = useRef<(reason?: string | undefined) => void>()

  const { language } = useAppSelector(state => state.appSettings)
  const { loading, success, successMessage, error, errorMessage } = useAppSelector(state => state.createPasswordTotp)
  const dispatch = useAppDispatch()

  const [secretToShow, setSecretToShow] = useState(false)

  const {
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTotpFormValues>({
    defaultValues: {
      addSecret: '',
    },
  })
  

  //handlers
  const closeHandler = () => {
    props.setIsOpen(false)
    setTimeout(() => {
      isMounted.current && setSecretToShow(false)
      reset()
      success && dispatch(successReset(null))
      error && dispatch(errorReset(null))
    }, 200)
  }

  const submitHandler: SubmitHandler<AddTotpFormValues> = async (data) => {
    try {
      await dispatch(
        setTotpSecret({
          id: props.passwordToAddTotp.id,
          secret: data.addSecret,
        }) as unknown as AnyAction
      ).unwrap();

      props.onTotpAdded();
      
      // Chiudi il modal
      closeHandler();
    } catch (error) {
      console.error('Error setting TOTP secret:', error);
      // Gestisci l'errore, ad esempio mostrando un messaggio
    }
  };
  
  const setTotpSecretHandler = async () => {
    try {
      // Get the entered secret from the form values
      const data = getValues(); // Retrieves all form values
      const secret = data.addSecret;
  
      // Dispatch the setTotpSecret action
      await dispatch(
        setTotpSecret({
          id: props.passwordToAddTotp.id,
          secret: secret,
        }) as unknown as AnyAction,
      ).unwrap();
      
  
      // Optionally, you can display a success message here
  
      // Close the modal
      closeHandler();
    } catch (error) {
      // Handle any errors
      console.error('Error setting TOTP secret:', error);
      // Optionally, you can set an error state to display an error message
    }
  };

  //useEffects
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (getUserPasswordsAbort.current) {
        getUserPasswordsAbort.current()
        dispatch(successReset(null))
        dispatch(errorReset(null))
      }
    }
  }, [isMounted, getUserPasswordsAbort, dispatch])

  return (
    <Transition as={Fragment} appear show={props.isOpen}>
      <Dialog as="div" className="relative z-30" onClose={() => !loading && closeHandler()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full px-4 py-6 text-center md:pt-16 md:pb-32">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                as="form"
                className="flex flex-col w-full max-w-md px-5 py-4 overflow-hidden bg-gray-100 rounded-lg shadow-md"
                onSubmit={handleSubmit(submitHandler)}
              >
                {/*modal header*/}
                <Dialog.Title className="flex items-center justify-between w-full text-2xl text-gray-800">
                  <div className="flex items-center">
                    <h2 className="font-semibold">{tr('addTotpModalHeader', language)}</h2>
                    <Loader isLoading={loading} styling="ml-2" />
                  </div>

                  <FaTimes
                    className="transition cursor-pointer hover:text-gray-700 active:scale-95"
                    onClick={() => !loading && closeHandler()}
                  />
                </Dialog.Title>

                {/*modal body*/}
                <div className="flex flex-col w-full mt-4 mb-5 overflow-y-auto">
                  <Success
                    isOpen={success && successMessage !== '' ? true : false}
                    message={successMessage}
                    styling="mx-1 mb-4"
                  />
                  <Error isOpen={error && errorMessage !== '' ? true : false} message={errorMessage} styling="mx-1 mb-4" />

                  <div className="flex flex-col text-gray-800 md:mx-6">
                    <label htmlFor="addSecret" className="mx-1 text-left">
                      {tr('addTotpModalSecret', language)}
                    </label>
                    <input
                      {...register('addSecret', addSecretErrors.addSecret)}
                      id="addSecret"
                      type="text"
                      placeholder={tr('addTotpModalSecretPlaceholder', language)}
                      className="px-3 py-2 m-1 border rounded-lg border-privpass-400 focus:outline-privpass-400"
                    />

                    <div className="grid mx-1">
                      <Error
                        isOpen={errors.addSecret?.type === 'required' ? true : false}
                        message={tr(addSecretErrors.addSecret.required.message, language)}
                        styling="mt-1"
                      />
                      <Error
                        isOpen={errors.addSecret?.type === 'maxLength' ? true : false}
                        message={tr(addSecretErrors.addSecret.maxLength.message, language)}
                        styling="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/*modal footer*/}
                <div className="flex justify-center w-full mb-1">
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-4 py-2 mr-2 text-white transition rounded-full bg-privpass-400 hover:opacity-80 active:scale-95 disabled:transition-opacity disabled:opacity-70 disabled:cursor-default disabled:active:scale-100"
                    onClick={setTotpSecretHandler}  
                  >
                    {tr('addTotpModalSubmit', language)}
                  </button>
                  <button
                    disabled={loading}
                    type="button"
                    className="px-4 py-2 text-white transition rounded-full bg-privpass-400 hover:opacity-80 active:scale-95 disabled:transition-opacity disabled:opacity-70 disabled:cursor-default disabled:active:scale-100"
                    onClick={() => !loading && closeHandler()}
                  >
                    {success ? tr('addTotpModalClose', language) : tr('addTotpModalCancel', language)}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default AddTotpModal