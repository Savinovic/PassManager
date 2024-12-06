import { useRef, useState, useEffect, Fragment } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnyAction } from 'redux'
import { useForm, SubmitHandler } from 'react-hook-form'
import PasswordStrengthBar from 'react-password-strength-bar'
import { Transition, Dialog } from '@headlessui/react'
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAppSelector, useAppDispatch } from '../../features/store'
import { createUserPassword, successReset, errorReset } from '../../features/passwordSlices/createUserPassword'
import { getUserPasswords } from '../../features/passwordSlices/getUserPasswords'
import { addPasswordErrors } from '../../validations/passwordValidations'
import { addSecretErrors } from '../../validations/totpValidations'

import { createPasswordTotp } from '../../features/totpSlices/createPasswordTotp'
import Success from '../universal/Success'
import Error from '../universal/Error'
import Loader from '../universal/Loader'
import { tr } from '../../translations/translations'

interface AddTotpModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface AddTotpFormValues {
  addTotp: string
}

const AddTotpModal = (props: AddTotpModalProps) => {
  //variables
  const isMounted = useRef(true)
  const getPasswordsTotpAbort = useRef<(reason?: string | undefined) => void>()

  const { language } = useAppSelector(state => state.appSettings)
  const { loading, success, successMessage, error, errorMessage } = useAppSelector(state => state.createPasswordTotp)
  const dispatch = useAppDispatch()

  const [searchParams] = useSearchParams()

  const [secretToShow, setSecretToShow] = useState(false)

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPasswordSecretFormValues>({
    defaultValues: {
      addSecret: '',
    },
  })
  const watchAddTotp = watch('addTotp')

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

  const submitHandler: SubmitHandler<AddPasswordSecretFormValues> = data => {
    dispatch(
      createPasswordTotp({
        secret: data.addSecret,
      }) as unknown as AnyAction,
    )
      .unwrap()
      .then(() => {
        if (isMounted.current) {
          const getUserPasswordsPromise = dispatch(
            getUserPasswords({
              searchKeyword: searchParams.get('searchKeyword') || '',
              sortOrder: searchParams.get('sortOrder') || 'atoz',
            }) as unknown as AnyAction,
         )
          getUserPasswordsAbort.current = getUserPasswordsPromise.abort
        } else {
          dispatch(successReset(null))
          dispatch(errorReset(null))
        }
       })
      .catch((error: unknown) => error)
  }

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
                        isOpen={errors.addName?.type === 'required' ? true : false}
                        message={tr(addSecretErrors.addSecret.required.message, language)}
                        styling="mt-1"
                      />
                      <Error
                        isOpen={errors.addName?.type === 'maxLength' ? true : false}
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
                  >
                    {tr('addTotpModalSubmit', language)}
                  </button>
                  <button
                    disabled={loading}
                    type="button"
                    className="px-4 py-2 text-white transition rounded-full bg-privpass-400 hover:opacity-80 active:scale-95 disabled:transition-opacity disabled:opacity-70 disabled:cursor-default disabled:active:scale-100"
                    onClick={closeHandler}
                  >
                    {success ? tr('adTotpModalClose', language) : tr('addTotpModalCancel', language)}
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