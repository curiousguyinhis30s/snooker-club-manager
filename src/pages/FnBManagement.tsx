import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, UtensilsCrossed } from 'lucide-react';
import type { MenuItem, Bundle } from '../types';
import { useToast } from '../contexts/ToastContext';

interface FnBManagementProps {
  menuItems: MenuItem[];
  bundles?: Bundle[];
  onSaveMenuItems: (items: MenuItem[]) => void;
  onSaveBundles?: (bundles: Bundle[]) => void;
  userRole?: string;
}

export default function FnBManagement({ menuItems, bundles = [], onSaveMenuItems, onSaveBundles, userRole }: FnBManagementProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [bundleList, setBundleList] = useState<Bundle[]>(bundles);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'drinks' as const });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: 'drinks' as const });
  const [showBundleForm, setShowBundleForm] = useState(false);
  const [newBundle, setNewBundle] = useState({
    name: '',
    description: '',
    icon: '🎁',
    discount: 15,
    items: [] as { menuItemId: string; quantity: number }[]
  });

  const categories = [
    { id: 'drinks', label: 'Drinks', icon: '🥤' },
    { id: 'snacks', label: 'Snacks', icon: '🍟' },
    { id: 'meals', label: 'Meals', icon: '🍽️' },
  ];

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const item: MenuItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: true,
      };
      const updated = [...items, item];
      setItems(updated);
      setNewItem({ name: '', price: '', category: 'drinks' });
    }
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
  };

  const handleToggleAvailability = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    setItems(updated);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, price: item.price.toString(), category: item.category });
  };

  const saveEdit = () => {
    if (editingId && editForm.name && editForm.price) {
      const updated = items.map(item =>
        item.id === editingId
          ? { ...item, name: editForm.name, price: parseFloat(editForm.price), category: editForm.category }
          : item
      );
      setItems(updated);
      setEditingId(null);
    }
  };

  const handleSaveAll = () => {
    onSaveMenuItems(items);
    if (onSaveBundles) {
      onSaveBundles(bundleList);
    }
    showToast('F&B menu saved successfully!', 'success');
  };

  const handleAddBundle = () => {
    if (newBundle.name && newBundle.items.length > 0) {
      const originalPrice = newBundle.items.reduce((sum, item) => {
        const menuItem = items.find(i => i.id === item.menuItemId);
        return sum + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);

      const bundlePrice = originalPrice * (1 - newBundle.discount / 100);

      const bundle: Bundle = {
        id: `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: newBundle.name,
        description: newBundle.description,
        items: newBundle.items,
        originalPrice,
        bundlePrice,
        discount: newBundle.discount,
        available: true,
        icon: newBundle.icon,
      };

      setBundleList([...bundleList, bundle]);
      setNewBundle({
        name: '',
        description: '',
        icon: '🎁',
        discount: 15,
        items: []
      });
      setShowBundleForm(false);
    }
  };

  const handleDeleteBundle = (id: string) => {
    setBundleList(bundleList.filter(b => b.id !== id));
  };

  const handleToggleBundleAvailability = (id: string) => {
    setBundleList(bundleList.map(b =>
      b.id === id ? { ...b, available: !b.available } : b
    ));
  };

  const addItemToBundle = () => {
    setNewBundle({
      ...newBundle,
      items: [...newBundle.items, { menuItemId: items[0]?.id || '', quantity: 1 }]
    });
  };

  const updateBundleItem = (index: number, field: 'menuItemId' | 'quantity', value: string | number) => {
    const updatedItems = [...newBundle.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewBundle({ ...newBundle, items: updatedItems });
  };

  const removeBundleItem = (index: number) => {
    setNewBundle({ ...newBundle, items: newBundle.items.filter((_, i) => i !== index) });
  };

  const categoryItems = (cat: string) => items.filter(item => item.category === cat);

  return (
    <div className="h-full bg-gray-50 p-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-slate-800" />
          <div>
            <h1 className="text-base font-bold text-gray-900">F&B Management</h1>
            <p className="text-[10px] text-gray-500">Manage food & beverage menu</p>
          </div>
        </div>
        <button onClick={handleSaveAll} className="px-2.5 py-1 text-[10px] bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-sm flex items-center gap-1">
          <Save className="w-3 h-3" /> Save Menu
        </button>
      </div>

      {/* Add New Item - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 mb-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="input flex-1"
          />
          <input
            type="number"
            placeholder="Price"
            step="0.5"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="input w-20"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
            className="input w-auto text-xs"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <button onClick={handleAddItem} className="px-2 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto space-y-2">

      {/* Bundles Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-gray-700">Bundles ({bundleList.length})</h2>
          <button onClick={() => setShowBundleForm(!showBundleForm)} className="text-[10px] text-slate-800 hover:text-slate-900">
            + Create
          </button>
        </div>

        {/* Bundle Creation Form - Compact */}
        {showBundleForm && (
          <div className="bg-gray-50 rounded-md p-2 mb-2 border border-gray-200">
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <input type="text" placeholder="Name" value={newBundle.name} onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })} className="input col-span-2" />
                <input type="text" placeholder="Icon" value={newBundle.icon} onChange={(e) => setNewBundle({ ...newBundle, icon: e.target.value })} className="input" />
                <input type="number" placeholder="% off" value={newBundle.discount} onChange={(e) => setNewBundle({ ...newBundle, discount: parseInt(e.target.value) })} className="input" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Items ({newBundle.items.length})</span>
                <button onClick={addItemToBundle} className="text-[10px] text-slate-800">+ Add</button>
              </div>
              {newBundle.items.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <select value={item.menuItemId} onChange={(e) => updateBundleItem(index, 'menuItemId', e.target.value)} className="input flex-1 text-xs">
                    {items.map(menuItem => (<option key={menuItem.id} value={menuItem.id}>{menuItem.name} - ${menuItem.price}</option>))}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateBundleItem(index, 'quantity', parseInt(e.target.value))} className="input w-12" />
                  <button onClick={() => removeBundleItem(index)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={handleAddBundle} className="flex-1 px-2 py-1 text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-sm">Create</button>
                <button onClick={() => setShowBundleForm(false)} className="px-2 py-1 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Bundles - Compact */}
        {bundleList.length === 0 ? (
          <p className="text-gray-400 text-center py-2 text-[10px]">No bundles</p>
        ) : (
          <div className="space-y-1">
            {bundleList.map((bundle) => (
              <div key={bundle.id} className="flex items-center justify-between py-1 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{bundle.icon}</span>
                  <span className="text-xs text-gray-900">{bundle.name}</span>
                  <span className="text-[10px] text-gray-500">{bundle.items.length} items · <span className="line-through">${bundle.originalPrice.toFixed(0)}</span> <span className="font-medium">${bundle.bundlePrice.toFixed(0)}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleToggleBundleAvailability(bundle.id)} className={`px-1.5 py-0.5 rounded text-[10px] ${bundle.available ? 'bg-slate-50 text-slate-900' : 'bg-gray-100 text-gray-400'}`}>
                    {bundle.available ? 'On' : 'Off'}
                  </button>
                  <button onClick={() => handleDeleteBundle(bundle.id)} className="p-0.5 text-gray-400 hover:text-gray-600"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Categories - Compact */}
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-2 py-1.5 border-b border-gray-200 flex items-center gap-1.5">
            <span className="text-sm">{category.icon}</span>
            <span className="text-xs font-medium text-gray-900">{category.label}</span>
            <span className="text-[10px] text-gray-500">({categoryItems(category.id).length})</span>
          </div>
          <div className="p-2">
            {categoryItems(category.id).length === 0 ? (
              <p className="text-gray-400 text-center py-2 text-[10px]">No items</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
                {categoryItems(category.id).map((item) => (
                  <div key={item.id} className={`p-1.5 rounded border ${item.available ? 'border-gray-200' : 'border-red-200 bg-red-50 opacity-60'}`}>
                    {editingId === item.id ? (
                      <div className="space-y-1">
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded" />
                        <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded" />
                        <div className="flex gap-1">
                          <button onClick={saveEdit} className="flex-1 p-0.5 text-slate-800 bg-slate-50 rounded"><Save className="w-3 h-3 mx-auto" /></button>
                          <button onClick={() => setEditingId(null)} className="flex-1 p-0.5 text-gray-600 bg-gray-100 rounded"><X className="w-3 h-3 mx-auto" /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-900 truncate flex-1">{item.name}</span>
                          <span className="text-[11px] font-medium text-gray-700 ml-1">{item.price.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <button onClick={() => handleToggleAvailability(item.id)} className={`w-4 h-4 rounded text-[9px] flex items-center justify-center ${item.available ? 'bg-slate-100 text-slate-900' : 'bg-red-100 text-red-600'}`}>
                            {item.available ? '✓' : '✗'}
                          </button>
                          <div className="flex">
                            <button onClick={() => startEdit(item)} className="p-0.5 text-gray-400 hover:text-gray-600"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-0.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
