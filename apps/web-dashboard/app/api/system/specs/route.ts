import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { SystemSpecs } from '@/types/optimization';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const systemSpecs = await detectSystemSpecs();
    return NextResponse.json(systemSpecs);
  } catch (error) {
    console.error('Failed to detect system specs:', error);
    return NextResponse.json(
      { error: 'Failed to detect system specifications' },
      { status: 500 }
    );
  }
}

async function detectSystemSpecs(): Promise<SystemSpecs> {
  const platform = os.platform();
  
  // Get basic OS info
  const osInfo = {
    platform: platform === 'win32' ? 'Windows' : 
              platform === 'darwin' ? 'macOS' : 
              platform === 'linux' ? 'Linux' : platform,
    version: os.release(),
    architecture: os.arch()
  };

  // Get CPU info
  const cpuInfo = await getCpuInfo();
  
  // Get memory info
  const memoryInfo = await getMemoryInfo();
  
  // Get storage info
  const storageInfo = await getStorageInfo();
  
  // Get network info (basic for now)
  const networkInfo = await getNetworkInfo();

  return {
    cpu: cpuInfo,
    memory: memoryInfo,
    storage: storageInfo,
    network: networkInfo,
    os: osInfo
  };
}

async function getCpuInfo(): Promise<SystemSpecs['cpu']> {
  const cpus = os.cpus();
  const platform = os.platform();
  
  let cpuModel = cpus[0]?.model || 'Unknown CPU';
  let frequency = cpus[0]?.speed ? cpus[0].speed / 1000 : 0; // Convert MHz to GHz
  let actualCores = cpus.length;
  let threads = cpus.length;
  
  // Try to get more detailed CPU info on different platforms
  if (platform === 'win32') {
    try {
      const { stdout } = await execAsync('wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      if (lines.length > 0) {
        const cpuData = lines[0].split(',');
        if (cpuData.length >= 4) {
          frequency = parseInt(cpuData[1]) ? parseInt(cpuData[1]) / 1000 : frequency;
          cpuModel = cpuData[2] || cpuModel;
          actualCores = parseInt(cpuData[3]) || actualCores;
          threads = parseInt(cpuData[4]) || threads;
        }
      }
    } catch (error) {
      console.log('Failed to get detailed Windows CPU info:', error);
    }
  } else if (platform === 'linux') {
    try {
      // Get CPU model name
      const { stdout } = await execAsync('cat /proc/cpuinfo | grep "model name" | head -1');
      const modelMatch = stdout.match(/model name\s*:\s*(.+)/);
      if (modelMatch) {
        cpuModel = modelMatch[1].trim();
      }
      
      // Get CPU frequency - try multiple methods for WSL2/Linux
      if (frequency === 0) {
        try {
          // Method 1: Check current frequency
          const { stdout: freqStdout } = await execAsync('cat /proc/cpuinfo | grep "cpu MHz" | head -1');
          const freqMatch = freqStdout.match(/cpu MHz\s*:\s*(\d+\.?\d*)/);
          if (freqMatch) {
            frequency = parseFloat(freqMatch[1]) / 1000;
          }
        } catch (e) {
          console.log('Method 1 failed:', e);
        }
        
        // Method 2: Check max frequency from cpufreq
        if (frequency === 0) {
          try {
            const { stdout: maxFreqStdout } = await execAsync('cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq 2>/dev/null || echo "0"');
            const maxFreq = parseInt(maxFreqStdout.trim());
            if (maxFreq > 0) {
              frequency = maxFreq / 1000000; // Convert kHz to GHz
            }
          } catch (e) {
            console.log('Method 2 failed:', e);
          }
        }
        
        // Method 3: Parse base frequency from CPU model name
        if (frequency === 0) {
          const freqFromModel = extractFrequencyFromModel(cpuModel);
          if (freqFromModel > 0) {
            frequency = freqFromModel;
          }
        }
      }
      
      // Get actual core count vs thread count
      try {
        const { stdout: coreStdout } = await execAsync('cat /proc/cpuinfo | grep "cpu cores" | head -1');
        const coreMatch = coreStdout.match(/cpu cores\s*:\s*(\d+)/);
        if (coreMatch) {
          actualCores = parseInt(coreMatch[1]);
        }
        
        // For AMD processors, extract core count from model name if available
        if (cpuModel.includes('-Core')) {
          const coreFromModel = cpuModel.match(/(\d+)-Core/);
          if (coreFromModel) {
            actualCores = parseInt(coreFromModel[1]);
          }
        }
      } catch (error) {
        console.log('Failed to get core count:', error);
      }
      
    } catch (error) {
      console.log('Failed to get detailed Linux CPU info:', error);
    }
  }

  return {
    model: cpuModel,
    cores: actualCores,
    threads: threads,
    frequency: Math.round(frequency * 10) / 10,
    architecture: os.arch(),
    generation: determineCpuGeneration(cpuModel)
  };
}

