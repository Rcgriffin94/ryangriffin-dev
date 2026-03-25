const options = [
  {
    id: 'manual',
    icon: '✏️',
    title: 'Enter manually',
    description: 'Type in the title, ingredients and steps yourself',
  },
  {
    id: 'photo',
    icon: '📷',
    title: 'Upload a photo',
    description: 'Take or upload a photo of a handwritten recipe card',
  },
  {
    id: 'url',
    icon: '🌐',
    title: 'Import from website',
    description: "Paste a URL and we'll pull the recipe automatically",
  },
];

export default function AddRecipeMethodPicker({
  onSelect,
  onClose,
}: {
  onSelect: (method: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-800">Add a Recipe</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4 space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 text-left transition"
            >
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{option.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
