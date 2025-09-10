import React, { useState, useRef } from "react";
import { Program, ProgramModule, ProgramSession } from "../types/program";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";

const initialProgramFormState: Omit<Program, "id"> = {
  level: "Avancé",
  category: "",
  price: 0,
  title: "",
  description: "",
  durationWeeks: 0,
  maxStudents: 0,
  sessionsPerYear: 0,
  modules: [],
  sessions: [],
};

const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState<Omit<Program, "id">>(
    initialProgramFormState
  );

  const newModuleInputRef = useRef<HTMLInputElement>(null);
  const newSessionTitleInputRef = useRef<HTMLInputElement>(null);
  const newSessionDateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (program: Program | null) => {
    setEditingProgram(program);
    setProgramForm(program ? { ...program } : initialProgramFormState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProgram(null);
    setProgramForm(initialProgramFormState);
  };

  const handleSaveProgram = () => {
    if (editingProgram) {
      setPrograms(
        programs.map((p) =>
          p.id === editingProgram.id ? { ...programForm, id: p.id } : p
        )
      );
    } else {
      const newProgram: Program = { ...programForm, id: `prog-${Date.now()}` };
      setPrograms([...programs, newProgram]);
    }
    handleCloseModal();
  };

  const handleDeleteProgram = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
      setPrograms(programs.filter((p) => p.id !== id));
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProgramForm((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "durationWeeks" ||
        name === "maxStudents" ||
        name === "sessionsPerYear"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const addModule = () => {
    const title = newModuleInputRef.current?.value;
    if (!title) return;
    const newModule: ProgramModule = { id: `mod-${Date.now()}`, title };
    setProgramForm((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
    if (newModuleInputRef.current) newModuleInputRef.current.value = "";
  };

  const removeModule = (id: string) => {
    setProgramForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== id),
    }));
  };

  const addSession = () => {
    const title = newSessionTitleInputRef.current?.value;
    const dateRange = newSessionDateInputRef.current?.value;
    if (!title || !dateRange) return;
    const newSession: ProgramSession = {
      id: `sess-${Date.now()}`,
      title,
      dateRange,
    };
    setProgramForm((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
    if (newSessionTitleInputRef.current)
      newSessionTitleInputRef.current.value = "";
    if (newSessionDateInputRef.current)
      newSessionDateInputRef.current.value = "";
  };

  const removeSession = (id: string) => {
    setProgramForm((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestion des Programmes
        </h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-md"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nouveau Programme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {program.category}
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {program.price}€
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-2">
                {program.title}
              </h3>
              <p className="text-gray-600 mt-2 text-sm h-16 overflow-hidden">
                {program.description}
              </p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => handleOpenModal(program)}
                className="p-2 text-gray-500 hover:text-blue-600"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteProgram(program.id)}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingProgram ? "Modifier le Programme" : "Nouveau Programme"}
              </h2>
              <button onClick={handleCloseModal}>
                <X />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              {/* Left Column */}
              <div className="space-y-4">
                <input
                  name="title"
                  value={programForm.title}
                  onChange={handleFormChange}
                  placeholder="Titre du Programme"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name="description"
                  value={programForm.description}
                  onChange={handleFormChange}
                  placeholder="Description"
                  className="w-full p-2 border rounded h-24"
                ></textarea>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="category"
                    value={programForm.category}
                    onChange={handleFormChange}
                    placeholder="Catégorie (e.g., Data Science)"
                    className="w-full p-2 border rounded"
                  />
                  <select
                    name="level"
                    value={programForm.level}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                  >
                    <option>Avancé</option>
                    <option>Intermédiaire</option>
                    <option>Débutant</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="price"
                    type="number"
                    value={programForm.price}
                    onChange={handleFormChange}
                    placeholder="Prix"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="durationWeeks"
                    type="number"
                    value={programForm.durationWeeks}
                    onChange={handleFormChange}
                    placeholder="Durée (semaines)"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="maxStudents"
                    type="number"
                    value={programForm.maxStudents}
                    onChange={handleFormChange}
                    placeholder="Max Étudiants"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="sessionsPerYear"
                    type="number"
                    value={programForm.sessionsPerYear}
                    onChange={handleFormChange}
                    placeholder="Sessions / an"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Modules Management */}
                <div>
                  <h3 className="font-semibold mb-2">Modules Inclus</h3>
                  <div className="flex gap-2 mb-2">
                    <input
                      ref={newModuleInputRef}
                      placeholder="Titre du nouveau module"
                      className="flex-grow p-2 border rounded"
                    />
                    <button
                      onClick={addModule}
                      className="bg-gray-200 px-3 rounded"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {programForm.modules.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between items-center bg-gray-100 p-1 rounded text-sm"
                      >
                        <span>{m.title}</span>
                        <button onClick={() => removeModule(m.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Sessions Management */}
                <div>
                  <h3 className="font-semibold mb-2">Sessions Disponibles</h3>
                  <div className="flex gap-2 mb-2">
                    <input
                      ref={newSessionTitleInputRef}
                      placeholder="Titre (e.g., Session 1)"
                      className="flex-grow p-2 border rounded"
                    />
                    <input
                      ref={newSessionDateInputRef}
                      placeholder="Date (e.g., 15 Aout - 15 Nov)"
                      className="flex-grow p-2 border rounded"
                    />
                    <button
                      onClick={addSession}
                      className="bg-gray-200 px-3 rounded"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {programForm.sessions.map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between items-center bg-gray-100 p-1 rounded text-sm"
                      >
                        <span>
                          {s.title} ({s.dateRange})
                        </span>
                        <button onClick={() => removeSession(s.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="mr-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProgram}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsPage;
