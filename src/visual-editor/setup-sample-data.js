// Browser console commands to set up sample UML data

console.log('Setting up sample UML data for testing...');

// Clear any existing data first
console.log('Clearing existing localStorage data...');
localStorage.removeItem("ai-ley-puml-files");

// For now, let's start with no UML files to test the default tab creation
console.log('Setting empty PUML files list to test default behavior...');
localStorage.setItem("ai-ley-puml-files", JSON.stringify([]));

console.log('Sample data setup complete! The app should create a default "Welcome" tab.');
console.log('Refresh the page to test the tab system.');