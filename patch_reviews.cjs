const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { ReviewsSection } from "./components/ReviewsSection";\n`;
code = code.replace(/import \{ PromptTester \} from "\.\/components\/PromptTester";/, importStatement + `import { PromptTester } from "./components/PromptTester";`);

// Add onSaveReview handler
const regexHandleSave = /const handleSave = async \(promptData: Partial<Prompt>\) => \{/;
const replacementHandleSave = `const handleSaveReview = (review: Review) => {
    if (!selectedPrompt) return;
    const currentReviews = selectedPrompt.reviews || [];
    handleSave({
      ...selectedPrompt,
      reviews: [...currentReviews, review]
    });
  };

  const handleSave = async (promptData: Partial<Prompt>) => {`;
code = code.replace(regexHandleSave, replacementHandleSave);

// Integrate ReviewsSection in the UI right below notes
const regexNotes = /<\/div>\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\) : null\}/;
const replacementNotes = `</div>
                          <ReviewsSection prompt={selectedPrompt} onSaveReview={handleSaveReview} />
                        </div>
                      )}
                    </div>
                  ) : null}`;
code = code.replace(regexNotes, replacementNotes);

fs.writeFileSync('src/App.tsx', code);
