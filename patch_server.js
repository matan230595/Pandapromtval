import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const importAdmin = `import * as admin from 'firebase-admin';\nimport firebaseConfig from './firebase-applet-config.json' with { type: 'json' };\n\nadmin.initializeApp({ projectId: firebaseConfig.projectId });\n`;

content = content.replace('import dotenv from "dotenv";', importAdmin + 'import dotenv from "dotenv";');

const middleware = `
  // Authentication Middleware
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  app.use('/api/gemini', authMiddleware);
`;

content = content.replace('app.use(express.json({ limit: "50mb" }));', 'app.use(express.json({ limit: "50mb" }));\n' + middleware);

fs.writeFileSync('server.ts', content);
