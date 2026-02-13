import React from 'react';

function ErrorMessage(props) {
  return (
    <section className=' mt-5'>
      <div className='bg-red-100 text-red-600 px-2 py-2 rounded flex'>
        <svg
          className='w-3 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3'
          viewBox='0 0 16 16'
        >
          <path d='M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z' />
        </svg>
        <span className=' text-sm'>{props.message}</span>
      </div>
    </section>
  );
}

export default ErrorMessage;