// Helper function to extract frequency from CPU model name
function extractFrequencyFromModel(model: string): number {
  // Look for patterns like "3.7GHz", "4.2 GHz", etc.
  const ghzMatch = model.match(/(\d+\.?\d*)\s*GHz/i);
  if (ghzMatch) {
    return parseFloat(ghzMatch[1]);
  }
  
  // Look for known base frequencies for common processors
  const knownFrequencies: { [key: string]: number } = {
    '9950X3D': 4.2,
    '9950X': 4.7,
    '9900X': 4.4,
    '7950X3D': 4.2,
    '7950X': 4.5,
    '5950X': 3.4,
    '13900K': 3.0,
    '13700K': 3.4,
    '12900K': 3.2,
    '11900K': 3.5
  };
  
  for (const [cpu, freq] of Object.entries(knownFrequencies)) {
    if (model.includes(cpu)) {
      return freq;
    }
  }
  
  return 0;
}

async function getMemoryInfo(): Promise<SystemSpecs['memory']> {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const platform = os.platform();
  
  let memorySpeed = 0;
  let memoryType = 'Unknown';
  
  // Try to get memory details on different platforms
  if (platform === 'win32') {
    try {
      const { stdout } = await execAsync('wmic memorychip get Speed,MemoryType /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      if (lines.length > 0) {
        const memData = lines[0].split(',');
        if (memData.length >= 2) {
          memorySpeed = parseInt(memData[1]) || 0;
          const typeCode = parseInt(memData[0]) || 0;
          memoryType = getMemoryType(typeCode);
        }
      }
    } catch (error) {
      console.log('Failed to get detailed Windows memory info:', error);
    }
  } else if (platform === 'linux') {
    try {
      const { stdout } = await execAsync('sudo dmidecode -t memory | grep -E "(Speed|Type):" | head -2');
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        if (line.includes('Type:') && !line.includes('Error')) {
          memoryType = line.split(':')[1]?.trim() || 'Unknown';
        }
        if (line.includes('Speed:')) {
          const speedMatch = line.match(/(\d+)/);
          if (speedMatch) {
            memorySpeed = parseInt(speedMatch[1]);
          }
        }
      }
    } catch (error) {
      console.log('Failed to get detailed Linux memory info:', error);
    }
  }

  return {
    total: Math.round(totalMemory / (1024 * 1024 * 1024)), // Convert bytes to GB
    available: Math.round(freeMemory / (1024 * 1024 * 1024)), // Convert bytes to GB
    speed: memorySpeed,
    type: memoryType
  };
}

async function getStorageInfo(): Promise<SystemSpecs['storage']> {
  const platform = os.platform();
  let storageInfo = {
    type: 'Unknown' as 'HDD' | 'SSD' | 'NVMe',
    total: 0,
    available: 0,
    readSpeed: 0,
    writeSpeed: 0
  };

  if (platform === 'win32') {
    try {
      // Get disk info
      const { stdout } = await execAsync('wmic logicaldisk get Size,FreeSpace /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      if (lines.length > 0) {
        const diskData = lines[0].split(',');
        if (diskData.length >= 2) {
          const freeSpace = parseInt(diskData[0]) || 0;
          const totalSpace = parseInt(diskData[1]) || 0;
          
          storageInfo.total = Math.round(totalSpace / (1024 * 1024 * 1024)); // Convert to GB
          storageInfo.available = Math.round(freeSpace / (1024 * 1024 * 1024)); // Convert to GB
        }
      }

      // Try to determine if it's SSD or HDD
      const { stdout: diskStdout } = await execAsync('wmic diskdrive get MediaType /format:csv');
      const diskLines = diskStdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      if (diskLines.length > 0) {
        const mediaType = diskLines[0].split(',')[0];
        if (mediaType && mediaType.toLowerCase().includes('ssd')) {
          storageInfo.type = 'SSD';
          storageInfo.readSpeed = 500; // Estimated SSD speed
          storageInfo.writeSpeed = 450;
        } else {
          storageInfo.type = 'HDD';
          storageInfo.readSpeed = 120; // Estimated HDD speed
          storageInfo.writeSpeed = 100;
        }
      }
    } catch (error) {
      console.log('Failed to get Windows storage info:', error);
    }
  } else if (platform === 'linux') {
    try {
      // Get disk usage
      const { stdout } = await execAsync('df -BG / | tail -1');
      const diskData = stdout.split(/\s+/);
      
      if (diskData.length >= 4) {
        storageInfo.total = parseInt(diskData[1]) || 0;
        storageInfo.available = parseInt(diskData[3]) || 0;
      }

      // Try to determine storage type
      const { stdout: lsblkStdout } = await execAsync('lsblk -d -o NAME,ROTA | grep -v NAME');
      const storageLines = lsblkStdout.split('\n').filter(line => line.trim());
      
      if (storageLines.length > 0) {
        const rotational = storageLines[0].split(/\s+/)[1];
        if (rotational === '0') {
          storageInfo.type = 'SSD';
          storageInfo.readSpeed = 500;
          storageInfo.writeSpeed = 450;
        } else {
          storageInfo.type = 'HDD';
          storageInfo.readSpeed = 120;
          storageInfo.writeSpeed = 100;
        }
      }
    } catch (error) {
      console.log('Failed to get Linux storage info:', error);
    }
  }

  return storageInfo;
}

