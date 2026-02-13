import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icons from '../assets/icons/icons';
import { useForm } from 'react-hook-form';
// import AuthImage from '../images/auth-image.jpg';
import ButtonLoading from '../helpers/ButtonLoading';
import ErrorMessage from '../helpers/ErrorMessage';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendData,
  selectIsCorrect,
  selectLoading,
} from '../store/slice/authSlice';

function Signin() {
  const dispatch = useDispatch();

  const isCorrect = useSelector(selectIsCorrect);
  const loading = useSelector(selectLoading);

  const navigate = useNavigate();

  const [eye, setEye] = useState(false);
  const toggleEye = () => setEye(!eye);

  const submit = (data) => {
    dispatch(sendData(data, navigate));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleButtonLogin = () => {
    return !loading ? (
      <button
        type='submit'
        className='btn bg-primary text-white hover:bg-green-500 font-semibold w-full h-12'
      >
        Iniciar sesión
      </button>
    ) : (
      <div>
        <ButtonLoading loading='Iniciando' />
      </div>
    );
  };

  const handleErrorMsg = () => {
    return (
      <>
        {isCorrect?.state === true && isCorrect?.code === 500 && (
          <ErrorMessage
            message='
              Error de servidor. Por favor vuelva a intentarlo más tarde.'
          />
        )}
        {isCorrect?.state === true && isCorrect?.code === 400 && (
          <ErrorMessage
            message='
              Correo o contraseña incorrectos.'
          />
        )}
        {isCorrect?.state === true && isCorrect?.code === 401 && (
          <ErrorMessage
            message='
            Correo o contraseña incorrectos.'
          />
        )}
        {isCorrect?.state === true && isCorrect?.code === 404 && (
          <ErrorMessage
            message='
            Error de servidor. Por favor vuelva a intentarlo más tarde.'
          />
        )}
      </>
    );
  };

  return (
    <section>
    <div className='flex flex-col items-center justify-center mx-auto md:h-screen lg:py-0'>

    <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
          <img src={icons.logoNide} alt='Logo' className='w-36' />
      </a>
      <div className=" bg-white w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        {/* Content */}
          <div className='bg-white p-6 space-y-2 md:space-y-6 sm:p-8'>
            {/* Header */}
              <h1 className='bg-white text-3xl text-slate-800 font-semibold text-left'>
                Hola de nuevo 👋
                <p className='bg-white text-sm font-normal text-black'>
                Ingresa tus credenciales para acceder al sistema de <span className="text-primary font-semibold">Genealogía y Paletización</span>.
                </p>
              </h1>
              {/* Form */}
              <form className='bg-white' onSubmit={handleSubmit(submit)}>
                <div className='space-y-4 bg-white'>
                  <div className='bg-white'>
                    <label
                      className='flex block text-sm font-semibold mb-1 text-black bg-white'
                      htmlFor='email'
                    >
                      Correo:
                    </label>
                    <input
                      id='email'
                      className='form-input w-full h-12'
                      type='text'
                      autoComplete='off'
                      {...register('email', {
                        required: {
                          value: true,
                          message: 'El campo es requerido',
                        },
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: 'El formato no es correcto',
                        },
                      })}
                    />
                    {errors.email && (
                      <span className='flex text-red-500 text-sm bg-white'>
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className='bg-white'>
                    <label
                      className='flex block text-sm font-semibold mb-1 text-black bg-white'
                      htmlFor='password'
                    >
                      Contraseña:
                    </label>

                    <div className='focus-within:text-primary w-full h-12'>
                      <input
                        maxLength='35'
                        className='form-input w-full h-12'
                        type={eye ? 'text' : 'password'}
                        autoComplete='off'
                        {...register('password', {
                          required: {
                            value: true,
                            message: 'El campo es requerido',
                          },
                        })}
                      />

                      <section className='relative bg-white'>
                        <button
                          type='button'
                          className='absolute inset-2 -top-10 left-auto flex items-center'
                        >
                          {eye ? (
                            <img
                              onClick={toggleEye}
                              src={icons.openEye}
                              alt='Ojo abierto'
                            />
                          ) : (
                            <img
                              onClick={toggleEye}
                              src={icons.closedEye}
                              alt='Ojo cerrado'
                            />
                          )}
                        </button>
                      </section>
                    </div>
                    {errors.password && (
                      <span className='flex text-red-500 text-sm bg-white'>
                        {errors.password.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex flex-col mt-4 bg-white'>
                  <div className='text-right mb-4 bg-white'>
                    <Link
                      className='text-sm font-semibold text-primary bg-white'
                      to='/reset-password'
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  {handleButtonLogin()}
                </div>
              </form>

              <footer className='pt-5 mt-6 bg-white'>{handleErrorMsg()}</footer>
             
            </div>
            
          </div>
         <div className='mt-12'>
            <img src={icons.atlasBadge} alt='Logo' className='w-24' />
         </div>
        </div>
    </section>
  );
}

export default Signin;