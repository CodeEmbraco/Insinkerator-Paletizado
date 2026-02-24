import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

function BarcodeGeneratorFunction({ value }) {
  const barcodeRef = useRef();

  useEffect(() => {
    JsBarcode(barcodeRef.current, value, {
      format: 'CODE128',
      width: 2,
      height: 70,
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
