import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

function BarcodeGeneratorFunction({ value }) {
  const barcodeRef = useRef();

  useEffect(() => {
    JsBarcode(barcodeRef.current, value, {
      format: 'CODE128',
      width: 1.7,
      height: 30,
      displayValue: false
    });
  }, [value]);

  return (
    <div>
      <svg ref={barcodeRef}></svg>
    </div>
  );
}

export default BarcodeGeneratorFunction;
