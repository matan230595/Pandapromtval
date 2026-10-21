const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const editorStart = appTsx.indexOf('{isEditing ? (');
const editorEnd = appTsx.indexOf(') : selectedPrompt ? (');

if (editorStart !== -1 && editorEnd !== -1) {
  const replacement = `{isEditing ? (
    <PromptEditor 
      editingPrompt={editingPrompt}
      setEditingPrompt={setEditingPrompt}
      isRefining={isRefining}
      handleRefinePrompt={handleRefinePrompt}
      showInlineDiff={showInlineDiff}
      setShowInlineDiff={setShowInlineDiff}
      handleSave={handleSave}
      handleSaveAsNew={handleSaveAsNew}
      tags={tags}
      folders={folders}
      setIsNewFolderModalOpen={setIsNewFolderModalOpen}
      platforms={platforms}
      prompts={prompts}
      checkPromptValidation={checkPromptValidation}
      smartVariables={smartVariables}
      handleVarSelect={handleVarSelect}
      t={t}
      setIsRefining={setIsRefining}
      setIsEditing={setIsEditing}
      setSelectedPromptId={setSelectedPromptId}
      setCurrentView={setCurrentView}
      showToast={showToast}
      handleMagicSuggest={handleMagicSuggest}
      isMagicSuggesting={isMagicSuggesting}
      magicSuggestions={magicSuggestions}
      setMagicSuggestions={setMagicSuggestions}
      handleContentChange={handleContentChange}
      varSuggest={varSuggest}
      COMMON_VARS={COMMON_VARS}
      mlSuggestedFolder={mlSuggestedFolder}
      handleAutoTag={handleAutoTag}
      isAutoTagging={isAutoTagging}
      allTags={allTags}
    />
  `;
  
  const newAppTsx = appTsx.substring(0, editorStart) + replacement + appTsx.substring(editorEnd);
  
  const withImport = newAppTsx.replace(
    'import { PromptTester } from "./components/PromptTester";',
    'import { PromptTester } from "./components/PromptTester";\nimport { PromptEditor } from "./components/PromptEditor";'
  );
  
  fs.writeFileSync('src/App.tsx', withImport);
  console.log("App.tsx patched successfully!");
} else {
  console.log("Could not find boundaries");
}
