#!/usr/bin/env node
/**
 * Examate DevOps CLI
 * Cross-platform development tooling for Docker Compose orchestration
 *
 * Replaces GNU Make + bash with pure Node.js for Windows/Linux compatibility
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}\n${'='.repeat(msg.length)}\n`),
};

// Project root
const ROOT = path.join(__dirname, '..');

// Required ports and their service names
const REQUIRED_PORTS = [
  { port: 27017, name: 'MongoDB' },
  { port: 6379, name: 'Redis' },
  { port: 5000, name: 'Auth Service' },
  { port: 5001, name: 'User Service' },
  { port: 5002, name: 'Dashboard Service' },
  { port: 5003, name: 'Statistics Service' },
  { port: 3000, name: 'Frontend (dev)' },
];

/**
 * Check if a port is available (cross-platform)
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port in use
      } else {
        resolve(true); // Other error, assume available
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true); // Port available
    });

    server.listen(port, '127.0.0.1');
  });
}

/**
 * Check all required ports
 */
async function checkPorts() {
  log.header('Checking Required Ports');

  let allFree = true;

  for (const { port, name } of REQUIRED_PORTS) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      log.success(`Port ${port} (${name}) is available`);
    } else {
      log.error(`Port ${port} (${name}) is already in use`);
      allFree = false;
    }
  }

  console.log();
  if (allFree) {
    log.success('All required ports are available!');
    return true;
  } else {
    log.error('Some ports are in use. Please stop the conflicting services.');
    return false;
  }
}

