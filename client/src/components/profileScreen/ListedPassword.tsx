import { useRef, useState, useEffect } from 'react'
import { AnyAction } from 'redux'
import { Transition } from '@headlessui/react'
import { RiHashtag, RiLockPasswordFill } from 'react-icons/ri'
import { FaEye, FaEyeSlash, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { useAppSelector, useAppDispatch } from '../../features/store'
import { getUserPassword, idPasswordReset} from '../../features/passwordSlices/getUserPassword'
import { getTotpSecret, generateTotpCode, setTotpSecret} from '../../api/axiosProtected'
import { tr } from '../../translations/translations'


export interface ListedPasswordObject {
  _id: string
  name: string
  totpSecret: string|null
}
interface ListedPasswordProps {
  listedPassword: ListedPasswordObject
  setEditPasswordModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  setAddTotpModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPasswordToEdit: React.Dispatch<React.SetStateAction<{ id: string; name: string; password: string }>>
  confirmDeleteModalIsOpen: boolean
  setConfirmDeleteModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPasswordToDelete: React.Dispatch<React.SetStateAction<{ id: string; name: string }>>
  setPasswordToAddTotp: React.Dispatch<React.SetStateAction<{ id: string; name: string; password: string }>>
}

const ListedPassword = (props: ListedPasswordProps) => {
  //variables
  const getUserPasswordAbort1 = useRef<(reason?: string | undefined) => void>()
  const getUserPasswordAbort2 = useRef<(reason?: string | undefined) => void>()

  const { language } = useAppSelector(state => state.appSettings)
  const { loading } = useAppSelector(state => state.getUserPasswords)
  const { loading: loading2 } = useAppSelector(state => state.getUserPassword)
  const dispatch = useAppDispatch()

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordString, setPasswordString] = useState('')
    const [totpCode, setTotpCode] = useState('')
    const [totpVisible, setTotpVisible] = useState(false)
    const [totpSecret, setTotpSecretState] = useState(''); // Stato per il segreto TOTP
    const [isAddTotpModalOpen, setIsAddTotpModalOpen] = useState(false); // Stato per il modal AddTotpModal

  //handlers
  const showPasswordHandler = () => {
    if (!passwordVisible) {
      const getUserPasswordPromise = dispatch(getUserPassword({ id: props.listedPassword._id }) as unknown as AnyAction)
      getUserPasswordAbort1.current = getUserPasswordPromise.abort
      getUserPasswordPromise
        .unwrap()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((payload: any) => {
          setPasswordString(payload.password)
          setPasswordVisible(true)
          dispatch(idPasswordReset(null))
        })
        .catch((error: unknown) => error)
    } else {
      setPasswordVisible(false)
      setPasswordString('')
    }
  }

  const openEditPasswordModalHandler = () => {
    const getUserPasswordPromise = dispatch(getUserPassword({ id: props.listedPassword._id }) as unknown as AnyAction)
    getUserPasswordAbort2.current = getUserPasswordPromise.abort
    getUserPasswordPromise
      .unwrap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((payload: any) => {
        props.setPasswordToEdit({ id: payload._id, name: props.listedPassword.name, password: payload.password })
        props.setEditPasswordModalIsOpen(true)
        dispatch(idPasswordReset(null))
      })
      .catch((error: unknown) => error)
  }

  const openConfirmDeleteModalHandler = () => {
    props.setPasswordToDelete({ id: props.listedPassword._id, name: props.listedPassword.name })
    props.setConfirmDeleteModalIsOpen(true)
  }
  
  const openAddTotpModalHandler = () => {
    const getUserPasswordPromise = dispatch(getUserPassword({ id: props.listedPassword._id }) as unknown as AnyAction)
    getUserPasswordAbort2.current = getUserPasswordPromise.abort
    getUserPasswordPromise
      .unwrap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((payload: any) => {
        props.setPasswordToAddTotp({ id: payload._id, name: props.listedPassword.name, password: payload.password })
        props.setAddTotpModalIsOpen(true) 
        setIsAddTotpModalOpen(true)
        dispatch(idPasswordReset(null))
      })
      .catch((error: unknown) => error)
  }

  const getTotpCodeHandler = async () => {
    
    try {
      const code = await generateTotpCode(props.listedPassword._id);
      setTotpCode(code);
      setTotpVisible(!totpVisible);
      console.log('TOTP code:', totpCode);
    } catch (error) {
      console.error('Error generating TOTP code:', error);
    }
  };

  const setTotpSecretHandler = async () => {
    try {
      const response = await setTotpSecret(props.listedPassword._id, totpSecret);
      console.log('TOTP secret set successfully:', response);
    } catch (error) {
      console.error('Error setting TOTP secret:', error);
    }
  };

  //useEffects
  useEffect(() => {
    let isMounted = true; // Per evitare side effects dopo che il componente è smontato
  
    const fetchTotpSecret = async () => {
      try {
        const getUserPasswordPromise = dispatch(getUserPassword({ id: props.listedPassword._id }) as unknown as AnyAction);
        const result = await getUserPasswordPromise.unwrap();
  
        if (isMounted && result.totpSecret) {
          setTotpSecretState(result.totpSecret); // Imposta lo stato con il secret
        }
      } catch (error) {
        console.error('Error fetching TOTP secret:', error);
      }
    };
  
    fetchTotpSecret();
  
    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [dispatch, props.listedPassword._id]);

  return (
    <div className="relative flex flex-col md:flex-row justify-between items-start px-3 py-2 shadow-md rounded-2xl bg-privpass-400">
  
  {/* Sezione Informazioni */}
  <div className="flex-1 min-w-0 mb-4 md:mr-4 md:mb-0">
    <div className="mb-2">
      <div className="flex items-center text-xs">
        <RiHashtag className="mr-[2px]" />
        {tr('listedPassNameLabel', language)}
      </div>
      <div className="text-xl font-semibold truncate">{props.listedPassword.name}</div>
    </div>

    <div className="mb-4">
      <div className="text-xs flex items-center">
        <RiLockPasswordFill className="mr-[2px]" />
        {tr('listedPassPasswordLabel', language)}
      </div>

      <div className="flex items-center text-lg">
        <button
          disabled={loading || loading2}
          className="relative flex-none w-8 h-8 p-2 mr-2 transition border rounded-full text-privpass-200 border-privpass-200 hover:border-privpass-100 hover:text-privpass-100 active:scale-95 disabled:hover:border-privpass-200 disabled:hover:text-privpass-200 disabled:cursor-default disabled:active:scale-100"
          onClick={showPasswordHandler}
        >
          <FaEye
            className={`absolute left-[6px] top-[6px] transition-opacity ${
              !passwordVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <FaEyeSlash
            className={`absolute left-[6px] top-[6px] transition-opacity ${
              passwordVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
        <div className="relative w-full overflow-x-auto overflow-y-hidden h-14">
          <Transition
            className="absolute top-0 left-0 pt-[17px] text-2xl h-14"
            show={!passwordVisible}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {'************'}
          </Transition>
          <Transition
            className="absolute top-0 left-0 h-14 pt-[14px] pb-[6px] select-all tracking-widest monospace-font"
            show={passwordVisible}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {passwordString}
          </Transition>
        </div>
      </div>
    </div>

    {/* Sezione TOTP (condizionale) */}
    {totpSecret && (
      <div className="mb-4">
        <div className="text-xs flex items-center">
          <RiLockPasswordFill className="mr-[2px]" />
          {tr('totpCode', language)}
        </div>

        <div className="flex items-center text-lg">
          <button
            disabled={loading || loading2}
            className="relative flex-none w-8 h-8 p-2 mr-2 transition border rounded-full text-privpass-200 border-privpass-200 hover:border-privpass-100 hover:text-privpass-100 active:scale-95 disabled:hover:border-privpass-200 disabled:hover:text-privpass-200 disabled:cursor-default disabled:active:scale-100"
            onClick={getTotpCodeHandler}
          >
            <FaEye
              className={`absolute left-[6px] top-[6px] transition-opacity ${
                !totpVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <FaEyeSlash
              className={`absolute left-[6px] top-[6px] transition-opacity ${
                totpVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
          <div className="relative w-full overflow-x-auto overflow-y-hidden h-14">
            <Transition
              className="absolute top-0 left-0 pt-[17px] text-2xl h-14"
              show={!totpVisible}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {'************'}
            </Transition>
            <Transition
              className="absolute top-0 left-0 h-14 pt-[14px] pb-[6px] select-all tracking-widest monospace-font"
              show={totpVisible}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {totpCode}
            </Transition>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Sezione Bottoni */}
  <div className="grid grid-flow-col gap-2 md:grid-flow-row md:gap-2">
    <button
      disabled={loading || loading2}
      className="flex items-center justify-center w-24 px-4 py-2 text-sm transition rounded-full bg-cyan-500 hover:bg-cyan-400 active:scale-95 disabled:hover:bg-cyan-500 disabled:cursor-default disabled:active:scale-100"
      onClick={openEditPasswordModalHandler}
    >
      <FaEdit className="mr-2" />
      {tr('listedPassEdit', language)}
    </button>

    <button
      disabled={loading || loading2}
      className="flex items-center justify-center w-24 px-4 py-2 text-sm transition rounded-full bg-privpass-700 hover:bg-privpass-800 active:scale-95 disabled:hover:bg-privpass-700 disabled:cursor-default disabled:active:scale-100"
      onClick={openAddTotpModalHandler}
    >
      <FaPlus className="mr-2" />
      {tr('listedPassTotp', language)}
    </button>

    <button
      disabled={loading || loading2}
      className="flex items-center justify-center w-24 px-4 py-2 text-sm transition bg-red-400 rounded-full hover:bg-red-300 active:scale-95 disabled:hover:bg-red-400 disabled:cursor-default disabled:active:scale-100"
      onClick={openConfirmDeleteModalHandler}
    >
      <FaTrashAlt className="mr-2" />
      {tr('listedPassDelete', language)}
    </button>
  </div>
</div>
  )
}

export default ListedPassword
