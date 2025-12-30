import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// archiver を使わずに、adm-zip を使用
// もしくは PowerShell の Compress-Archive を使用

interface Manifest {
  version: string;
  [key: string]: unknown;
}

async function packageExtension(): Promise<void> {
  const rootDir = path.resolve(__dirname, '..');
  const manifestPath = path.join(rootDir, 'public', 'manifest.json');
  const distDir = path.join(rootDir, 'dist');
  const appPackagesDir = path.join(rootDir, 'appPackages');

  // manifest.json からバージョンを読み取る
  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const version = manifest.version;

  // appPackages ディレクトリを作成
  if (!fs.existsSync(appPackagesDir)) {
    fs.mkdirSync(appPackagesDir, { recursive: true });
  }

  const zipFileName = `appPackage-v${version}.zip`;
  const zipFilePath = path.join(appPackagesDir, zipFileName);

  // PowerShell を使用して ZIP を作成
  
  try {
    // 既存のZIPファイルがあれば削除
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
      console.log(`Removed existing ${zipFileName}`);
    }

    // PowerShell の Compress-Archive を使用
    const command = `Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipFilePath}" -Force`;
    execSync(command, { stdio: 'inherit', shell: 'powershell.exe' });
    
    console.log(`✓ Successfully packaged: ${zipFileName}`);
    console.log(`  Location: ${zipFilePath}`);
  } catch (error) {
    console.error('Error creating package:', error);
    process.exit(1);
  }
}

packageExtension();
