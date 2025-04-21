const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const app = express();

const usersFile = path.join(__dirname, 'users.json');
const facesDir = path.join(__dirname, 'faces');
const scriptPath = path.join(__dirname, 'check_face.py');

app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// ลงทะเบียนใบหน้า
app.post('/register-face', async (req, res) => {
  const { userId, image } = req.body;
  if (!userId || !image) return res.status(400).json({ message: 'Missing data' });

  const imageData = image.replace(/^data:image\/jpeg;base64,/, '');
  const filename = path.join(facesDir, `${userId}.jpg`);
  fs.writeFileSync(filename, imageData, 'base64');

  let users = {};
  if (fs.existsSync(usersFile)) {
    const content = fs.readFileSync(usersFile, 'utf-8');
    if (content.trim()) {
      users = JSON.parse(content);
    }
  }

  users[userId] = { faceImage: filename };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: 'ลงทะเบียนสำเร็จ!' });
});

// เข้าสู่ระบบแบบไม่ต้องกรอก userId
app.post('/face-login', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: 'ไม่มีภาพใบหน้า' });

  const inputImage = image.replace(/^data:image\/jpeg;base64,/, '');
  const tempPath = path.join(facesDir, 'temp-login.jpg');
  fs.writeFileSync(tempPath, inputImage, 'base64');

  const faceFiles = fs.readdirSync(facesDir).filter(f => f.endsWith('.jpg') && !f.startsWith('temp-'));
  let matchedUser = null;

  const runCompare = (index) => {
    if (index >= faceFiles.length) {
      fs.unlinkSync(tempPath);
      if (matchedUser) {
        res.json({ success: true, user: matchedUser, message: `ยินดีต้อนรับคุณ ${matchedUser}` });
      } else {
        res.json({ success: false, message: 'ไม่รู้จักใบหน้านี้' });
      }
      return;
    }

    const userFile = faceFiles[index];
    const knownPath = path.join(facesDir, userFile);
    const python = spawn('python3', [scriptPath, knownPath, tempPath]);

    let output = '';
    python.stdout.on('data', (data) => output += data.toString());
    python.stderr.on('data', (data) => console.error('[PYTHON ERROR]', data.toString()));

    python.on('close', () => {
      if (output.includes('True')) {
        matchedUser = path.basename(userFile, '.jpg');
      }
      runCompare(index + 1);
    });
  };

  runCompare(0);
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
