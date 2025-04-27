import Editor from './components/Editor/Editor';
import { EditorProvider } from './context/EditorContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-blue-600">NoteNest</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto p-6">
          <EditorProvider>
            <Editor />
          </EditorProvider>
        </div>
      </main>
    </div>
  );
}

export default App;