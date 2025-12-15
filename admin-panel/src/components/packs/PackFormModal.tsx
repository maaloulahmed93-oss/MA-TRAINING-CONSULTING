import { useState, useEffect, ChangeEvent, FC } from 'react';
import { X, Package, Tag, DollarSign, Info, List, Plus, Trash2, BookOpen, Zap, LucideProps } from 'lucide-react';
import { Pack, Module, Theme } from '../../types/index';

// --- Type Definitions ---
interface PackFormModalProps { isOpen: boolean; onClose: () => void; onSave: (pack: Pack) => void; pack: Pack | null; }

// --- Reusable Input Component Props ---
interface InputFieldProps { icon: FC<LucideProps>; label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string; type?: string; }

// --- Reusable Input Component ---
const InputField: FC<InputFieldProps> = ({ icon: Icon, label, name, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon className="h-5 w-5 text-gray-400" /></div>
            <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
    </div>
);

// --- Main Modal Component ---
const PackFormModal: React.FC<PackFormModalProps> = ({ isOpen, onClose, onSave, pack }) => {
  const [formData, setFormData] = useState<Pack | null>(null);
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newModuleTitles, setNewModuleTitles] = useState<{ [themeId: string]: string }>({});

  useEffect(() => {
    if (pack) setFormData(JSON.parse(JSON.stringify(pack)));
    else setFormData({ packId: `new-pack-${Date.now()}`, name: '', description: '', image: '', niveau: '', resourcesCount: 0, details: { themes: [], advantages: [], price: 0, originalPrice: 0, savings: 0 } });
    setNewAdvantage('');
    setNewModuleTitles({});
  }, [pack, isOpen]);

  // --- General & Pricing Handlers ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    if (name === 'price') {
        // Convert to number if it's numeric, otherwise store as 0
        const numValue = parseInt(value) || 0;
        setFormData({ ...formData, details: { ...formData.details, price: numValue } });
    } else if (name === 'resourcesCount') {
        // Only allow numbers for resourcesCount
        if (/^\d*$/.test(value)) {
            setFormData({ ...formData, [name]: parseInt(value) || 0 });
        }
    } else setFormData({ ...formData, [name]: value });
  };

  // --- Advantage Handlers ---
  const handleAddAdvantage = () => {
    if (newAdvantage.trim() && formData) {
      setFormData({ ...formData, details: { ...formData.details, advantages: [...formData.details.advantages, newAdvantage.trim()] } });
      setNewAdvantage('');
    }
  };
  const handleRemoveAdvantage = (index: number) => {
    if (formData) setFormData({ ...formData, details: { ...formData.details, advantages: formData.details.advantages.filter((_, i) => i !== index) } });
  };

  // --- Theme Handlers ---
  const handleAddTheme = () => {
    if (!formData) return;
    const newTheme: Theme = { themeId: `theme-${Date.now()}`, name: 'Nouveau Thème', startDate: '', endDate: '', modules: [] };
    setFormData({ ...formData, details: { ...formData.details, themes: [...formData.details.themes, newTheme] } });
  };
  const handleRemoveTheme = (themeId: string) => {
    if (formData) setFormData({ ...formData, details: { ...formData.details, themes: formData.details.themes.filter(t => t.themeId !== themeId) } });
  };
  const handleThemeChange = (e: ChangeEvent<HTMLInputElement>, themeId: string) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, details: { ...formData.details, themes: formData.details.themes.map(t => t.themeId === themeId ? { ...t, [name]: value } : t) } });
  };

  // --- Module Handlers ---
  const handleAddModule = (themeId: string) => {
    const moduleTitle = newModuleTitles[themeId]?.trim();
    if (moduleTitle && formData) {
        const newModule: Module = { moduleId: `module-${Date.now()}`, title: moduleTitle };
        setFormData({ ...formData, details: { ...formData.details, themes: formData.details.themes.map(t => t.themeId === themeId ? { ...t, modules: [...t.modules, newModule] } : t) } });
        setNewModuleTitles({ ...newModuleTitles, [themeId]: '' });
    }
  };
  const handleRemoveModule = (themeId: string, moduleId: string) => {
    if (formData) setFormData({ ...formData, details: { ...formData.details, themes: formData.details.themes.map(t => t.themeId === themeId ? { ...t, modules: t.modules.filter(m => m.moduleId !== moduleId) } : t) } });
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800">{pack ? 'Modifier le Pack' : 'Ajouter un Pack'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"><X size={24} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 flex-grow">
            {/* General Info */}
            <div className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Package size={20} className="mr-2"/>Informations Générales</h3>
                <InputField icon={Tag} label="Nom du Pack" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Pack Marketing Digital" />
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                         <div className="pointer-events-none absolute top-3 left-0 pl-3"><Info className="h-5 w-5 text-gray-400"/></div>
                        <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} placeholder="Une brève description..." className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 sm:text-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                        <select id="niveau" name="niveau" value={formData.niveau} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option value="">Sélectionner un niveau</option>
                            <option value="Débutant">Débutant</option>
                            <option value="Intermédiaire">Intermédiaire</option>
                            <option value="Avancé">Avancé</option>
                        </select>
                    </div>
                    <InputField icon={Zap} label="Nombre de Resources & Vidéo" name="resourcesCount" type="text" value={formData.resourcesCount.toString()} onChange={handleChange} placeholder="e.g., 25" />
                </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><DollarSign size={20} className="mr-2"/>Tarification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField icon={DollarSign} label="Prix de Vente (DT)" name="price" type="text" value={formData.details.price.toString()} onChange={handleChange} placeholder="e.g., 2200" />
                </div>
            </div>

            {/* Advantages */}
            <div className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><List size={20} className="mr-2"/>Avantages du Pack</h3>
                <div className="space-y-2">
                    {formData.details.advantages.map((advantage, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                            <p className="text-sm text-gray-800">{advantage}</p>
                            <button onClick={() => handleRemoveAdvantage(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <input type="text" value={newAdvantage} onChange={(e) => setNewAdvantage(e.target.value)} placeholder="Ajouter un nouvel avantage" className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 sm:text-sm" />
                    <button onClick={handleAddAdvantage} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Plus size={20} /></button>
                </div>
            </div>

            {/* Themes Section */}
            <div className="space-y-4 p-6 border rounded-lg">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center"><BookOpen size={20} className="mr-2"/>Thèmes & Modules</h3>
                    <button onClick={handleAddTheme} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"><Plus size={16}/>Ajouter un thème</button>
                </div>
                <div className="space-y-4">
                    {formData.details.themes.map((theme) => (
                        <div key={theme.themeId} className="border rounded-md p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <input type="text" name="name" value={theme.name} onChange={(e) => handleThemeChange(e, theme.themeId)} placeholder="Nom du thème" className="text-md font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"/>
                                <button onClick={() => handleRemoveTheme(theme.themeId)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            </div>
                            {/* Modules subsection */}
                            <div className="pl-4 border-l-2 border-blue-200">
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Modules</h4>
                                <div className="space-y-2">
                                    {theme.modules.map((module) => (
                                        <div key={module.moduleId} className="flex items-center justify-between bg-white p-2 rounded-md border">
                                            <p className="text-sm text-gray-800">{module.title}</p>
                                            <button onClick={() => handleRemoveModule(theme.themeId, module.moduleId)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    {!theme.modules.length && <p className='text-xs text-gray-500 text-center'>Aucun module ajouté.</p>}
                                </div>
                                <div className="flex items-center gap-2 pt-2 mt-2">
                                    <input type="text" value={newModuleTitles[theme.themeId] || ''} onChange={(e) => setNewModuleTitles({...newModuleTitles, [theme.themeId]: e.target.value})} placeholder="Titre du nouveau module" className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 sm:text-sm" />
                                    <button onClick={() => handleAddModule(theme.themeId)} className="p-2 bg-blue-500 text-white rounded-md"><Plus size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!formData.details.themes.length && <p className='text-sm text-gray-500 text-center py-4'>Aucun thème ajouté. Cliquez sur 'Ajouter un thème' pour commencer.</p>}
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-4 p-4 border-t bg-gray-50 sticky bottom-0 rounded-b-2xl z-10">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Annuler</button>
            <button onClick={() => {
              if (!formData.name.trim()) {
                alert('❌ Le nom du pack est requis');
                return;
              }
              if (!formData.niveau) {
                alert('❌ Le niveau est requis');
                return;
              }
              if (!formData.details.price) {
                alert('❌ Le prix est requis');
                return;
              }
              onSave(formData);
            }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">{pack ? 'Sauvegarder' : 'Créer le Pack'}</button>
        </div>
      </div>
    </div>
  );
};

export default PackFormModal;
