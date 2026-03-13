#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();
const args = new Set(process.argv.slice(2));

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function printHelp() {
  console.log(`
Seed de dados demo

Uso:
  npm run db:seed

Opcoes:
  --help     Exibe esta ajuda
  --dry-run  Mostra o que seria populado sem gravar no banco
`.trim());
}

async function seedClients() {
  const clients = [
    { id: 'virtuagil', name: 'Virtuagil Demo' },
    { id: 'cliente_teste', name: 'Cliente de Teste' },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: { name: client.name },
      create: client,
    });
  }
}

async function seedDevices() {
  const devices = [
    {
      id: 'freezer_01',
      clientId: 'virtuagil',
      name: 'Freezer Camara 01',
      location: 'Deposito A',
      minTemperature: -25,
      maxTemperature: -12,
    },
    {
      id: 'freezer_02',
      clientId: 'virtuagil',
      name: 'Freezer Camara 02',
      location: 'Deposito B',
      minTemperature: -22,
      maxTemperature: -10,
    },
    {
      id: 'geladeira_01',
      clientId: 'cliente_teste',
      name: 'Geladeira Exposicao',
      location: 'Loja Frente',
      minTemperature: 2,
      maxTemperature: 8,
    },
  ];

  for (const device of devices) {
    await prisma.device.upsert({
      where: { id: device.id },
      update: {
        clientId: device.clientId,
        name: device.name,
        location: device.location,
        minTemperature: device.minTemperature,
        maxTemperature: device.maxTemperature,
        isOffline: false,
      },
      create: {
        ...device,
        isOffline: false,
      },
    });
  }
}

async function seedAlertRules() {
  const rules = [
    {
      clientId: 'virtuagil',
      deviceId: 'freezer_01',
      sensorType: 'temperature',
      minValue: -25,
      maxValue: -12,
      cooldownMinutes: 5,
      toleranceMinutes: 1,
      enabled: true,
    },
    {
      clientId: 'virtuagil',
      deviceId: 'freezer_02',
      sensorType: 'temperature',
      minValue: -22,
      maxValue: -10,
      cooldownMinutes: 5,
      toleranceMinutes: 1,
      enabled: true,
    },
    {
      clientId: 'cliente_teste',
      deviceId: 'geladeira_01',
      sensorType: 'temperature',
      minValue: 2,
      maxValue: 8,
      cooldownMinutes: 10,
      toleranceMinutes: 2,
      enabled: true,
    },
  ];

  for (const rule of rules) {
    const existing = await prisma.alertRule.findFirst({
      where: {
        clientId: rule.clientId,
        deviceId: rule.deviceId,
        sensorType: rule.sensorType,
      },
    });

    if (existing) {
      await prisma.alertRule.update({
        where: { id: existing.id },
        data: rule,
      });
      continue;
    }

    await prisma.alertRule.create({
      data: rule,
    });
  }
}

async function seedTemperatureHistory() {
  const devices = [
    { id: 'freezer_01', base: -18, variation: 2.5 },
    { id: 'freezer_02', base: -15, variation: 3.0 },
    { id: 'geladeira_01', base: 5, variation: 1.2 },
  ];

  for (const device of devices) {
    const count = await prisma.temperatureLog.count({
      where: { deviceId: device.id },
    });

    if (count > 0) {
      continue;
    }

    const rows = Array.from({ length: 24 }).map((_, index) => {
      const createdAt = new Date(Date.now() - (24 - index) * 60 * 60 * 1000);
      const wave = Math.sin(index / 3) * device.variation;
      const noise = (Math.random() - 0.5) * 0.6;

      return {
        deviceId: device.id,
        temperature: Number((device.base + wave + noise).toFixed(2)),
        createdAt,
      };
    });

    await prisma.temperatureLog.createMany({
      data: rows,
    });

    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeen: new Date(),
        isOffline: false,
        offlineSince: null,
      },
    });
  }
}

async function seedUsers() {
  const users = [
    {
      email: 'admin@virtuagil.com.br',
      name: 'Administrador Virtuagil',
      clientId: 'virtuagil',
      role: 'admin',
      phone: '31988887777',
      password: 'virtuagil123',
    },
    {
      email: 'operator@virtuagil.com.br',
      name: 'Operador Virtuagil',
      clientId: 'virtuagil',
      role: 'operator',
      phone: '31999996666',
      password: 'operador123',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        clientId: user.clientId,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isActive: true,
      },
      create: {
        clientId: user.clientId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: true,
        passwordHash: hashPassword(user.password),
      },
    });
  }
}

async function seedActuators() {
  const actuators = [
    {
      id: 'sauna_main',
      clientId: 'virtuagil',
      deviceId: 'freezer_01',
      name: 'Sauna principal',
      location: 'Area molhada',
      currentState: 'off',
      lastCommandAt: null,
      lastCommandBy: null,
    },
    {
      id: 'exaustor_lab',
      clientId: 'virtuagil',
      deviceId: 'freezer_02',
      name: 'Exaustor laboratorio',
      location: 'Laboratorio',
      currentState: 'on',
      lastCommandAt: new Date(Date.now() - 20 * 60 * 1000),
      lastCommandBy: 'seed',
    },
  ];

  for (const actuator of actuators) {
    await prisma.actuator.upsert({
      where: { id: actuator.id },
      update: {
        clientId: actuator.clientId,
        deviceId: actuator.deviceId,
        name: actuator.name,
        location: actuator.location,
        currentState: actuator.currentState,
        lastCommandAt: actuator.lastCommandAt,
        lastCommandBy: actuator.lastCommandBy,
      },
      create: actuator,
    });
  }
}

async function seedActuationCommands() {
  const commandCount = await prisma.actuationCommand.count();

  if (commandCount > 0) {
    return;
  }

  const now = Date.now();
  const commands = [
    {
      actuatorId: 'sauna_main',
      clientId: 'virtuagil',
      desiredState: 'on',
      source: 'seed',
      note: 'Aquecimento inicial',
      executedAt: new Date(now - 90 * 60 * 1000),
    },
    {
      actuatorId: 'sauna_main',
      clientId: 'virtuagil',
      desiredState: 'off',
      source: 'seed',
      note: 'Encerramento automatico',
      executedAt: new Date(now - 45 * 60 * 1000),
    },
    {
      actuatorId: 'exaustor_lab',
      clientId: 'virtuagil',
      desiredState: 'on',
      source: 'seed',
      note: 'Ventilacao preventiva',
      executedAt: new Date(now - 20 * 60 * 1000),
    },
  ];

  await prisma.actuationCommand.createMany({
    data: commands,
  });
}

async function main() {
  if (args.has('--help')) {
    printHelp();
    return;
  }

  if (args.has('--dry-run')) {
    console.log(
      '[seed] dry-run: seriam criados/atualizados 2 clients, 3 devices, 3 alert-rules, 2 users, 2 actuators, 3 actuation-commands e 24 leituras por device sem historico.',
    );
    return;
  }

  console.log('[seed] iniciando carga de dados demo...');

  await seedClients();
  await seedDevices();
  await seedAlertRules();
  await seedUsers();
  await seedTemperatureHistory();
  await seedActuators();
  await seedActuationCommands();

  console.log('[seed] concluido com sucesso.');
}

main()
  .catch((error) => {
    console.error('[seed] falha ao popular banco:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
