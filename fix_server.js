import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// replace admin.auth().verifyIdToken with getAuth().verifyIdToken
content = content.replace("import * as admin from 'firebase-admin';", "import * as admin from 'firebase-admin';\nimport { getAuth } from 'firebase-admin/auth';");
content = content.replace('admin.auth().verifyIdToken(idToken)', 'getAuth().verifyIdToken(idToken)');

fs.writeFileSync('server.ts', content);
