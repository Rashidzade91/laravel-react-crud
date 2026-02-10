import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductList from './components/ProductList';

// Laravel-in welcome.blade.php faylındakı "app" id-li div-i tapırıq
const rootElement = document.getElementById('app');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<ProductList />);
}
