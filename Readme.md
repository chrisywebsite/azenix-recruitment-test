# This repo implements 2 endpoints via Google Firebase Functions
# Source code are put under functions/src/index.ts

# requirements:
- nvm use 14.17
- npm install -g firebase-tools
- firebase project is set up on Google Clouds, Functions and Firestore is used. 

# To run it locally
- cd functions && npm run serve

# deploy functions
firebase deploy --only functions

# Delete functions
### Delete all functions that match the specified name in all regions.
firebase functions:delete myFunction

### Delete a specified function running in a specific region.
firebase functions:delete myFunction --region us-east-1

### Delete more than one function
firebase functions:delete helloWorld shorten expand

### Delete a specified functions group.
firebase functions:delete groupA

### Bypass the confirmation prompt.
firebase functions:delete myFunction --force

# Reference: 
- https://firebase.google.com/docs/functions/manage-functions
- unit tests: https://firebase.google.com/docs/functions/unit-testing#testing_http_functions
- best practices: https://firebase.google.com/docs/functions/organize-functions
