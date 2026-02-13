import React from 'react';

function SuccessMessage(props) {
  return (
    <section className=' mt-5'>
      <div className='bg-green-100 text-green-600 px-2 py-2 rounded flex'>
        <svg
          className='w-4 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3'
          viewBox='0 0 16 16'
        >
          <path d='M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM7 11.4L3.6 8 5 6.6l2 2 4-4L12.4 6 7 11.4z' />
        </svg>
        <span className=' text-sm'>{props.message}</span>
      </div>
    </section>
  );
}

export default SuccessMessage;