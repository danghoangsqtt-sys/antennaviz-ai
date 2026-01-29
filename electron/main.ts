import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Khai báo biến global (chỉ dùng let và không khởi tạo ngay)
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // 2. Khởi tạo cửa sổ bên trong hàm createWindow
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    // Cấu hình icon cho cửa sổ (Taskbar)
    icon: path.join(__dirname, '../public/icon.png'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f8fafc'
  });

  // 3. Tải nội dung ứng dụng
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 4. Chỉ chạy khi app đã sẵn sàng
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});