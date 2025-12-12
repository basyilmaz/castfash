import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { QueueService } from '../queue/queue.service';
import { PromptService } from '../prompt/prompt.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    getAllConfigs: jest.fn(),
    getSystemConfig: jest.fn(),
    setSystemConfig: jest.fn(),
    getUsers: jest.fn(),
    getOrganizations: jest.fn(),
  };

  const mockQueueService = {
    getQueueStats: jest.fn(),
    getQueueJobStatus: jest.fn(),
  };

  const mockPromptService = {
    getPromptTemplates: jest.fn(),
    getPromptPresets: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
        {
          provide: PromptService,
          useValue: mockPromptService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