async function getNetworkInfo(): Promise<SystemSpecs['network']> {
  const networkInterfaces = os.networkInterfaces();
  
  // Find the primary network interface (not loopback)
  let primaryInterface = null;
  for (const [name, interfaces] of Object.entries(networkInterfaces)) {
    if (interfaces) {
      for (const interface_ of interfaces) {
        if (!interface_.internal && interface_.family === 'IPv4') {
          primaryInterface = interface_;
          break;
        }
      }
      if (primaryInterface) break;
    }
  }

  // For now, return basic network info
  // Real speed testing would require actual network tests
  return {
    downloadSpeed: 100, // Placeholder - would need real speed test
    uploadSpeed: 50,    // Placeholder - would need real speed test
    latency: 20,        // Placeholder - would need real ping test
    connectionType: 'Ethernet' // Placeholder - would need interface detection
  };
}

function determineCpuGeneration(model: string): string {
  const modelLower = model.toLowerCase();
  
  // Intel generations
  if (modelLower.includes('i7-14') || modelLower.includes('i5-14') || modelLower.includes('i3-14')) {
    return '14th Gen Intel';
  }
  if (modelLower.includes('i7-13') || modelLower.includes('i5-13') || modelLower.includes('i3-13')) {
    return '13th Gen Intel';
  }
  if (modelLower.includes('i7-12') || modelLower.includes('i5-12') || modelLower.includes('i3-12')) {
    return '12th Gen Intel';
  }
  if (modelLower.includes('i7-11') || modelLower.includes('i5-11') || modelLower.includes('i3-11')) {
    return '11th Gen Intel';
  }
  if (modelLower.includes('i7-10') || modelLower.includes('i5-10') || modelLower.includes('i3-10')) {
    return '10th Gen Intel';
  }
  
  // AMD generations - including latest Ryzen 9000 series
  if (modelLower.includes('ryzen 9 9') || modelLower.includes('ryzen 7 9') || modelLower.includes('ryzen 5 9')) {
    return 'AMD Ryzen 9000 (Zen 5)';
  }
  if (modelLower.includes('ryzen 9 8') || modelLower.includes('ryzen 7 8') || modelLower.includes('ryzen 5 8')) {
    return 'AMD Ryzen 8000 (Zen 4)';
  }
  if (modelLower.includes('ryzen 9 7') || modelLower.includes('ryzen 7 7') || modelLower.includes('ryzen 5 7')) {
    return 'AMD Ryzen 7000 (Zen 4)';
  }
  if (modelLower.includes('ryzen 9 5') || modelLower.includes('ryzen 7 5') || modelLower.includes('ryzen 5 5')) {
    return 'AMD Ryzen 5000 (Zen 3)';
  }
  if (modelLower.includes('ryzen 9 3') || modelLower.includes('ryzen 7 3') || modelLower.includes('ryzen 5 3')) {
    return 'AMD Ryzen 3000 (Zen 2)';
  }
  
  // Special detection for X3D variants
  if (modelLower.includes('x3d')) {
    if (modelLower.includes('9950x3d') || modelLower.includes('9900x3d')) {
      return 'AMD Ryzen 9000 X3D (Zen 5)';
    }
    if (modelLower.includes('7950x3d') || modelLower.includes('7900x3d')) {
      return 'AMD Ryzen 7000 X3D (Zen 4)';
    }
    if (modelLower.includes('5950x3d') || modelLower.includes('5900x3d')) {
      return 'AMD Ryzen 5000 X3D (Zen 3)';
    }
  }
  
  return 'Unknown';
}

function getMemoryType(typeCode: number): string {
  const memoryTypes: { [key: number]: string } = {
    20: 'DDR',
    21: 'DDR2',
    22: 'DDR2 FB-DIMM',
    24: 'DDR3',
    26: 'DDR4',
    34: 'DDR5'
  };
  
  return memoryTypes[typeCode] || 'Unknown';
}