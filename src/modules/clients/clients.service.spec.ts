import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let fakePrisma: any;

  beforeEach(async () => {
    fakePrisma = {
      client: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should create client', async () => {
    fakePrisma.client.findUnique.mockResolvedValue(null);
    fakePrisma.client.findFirst.mockResolvedValue(null);
    fakePrisma.client.create.mockResolvedValue({
      id: 'client_a',
      name: 'Client A',
      status: 'active',
      adminName: 'Ana Gestora',
      document: '11222333000181',
      adminPhone: '5531999999999',
      billingPhone: '5531988887777',
      billingEmail: 'financeiro@clientea.com',
    });
    const result = await service.create({
      id: 'client_a',
      name: 'Client A',
      adminName: 'Ana Gestora',
      document: '11.222.333/0001-81',
      adminPhone: '(31) 99999-9999',
      billingPhone: '(31) 98888-7777',
      billingEmail: 'financeiro@clientea.com',
    });
    expect(fakePrisma.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'client_a',
        name: 'Client A',
        adminName: 'Ana Gestora',
        document: '11222333000181',
        adminPhone: '5531999999999',
        billingPhone: '5531988887777',
        billingEmail: 'financeiro@clientea.com',
        status: 'active',
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'client_a',
        name: 'Client A',
        status: 'active',
        billingEmail: 'financeiro@clientea.com',
      }),
    );
  });

  it('should throw not found when client does not exist', async () => {
    fakePrisma.client.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should include duplicated client name and id when phone already exists', async () => {
    fakePrisma.client.findUnique.mockResolvedValue(null);
    fakePrisma.client.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'cliente-duplicado',
        name: 'Cliente Duplicado',
      });

    await expect(
      service.create({
        id: 'client_novo',
        name: 'Client Novo',
        adminName: 'Novo Admin',
        document: '11.222.333/0001-81',
        adminPhone: '(31) 99999-9999',
        billingPhone: '(31) 98888-7777',
        billingEmail: 'financeiro@clientenovo.com',
      }),
    ).rejects.toMatchObject<Partial<ConflictException>>({
      message:
        'Ja existe um cliente com este telefone: Cliente Duplicado (cliente-duplicado). Campos: Contato do administrador, WhatsApp principal para alertas. [field:adminPhone|alertPhone]',
    });
  });
});
