import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
const Categories = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState('ropa');

  const categories = {
    all: {
      title: 'Todas las categorías',
      items: [
        {
          id: 'ropa',
          name: 'Ropa',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Vestidos', 'Pantalones', 'Faldas', 'Shorts', 'Chaquetas', 'Sudaderas', 'Camisas', 'Polos', 'Trajes', 'Túnicas']
        },
        {
          id: 'zapatos',
          name: 'Zapatos',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Tenis', 'Botas', 'Sandalias', 'Chanclas']
        },
        {
          id: 'bolsos',
          name: 'Bolsos',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Mochilas', 'Carteras', 'Bolsas de mano', 'Crossbody']
        },
        {
          id: 'artesanal',
          name: 'Artesanal',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Accesorios hechos a mano', 'Joyería artesanal', 'Arte local']
        },
        {
          id: 'accesorios',
          name: 'Accesorios',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Gorras', 'Pañuelos', 'Cinturones', 'Guantes']
        }
      ]
    },
    women: {
      title: 'Categorías Mujeres',
      items: [
        {
          id: 'ropa-mujeres',
          name: 'Ropa',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Vestidos', 'Pantalones', 'Faldas', 'Shorts', 'Blusas', 'Suéteres']
        },
        {
          id: 'zapatos-mujeres',
          name: 'Zapatos',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Tacones', 'Tenis', 'Botas', 'Sandalias']
        },
        {
          id: 'bolsos-mujeres',
          name: 'Bolsos',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Bolsas de mano', 'Mochilas', 'Carteras']
        }
      ]
    },
    men: {
      title: 'Categorías Hombres',
      items: [
        {
          id: 'ropa-hombres',
          name: 'Ropa',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Camisas', 'Pantalones', 'Shorts', 'Chaquetas', 'Suéteres']
        },
        {
          id: 'zapatos-hombres',
          name: 'Zapatos',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Tenis', 'Botas', 'Sandalias']
        },
        {
          id: 'accesorios-hombres',
          name: 'Accesorios',
          image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png',
          subcategories: ['Gorras', 'Cinturones', 'Relojes']
        }
      ]
    }
  };

  const currentCategories = categories[activeTab];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{currentCategories.title}</h1>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['all', 'women', 'men'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedCategory('ropa');
            }}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'all' ? 'Todos' : tab === 'women' ? 'Mujeres' : 'Hombres'}
          </button>
        ))}
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {currentCategories.items.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              {expandedCategory === category.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Subcategories */}
            {expandedCategory === category.id && (
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {category.subcategories.map((subcategory, idx) => (
                    <button
                      key={idx}
                      className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors border border-gray-200 hover:border-gray-300"
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-around items-center mt-8 pt-6 border-t border-gray-200">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Categories;
