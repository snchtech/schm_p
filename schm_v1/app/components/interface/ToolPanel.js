import React from 'react';
import PreviewLibrary from '../preview';

const ToolPanel = ({ addElement }) => {
    return (
        <div style={{ width: '200px', padding: '10px', background: '#8F4646' }}>
            <h3>Панель інструментів</h3>
            <button onClick={() => addElement('rect')}>Прямокутник</button>
            <button onClick={() => addElement('circle')}>Коло</button>
            <button onClick={() => addElement('line')}>Лінія</button>
            <button onClick={() => addElement('text')}>Текст</button>
            <button 
  onClick={() => addElement('symbol1')} 
  style={{ width: 32, height: 32, padding: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
>
  <div style={{ width: "100%" }}>
    <PreviewLibrary.symbol1Preview />
  </div>
</button>
        </div>
    );
};

export default ToolPanel;