// Browser console script to set up sample UML flows for testing auto-loading

console.log('Setting up sample UML flows for auto-loading test...');

// Sample UML files to create
const sampleFlows = [
  {
    name: 'user-registration.puml',
    path: '.ai-ley/shared/uml-flows/user/user-registration.puml',
    content: `@startuml User Registration
!theme plain

title User Registration Flow

rectangle "Start Registration" as start
rectangle "Validate Email" as validate
rectangle "Create Account" as create
rectangle "Send Welcome Email" as email
rectangle "Complete Registration" as complete

start --> validate
validate --> create : "email valid"
create --> email
email --> complete

@enduml`
  },
  {
    name: 'order-processing.puml',
    path: '.ai-ley/shared/uml-flows/user/order-processing.puml',
    content: `@startuml Order Processing
!theme plain

title E-commerce Order Processing

rectangle "Receive Order" as receive
rectangle "Validate Payment" as payment
rectangle "Check Inventory" as inventory
rectangle "Ship Order" as ship
rectangle "Send Confirmation" as confirm

receive --> payment
payment --> inventory : "payment ok"
inventory --> ship : "in stock"
ship --> confirm

@enduml`
  },
  {
    name: 'data-pipeline.puml',
    path: '.ai-ley/shared/uml-flows/user/data-pipeline.puml',
    content: `@startuml Data Pipeline
!theme plain

title Data Processing Pipeline

rectangle "Data Ingestion" as ingest
rectangle "Data Cleaning" as clean
rectangle "Data Transform" as transform
database "Data Warehouse" as warehouse
rectangle "Generate Reports" as reports

ingest --> clean
clean --> transform
transform --> warehouse : "store clean data"
warehouse --> reports

@enduml`
  }
];

// Clear existing data
console.log('Clearing existing data...');
localStorage.removeItem('ai-ley-puml-files');

// Store the file metadata
const fileMetadata = sampleFlows.map(flow => ({
  name: flow.name,
  path: flow.path,
  lastModified: new Date()
}));

localStorage.setItem('ai-ley-puml-files', JSON.stringify(fileMetadata));

// Store the UML content for each file
sampleFlows.forEach(flow => {
  localStorage.setItem(`puml-content-${flow.path}`, flow.content);
  console.log(`Created sample flow: ${flow.name}`);
});

console.log(`Sample data setup complete! Created ${sampleFlows.length} sample UML flows.`);
console.log('File list:', fileMetadata.map(f => f.name));
console.log('Refresh the page to see the auto-loaded tabs.');