/**
 * Check if Docker is installed and running
 */
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    execSync('docker ps', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Docker Compose is installed (V2 preferred)
 */
function checkDockerCompose() {
  try {
    // Try V2 first (docker compose)
    execSync('docker compose version', { stdio: 'ignore' });
    return 'v2';
  } catch {
    try {
      // Fall back to V1 (docker-compose)
      execSync('docker-compose --version', { stdio: 'ignore' });
      return 'v1';
    } catch {
      return null;
    }
  }
}

/**
 * Get the appropriate docker compose command
 */
function getComposeCommand() {
  const version = checkDockerCompose();
  if (version === 'v2') return 'docker compose';
  if (version === 'v1') return 'docker-compose';
  return null;
}

/**
 * Setup environment files from examples
 */
function setupEnv() {
  log.header('Setting Up Environment Files');

  // Root .env
  const rootEnv = path.join(ROOT, '.env');
  const rootEnvExample = path.join(ROOT, '.env.example');

  if (!fs.existsSync(rootEnv) && fs.existsSync(rootEnvExample)) {
    fs.copyFileSync(rootEnvExample, rootEnv);
    log.success('Created root .env file');
    log.warn('Please edit .env and add your JWT secrets and email credentials');
  } else if (fs.existsSync(rootEnv)) {
    log.info('Root .env file already exists');
  }

  // Service .env files
  const services = ['auth-service', 'user-service', 'dashboard-service', 'statistics-service', 'frontend'];

  for (const service of services) {
    const servicePath = path.join(ROOT, 'services', service);
    const envFile = path.join(servicePath, '.env');
    const envExample = path.join(servicePath, '.env.example');

    if (fs.existsSync(envExample) && !fs.existsSync(envFile)) {
      fs.copyFileSync(envExample, envFile);
      log.success(`Created .env for ${service}`);
    } else if (fs.existsSync(envFile)) {
      log.info(`.env already exists for ${service}`);
    } else {
      log.warn(`No .env.example found for ${service}`);
    }
  }

  console.log();
  log.success('Environment setup complete!');
}

/**
 * Run docker compose with the appropriate command
 */
function runCompose(args, options = {}) {
  const composeCmd = getComposeCommand();
  if (!composeCmd) {
    log.error('Docker Compose is not installed!');
    process.exit(1);
  }

  const fullCommand = `${composeCmd} ${args}`;

  if (options.silent) {
    try {
      execSync(fullCommand, { cwd: ROOT, stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  } else {
    const [cmd, ...cmdArgs] = fullCommand.split(' ');
    const proc = spawn(cmd, cmdArgs, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('exit', (code) => {
      process.exit(code || 0);
    });
  }
}

/**
 * Command handlers
 */
const commands = {
  async setup() {
    log.header('Examate Development Setup');

    // Check Docker
    if (!checkDocker()) {
      log.error('Docker is not installed or not running');
      log.info('Please install Docker: https://docs.docker.com/get-docker/');
      process.exit(1);
    }
    log.success('Docker is installed and running');

    // Check Docker Compose
    const composeVersion = checkDockerCompose();
    if (!composeVersion) {
      log.error('Docker Compose is not installed');
      log.info('Please install Docker Compose');
      process.exit(1);
    }
    log.success(`Docker Compose ${composeVersion} is installed`);

    console.log();

    // Setup env files
    setupEnv();
  },

  async 'check-ports'() {
    const portsOk = await checkPorts();
    process.exit(portsOk ? 0 : 1);
  },

  async build() {
    log.info('Building all Docker images...\n');
    runCompose('--profile dev --profile prod build');
  },

  async up() {
    log.info('Starting all services (production mode)...\n');
    runCompose('--profile prod up -d');
  },

  async dev() {
    log.info('Starting all services (development mode with hot reload)...\n');
    runCompose('-f docker-compose.yml -f docker-compose.dev.yml --profile dev up');
  },

  async down() {
    log.info('Stopping all services...\n');
    runCompose('down');
  },

  async restart() {
    log.info('Restarting all services...\n');
    runCompose('restart');
  },

  async logs() {
    runCompose('logs -f');
  },

  async ps() {
    runCompose('ps');
  },

  async clean() {
    log.warn('This will stop services and remove all volumes (data will be lost)');
    log.info('Cleaning up...\n');
    runCompose('down -v');
    log.success('All services stopped and volumes removed');
  },

  help() {
    console.log(`
${colors.bold}Examate DevOps CLI${colors.reset}
${colors.blue}Cross-platform development tooling${colors.reset}

${colors.bold}USAGE:${colors.reset}
  node tools/dev-cli.js <command>
  npm run <command>

${colors.bold}COMMANDS:${colors.reset}
  ${colors.green}setup${colors.reset}         Initial setup (check Docker, create .env files)
  ${colors.green}check-ports${colors.reset}   Check if required ports are available
  ${colors.green}build${colors.reset}         Build all Docker images
  ${colors.green}up${colors.reset}            Start all services (production mode)
  ${colors.green}dev${colors.reset}           Start all services (development with hot reload)
  ${colors.green}dev:docker${colors.reset}    Alias for 'dev' - matches npm run dev:docker
  ${colors.green}down${colors.reset}          Stop all services
  ${colors.green}restart${colors.reset}       Restart all services
  ${colors.green}logs${colors.reset}          View logs from all services
  ${colors.green}ps${colors.reset}            Show running containers
  ${colors.green}clean${colors.reset}         Stop services and remove volumes
  ${colors.green}help${colors.reset}          Show this help message

${colors.bold}EXAMPLES:${colors.reset}
  npm run setup          # First-time setup
  npm run dev:docker     # Start development environment
  npm run logs           # View logs
  npm run clean          # Clean everything

${colors.bold}PORTS:${colors.reset}
  MongoDB:              27017
  Redis:                6379
  Auth Service:         5000
  User Service:         5001
  Dashboard Service:    5002
  Statistics Service:   5003
  Frontend (dev):       3000
  Frontend (prod):      8080

${colors.bold}TRADITIONAL MAKE:${colors.reset}
  You can still use 'make <command>' on Linux/Mac if preferred.
  The Node.js CLI is recommended for Windows compatibility.
`);
  },
};

// Alias dev:docker to dev
commands['dev:docker'] = commands.dev;

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2] || 'help';

  if (commands[command]) {
    await commands[command]();
  } else {
    log.error(`Unknown command: ${command}`);
    console.log(`Run 'node tools/dev-cli.js help' for usage information\n`);
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

main();
