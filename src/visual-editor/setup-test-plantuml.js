// Test script to create sample PlantUML files in localStorage
// Run this in the browser console to test PlantUML loading

console.log('Creating test PlantUML files for visual conversion testing...');

// Clear existing data first
localStorage.removeItem('ai-ley-puml-files');

// Remove existing PlantUML content
const keys = Object.keys(localStorage).filter(key => key.startsWith('puml-content-'));
keys.forEach(key => localStorage.removeItem(key));

// Test PlantUML files with different complexity levels
const testFiles = [
  {
    name: 'simple-flow.puml',
    path: '.ai-ley/shared/uml-flows/user/simple-flow.puml',
    content: `@startuml Simple Flow
!theme plain

title Simple Process Flow

rectangle "Start Process" as start
rectangle "Validate Data" as validate
rectangle "Process Data" as process
rectangle "Generate Output" as output
rectangle "End Process" as end

start --> validate
validate --> process : "valid"
process --> output
output --> end

@enduml`
  },
  {
    name: 'complex-workflow.puml',
    path: '.ai-ley/shared/uml-flows/user/complex-workflow.puml',
    content: `@startuml Complex Workflow
!theme plain

title Complex Business Workflow

actor "User" as user
rectangle "Login System" as login
database "User Database" as userdb
rectangle "Authentication" as auth
rectangle "Dashboard" as dash
rectangle "Profile Management" as profile
component "API Gateway" as api
cloud "External Service" as external

user --> login
login --> userdb : "check credentials"
userdb --> auth : "validate"
auth --> dash : "success"
dash --> profile
dash --> api
api --> external : "fetch data"
external --> api : "return data"
api --> dash : "display results"

@enduml`
  },
  {
    name: 'data-pipeline.puml', 
    path: '.ai-ley/shared/uml-flows/user/data-pipeline.puml',
    content: `@startuml Data Pipeline
!theme plain

title ETL Data Pipeline

folder "Raw Data Sources" as raw
rectangle "Data Ingestion" as ingest
rectangle "Data Validation" as validate
rectangle "Data Transformation" as transform
rectangle "Data Cleaning" as clean
database "Staging Database" as staging
rectangle "Data Processing" as process
database "Data Warehouse" as warehouse
rectangle "Generate Reports" as reports
rectangle "Data Visualization" as viz

raw --> ingest
ingest --> validate
validate --> transform : "valid data"
transform --> clean
clean --> staging
staging --> process
process --> warehouse
warehouse --> reports
warehouse --> viz

@enduml`
  }
];

// Create file metadata
const fileMetadata = testFiles.map(file => ({
  name: file.name,
  path: file.path,
  lastModified: new Date()
}));

// Store metadata
localStorage.setItem('ai-ley-puml-files', JSON.stringify(fileMetadata));

// Store PlantUML content for each file
testFiles.forEach(file => {
  localStorage.setItem(`puml-content-${file.path}`, file.content);
  console.log(`✓ Created test file: ${file.name}`);
});

console.log(`✅ Test setup complete! Created ${testFiles.length} PlantUML files.`);
console.log('📝 Files created:', fileMetadata.map(f => f.name));
console.log('🔄 Refresh the page to load these files as visual workflows.');

// Also log the PlantUML content for verification
testFiles.forEach(file => {
  console.log(`\n📄 ${file.name}:`);
  console.log(file.content);
});